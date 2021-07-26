import { build, InlineConfig, mergeConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import { promises as fs } from 'fs'
import path from 'path'
import { getEntryPoint, resolveViteConfig } from '../config'
import { buildHtmlDocument } from './utils'
import type { RollupOutput, RollupWatcher, OutputAsset } from 'rollup'

type BuildOptions = {
  clientOptions?: InlineConfig
  serverOptions?: InlineConfig & { packageJson?: Record<string, unknown> }
}

export = async ({
  clientOptions = {},
  serverOptions = {},
}: BuildOptions = {}) =>
  new Promise(async (resolve) => {
    const viteConfig = await resolveViteConfig()
    const distDir =
      viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist')

    let indexHtmlTemplate = ''

    const clientBuildOptions = mergeConfig(
      {
        build: {
          outDir: path.resolve(distDir, 'client'),
          ssrManifest: true,
          emptyOutDir: false,
        },
      } as InlineConfig,
      clientOptions
    ) as NonNullable<BuildOptions['clientOptions']>

    const serverBuildOptions = mergeConfig(
      {
        publicDir: false, // No need to copy public files to SSR directory
        build: {
          outDir: path.resolve(distDir, 'server'),
          // The plugin is already changing the vite-ssr alias to point to the server-entry.
          // Therefore, here we can just use the same entry point as in the index.html
          ssr: await getEntryPoint(viteConfig.root),
          emptyOutDir: false,
          rollupOptions: {
            plugins: [
              replace({
                preventAssignment: true,
                values: {
                  __VITE_SSR_HTML__: () => buildHtmlDocument(indexHtmlTemplate),
                },
              }),
            ],
          },
        },
      } as InlineConfig,
      serverOptions
    ) as NonNullable<BuildOptions['serverOptions']>

    const clientResult = await build(clientBuildOptions)

    const isWatching = Object.prototype.hasOwnProperty.call(
      clientResult,
      '_maxListeners'
    )

    if (isWatching) {
      // This is a build watcher
      const watcher = clientResult as RollupWatcher
      let resolved = false

      // @ts-ignore
      watcher.on('event', async ({ result }) => {
        if (result) {
          // This piece runs everytime there is
          // an updated frontend bundle.
          result.close()

          // Re-read the index.html in case it changed.
          // This content is not included in the virtual bundle.
          indexHtmlTemplate = await fs.readFile(
            (clientBuildOptions.build?.outDir as string) + '/index.html',
            'utf-8'
          )

          // Build SSR bundle with the new index.html
          await build(serverBuildOptions)
          await generatePackageJson(clientBuildOptions, serverBuildOptions)

          if (!resolved) {
            resolve(null)
            resolved = true
          }
        }
      })
    } else {
      // This is a normal one-off build
      const clientOutputs = (
        Array.isArray(clientResult)
          ? clientResult
          : [clientResult as RollupOutput]
      ).flatMap((result) => result.output)

      // Get the index.html from the resulting bundle.
      indexHtmlTemplate = (
        clientOutputs.find(
          (file) => file.type === 'asset' && file.fileName === 'index.html'
        ) as OutputAsset
      )?.source as string

      await build(serverBuildOptions)

      // index.html file is not used in SSR and might be
      // served by mistake, so let's remove it to avoid issues.
      await fs
        .unlink(
          path.join(clientBuildOptions.build?.outDir as string, 'index.html')
        )
        .catch(() => null)

      await generatePackageJson(clientBuildOptions, serverBuildOptions)

      resolve(null)
    }
  })

async function generatePackageJson(
  clientBuildOptions: InlineConfig,
  serverBuildOptions: NonNullable<BuildOptions['serverOptions']>
) {
  const type =
    // @ts-ignore
    serverBuildOptions.build?.rollupOptions?.output?.format === 'es'
      ? 'module'
      : 'commonjs'

  const packageJson = {
    type,
    main: path.parse(serverBuildOptions.build?.ssr as string).name + '.js',
    ssr: {
      // This can be used later to serve static assets
      assets: (
        await fs.readdir(clientBuildOptions.build?.outDir as string)
      ).filter((file) => !/(index\.html|manifest\.json)$/i.test(file)),
    },
    ...(serverBuildOptions.packageJson || {}),
  }

  await fs.writeFile(
    path.join(serverBuildOptions.build?.outDir as string, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  )
}
