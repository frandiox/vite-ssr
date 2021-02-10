const { build } = require('vite')
const replace = require('@rollup/plugin-replace')
const fs = require('fs').promises
const path = require('path')
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const { getEntryPoint } = require('./config')

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const clientBuildOptions = mergeOptions(
    {
      build: {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        manifest: true,
        ssrManifest: true,
      },
    },
    clientOptions
  )

  const clientResult = await build(clientBuildOptions)

  const indexHtml = clientResult.output.find(
    (file) => file.type === 'asset' && file.fileName === 'index.html'
  )

  // -- SSR build
  const ssrBuildOptions = mergeOptions(
    {
      build: {
        outDir: path.resolve(process.cwd(), 'dist/ssr'),
        // The plugin is already changing the vite-ssr alias to point to the server-entry.
        // Therefore, here we can just use the same entry point as in the index.html
        ssr: await getEntryPoint(),
        rollupOptions: {
          plugins: [
            replace({
              __VITE_SSR_HTML__: indexHtml.source
                .replace('<html', '<html ${htmlAttrs} ')
                .replace('<body', '<body ${bodyAttrs} ')
                .replace('</head>', '${head}\n</head>')
                .replace(
                  '<div id="app"></div>',
                  '<div id="app" data-server-rendered="true">${html}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>'
                ),
            }),
          ],
        },
      },
    },
    ssrOptions
  )

  await build(ssrBuildOptions)

  // --- Generate package.json
  // const type =
  //   (ssrBuildOptions.rollupOutputOptions || {}).format === 'es'
  //     ? 'module'
  //     : 'commonjs'

  const packageJson = {
    // type,
    main: path.parse(ssrBuildOptions.build.ssr).name + '.js',
    ssr: {
      // This can be used later to serve static assets
      assets: (await fs.readdir(clientBuildOptions.build.outDir)).filter(
        (file) => !/(index\.html|manifest\.json)$/i.test(file)
      ),
    },
    ...(ssrBuildOptions.packageJson || {}),
  }

  await fs.writeFile(
    path.join(ssrBuildOptions.build.outDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
}
