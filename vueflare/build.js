const path = require('path')
const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')

const input = path.resolve(process.cwd(), 'src/main')

;(async () => {
  const clientResult = await build({
    outDir: path.resolve(process.cwd(), 'dist/client'),
    rollupInputOptions: { input },
    alias: {
      '@vueflare': '/vueflare/entry-client',
    },
  })

  await ssrBuild({
    outDir: path.resolve(process.cwd(), 'dist/ssr'),
    alias: {
      '@vueflare': '/vueflare/entry-server',
    },
    rollupInputOptions: {
      input,
      preserveEntrySignatures: 'strict',
      plugins: [
        replace({
          __HTML__: clientResult[0].html.replace(
            '<div id="app">',
            '<div id="app" data-server-rendered="true">${html}'
          ),
        }),
      ],
    },
    rollupOutputOptions: {
      preserveModules: true,
    },
  })

  process.exit()
})()
