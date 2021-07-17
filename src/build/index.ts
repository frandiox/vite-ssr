import { build, InlineConfig, mergeConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import { promises as fs } from 'fs'
import path from 'path'
import { getEntryPoint, resolveViteConfig } from '../config'
import { buildHtmlDocument } from './utils'
import type { RollupOutput, OutputAsset } from 'rollup'

type BuildOptions = {
  clientOptions?: InlineConfig
  serverOptions?: InlineConfig & { packageJson?: Record<string, unknown> }
}

export = async ({
  clientOptions = {},
  serverOptions = {},
}: BuildOptions = {}) => {
  const viteConfig = await resolveViteConfig()
  const distDir =
    viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist')

  const clientBuildOptions = mergeConfig(
    {
      build: {
        outDir: path.resolve(distDir, 'client'),
        ssrManifest: true,
      },
    },
    clientOptions
  ) as NonNullable<BuildOptions['clientOptions']>

  const clientResult = (await build(clientBuildOptions)) as
    | RollupOutput
    | RollupOutput[]

  const clientOutputs = (
    Array.isArray(clientResult) ? clientResult : [clientResult]
  ).flatMap((result) => result.output)

  const indexHtml = clientOutputs.find(
    (file) => file.type === 'asset' && file.fileName === 'index.html'
  ) as OutputAsset

  // -- SSR build
  const serverBuildOptions = mergeConfig(
    {
      build: {
        outDir: path.resolve(distDir, 'server'),
        // The plugin is already changing the vite-ssr alias to point to the server-entry.
        // Therefore, here we can just use the same entry point as in the index.html
        ssr: await getEntryPoint(viteConfig.root),
        rollupOptions: {
          plugins: [
            replace({
              preventAssignment: true,
              values: {
                __VITE_SSR_HTML__: buildHtmlDocument(
                  indexHtml.source as string
                ),
              },
            }),
          ],
        },
      },
    },
    serverOptions
  ) as NonNullable<BuildOptions['serverOptions']>

  await build(serverBuildOptions)

  // --- Generate package.json
  const type =
    // @ts-ignore
    serverBuildOptions.build?.rollupOptions?.output?.format === 'es'
      ? 'module'
      : 'commonjs'

  // index.html is not used in SSR and might be served by mistake
  await fs
    .unlink(path.join(clientBuildOptions.build?.outDir as string, 'index.html'))
    .catch(() => null)

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
    JSON.stringify(packageJson, null, 2)
  )
}
