const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const fs = require('fs').promises
const path = require('path')
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const plugin = require('./plugin')
const { getEntryPoint } = require('./config')

const [name] = Object.keys(plugin.alias)

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const clientResult = await build(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        alias: plugin.alias,
      },
      clientOptions
    )
  )

  const ssrOutDirPath = path.resolve(process.cwd(), 'dist/ssr')
  const entryPoint = await getEntryPoint()

  await ssrBuild(
    mergeOptions(
      {
        outDir: ssrOutDirPath,
        assetsDir: '',
        alias: {
          [name]: plugin.alias[name].replace('entry-client', 'entry-server'),
        },
        rollupInputOptions: {
          preserveEntrySignatures: 'strict',
          input: entryPoint,
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
  )

  const type =
    (ssrOptions.rollupOutputOptions || {}).format === 'es'
      ? 'module'
      : 'commonjs'

  await fs.writeFile(
    path.join(ssrOutDirPath, 'package.json'),
    `{ "type": "${type}", "main": "${path.parse(entryPoint).name + '.js'}" }`
  )
}
