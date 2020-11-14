const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const path = require('path')
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const config = require('../plugin')
const { resolveEntryPoint } = require('./utils')

const [name] = Object.keys(config.alias)

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const clientResult = await build(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        alias: config.alias,
      },
      clientOptions
    )
  )

  await ssrBuild(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/ssr'),
        alias: {
          [name]: path.resolve(__dirname, '../entry-server'),
        },
        rollupInputOptions: {
          ...config.rollupInputOptions,
          input: await resolveEntryPoint(),
          plugins: [
            replace({
              __VITE_SSR_HTML__: clientResult[0].html.replace(
                '<div id="app"></div>',
                '<div id="app" data-server-rendered="true">${html}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>'
              ),
            }),
          ],
        },
        rollupOutputOptions: config.rollupOutputOptions,
      },
      ssrOptions
    )
  )
}
