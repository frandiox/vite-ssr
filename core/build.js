const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')
const path = require('path')
const config = require('./plugin')

const [name] = Object.keys(config.alias)
const input = path.resolve(process.cwd(), 'src/main')

;(async () => {
  const clientResult = await build({
    outDir: path.resolve(process.cwd(), 'dist/client'),
    rollupInputOptions: { input },
    alias: config.alias,
  })

  await ssrBuild({
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
  })

  process.exit()
})()
