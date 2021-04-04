import { build, InlineConfig, mergeConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import { promises as fs } from 'fs'
import path from 'path'
import { getEntryPoint } from './config'
import type { RollupOutput, OutputAsset } from 'rollup'

type BuildOptions = {
  clientOptions?: InlineConfig
  serverOptions?: InlineConfig & { packageJson?: Record<string, unknown> }
}

export = async ({
  clientOptions = {},
  serverOptions = {},
}: BuildOptions = {}) => {
  const clientBuildOptions = mergeConfig(
    {
      build: {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        manifest: true,
        ssrManifest: true,
      },
    },
    clientOptions
  ) as NonNullable<BuildOptions['clientOptions']>

  const clientResult = (await build(clientBuildOptions)) as RollupOutput

  const indexHtml = clientResult.output.find(
    (file) => file.type === 'asset' && file.fileName === 'index.html'
  ) as OutputAsset

  // -- SSR build
  const serverBuildOptions = mergeConfig(
    {
      build: {
        outDir: path.resolve(process.cwd(), 'dist/server'),
        // The plugin is already changing the vite-ssr alias to point to the server-entry.
        // Therefore, here we can just use the same entry point as in the index.html
        ssr: await getEntryPoint(),
        rollupOptions: {
          plugins: [
            replace({
              __VITE_SSR_HTML__: (indexHtml.source as string)
                .replace('<html', '<html ${htmlAttrs} ')
                .replace('<body', '<body ${bodyAttrs} ')
                .replace('</head>', '${headTags}\n</head>')
                .replace(
                  '<div id="app"></div>',
                  '<div id="app" data-server-rendered="true">${body}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>'
                ),
            }),
          ],
        },
      },
    },
    serverOptions
  ) as NonNullable<BuildOptions['serverOptions']>

  await build(serverBuildOptions)

  // --- Generate package.json
  // const type =
  //   (ssrBuildOptions.rollupOutputOptions || {}).format === 'es'
  //     ? 'module'
  //     : 'commonjs'

  // index.html is not used in SSR and might be served by mistake
  await fs
    .unlink(path.join(clientBuildOptions.build?.outDir as string, 'index.html'))
    .catch(() => null)

  const packageJson = {
    // type,
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
