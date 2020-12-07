const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const fs = require('fs').promises
const path = require('path')
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const plugin = require('./plugin')
const { resolveViteConfig, getEntryPoint } = require('./config')

const [name] = Object.keys(plugin.alias)

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const viteConfig = await resolveViteConfig()

  const clientBuildOptions = mergeOptions(
    viteConfig,
    {
      outDir: path.resolve(process.cwd(), 'dist/client'),
      alias: plugin.alias,
    },
    clientOptions
  )

  const clientResult = await build(clientBuildOptions)

  // -- SSR build
  const ssrBuildOptions = mergeOptions(
    viteConfig,
    {
      outDir: path.resolve(process.cwd(), 'dist/ssr'),
      assetsDir: '',
      alias: {
        [name]: plugin.alias[name].replace('entry-client', 'entry-server'),
      },
      rollupInputOptions: {
        preserveEntrySignatures: 'strict',
        input: await getEntryPoint(),
        plugins: [
          replace({
            __VITE_SSR_HTML__: clientResult[0].html.replace(
              '<div id="app"></div>',
              '<div id="app" data-server-rendered="true">${html}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>'
            ),
          }),
        ],
      },
    },
    ssrOptions
  )

  await ssrBuild(ssrBuildOptions)

  // --- Generate package.json
  const type =
    (ssrBuildOptions.rollupOutputOptions || {}).format === 'es'
      ? 'module'
      : 'commonjs'

  const packageJson = {
    type,
    main: path.parse(ssrBuildOptions.rollupInputOptions.input).name + '.js',
    ssr: {
      assets: await fs.readdir(clientBuildOptions.outDir),
    },
    ...(ssrBuildOptions.packageJson || {}),
  }

  await fs.writeFile(
    path.join(ssrBuildOptions.outDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
}
