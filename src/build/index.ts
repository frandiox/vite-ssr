import { build, InlineConfig, ResolvedConfig, mergeConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import { promises as fs } from 'fs'
import path from 'path'
import {
  getEntryPoint,
  getPluginOptions,
  INDEX_HTML,
  resolveViteConfig,
  BuildOptions,
} from '../config'
import { buildHtmlDocument } from './utils'
import type { RollupOutput, RollupWatcher, OutputAsset } from 'rollup'

export = async (inlineBuildOptions: BuildOptions = {}) =>
  new Promise(async (resolve) => {
    const viteConfig = await resolveViteConfig()

    const distDir =
      viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist')

    const { input: inputFilePath = '', build: pluginBuildOptions = {} } =
      getPluginOptions(viteConfig)

    const defaultFilePath = path.resolve(viteConfig.root, INDEX_HTML)
    const inputFileName = inputFilePath.split('/').pop() || INDEX_HTML

    let indexHtmlTemplate = ''

    const clientBuildOptions = mergeConfig(
      {
        build: {
          outDir: path.resolve(distDir, 'client'),
          ssrManifest: true,
          emptyOutDir: false,

          // Custom input path
          rollupOptions:
            inputFilePath && inputFilePath !== defaultFilePath
              ? {
                  input: inputFilePath,
                  plugins: [
                    inputFileName !== INDEX_HTML && {
                      generateBundle(options, bundle) {
                        // Rename custom name to index.html
                        const htmlAsset = bundle[inputFileName]
                        delete bundle[inputFileName]
                        htmlAsset.fileName = INDEX_HTML
                        bundle[INDEX_HTML] = htmlAsset
                      },
                    },
                  ],
                }
              : {},
        },
      } as InlineConfig,
      mergeConfig(
        pluginBuildOptions.clientOptions || {},
        inlineBuildOptions.clientOptions || {}
      )
    ) as NonNullable<BuildOptions['clientOptions']>

    const serverBuildOptions = mergeConfig(
      {
        publicDir: false, // No need to copy public files to SSR directory
        build: {
          outDir: path.resolve(distDir, 'server'),
          // The plugin is already changing the vite-ssr alias to point to the server-entry.
          // Therefore, here we can just use the same entry point as in the index.html
          ssr: await getEntryPoint(viteConfig),
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
      mergeConfig(
        pluginBuildOptions.serverOptions || {},
        inlineBuildOptions.serverOptions || {}
      )
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
            (clientBuildOptions.build?.outDir as string) + `/${INDEX_HTML}`,
            'utf-8'
          )

          // Build SSR bundle with the new index.html
          await build(serverBuildOptions)
          await generatePackageJson(
            viteConfig,
            clientBuildOptions,
            serverBuildOptions
          )

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
          (file) => file.type === 'asset' && file.fileName === INDEX_HTML
        ) as OutputAsset
      )?.source as string

      await build(serverBuildOptions)

      // index.html file is not used in SSR and might be
      // served by mistake.
      // Let's remove it unless the user overrides this behavior.
      if (!pluginBuildOptions.keepIndexHtml) {
        await fs
          .unlink(
            path.join(clientBuildOptions.build?.outDir as string, 'index.html')
          )
          .catch(() => null)
      }

      await generatePackageJson(
        viteConfig,
        clientBuildOptions,
        serverBuildOptions
      )

      resolve(null)
    }
  })

async function generatePackageJson(
  viteConfig: ResolvedConfig,
  clientBuildOptions: InlineConfig,
  serverBuildOptions: NonNullable<BuildOptions['serverOptions']>
) {
  if (serverBuildOptions.packageJson === false) return

  const ssr = (viteConfig.build?.ssr || serverBuildOptions.build?.ssr) as string
  const format = ((viteConfig.build?.rollupOptions?.output as any)?.format ||
    (serverBuildOptions.build?.rollupOptions?.output as any)?.format) as string

  const packageJson = {
    main: path.parse(ssr).name + '.js',
    type: /^esm?$/i.test(format || '') ? 'module' : 'commonjs',
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
