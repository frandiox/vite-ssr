const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const path = require('path')
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const config = require('../plugin')
const { resolveEntryPoint } = require('./utils')

const [name] = Object.keys(config.alias)

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const input = await resolveEntryPoint()

  const clientResult = await build(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        rollupInputOptions: { input },
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
          input,
          plugins: [
            replace({
              __VITE_SSR_HTML__: clientResult[0].html.replace(
                '<div id="app">',
                '<div id="app" data-server-rendered="true">${html}'
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
