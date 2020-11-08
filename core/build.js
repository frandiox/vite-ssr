const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const path = require('path')
const fs = require('fs').promises
const mergeOptions = require('merge-options').bind({ concatArrays: true })
const config = require('./plugin')

const [name] = Object.keys(config.alias)

module.exports = async ({ clientOptions = {}, ssrOptions = {} } = {}) => {
  const viteConfig = require(path.resolve(process.cwd(), 'vite.config.js')) // TODO make it configurable
  const root = (viteConfig && viteConfig.root) || process.cwd()
  const indexHtml = await fs.readFile(path.resolve(root, 'index.html'), 'utf-8')
  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryPoint = matches[1] || 'src/main'
  const input = path.join(root, entryPoint)

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
          [name]: path.resolve(__dirname, 'entry-server'),
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
