const path = require('path')
const { ssrBuild, build } = require('vite')
const replace = require('@rollup/plugin-replace')

;(async () => {
  const clientResult = await build({
    outDir: path.resolve(process.cwd(), 'dist/client'),
    rollupInputOptions: {
      input: path.resolve(process.cwd(), 'src/main.js'),
    },
    alias: {
      '@vueflare': '/vueflare/entry-client.js',
    },
  })

  await ssrBuild({
    outDir: path.resolve(process.cwd(), 'dist/server'),
    rollupOutputOptions: {
      preserveModules: true,
    },
    rollupInputOptions: {
      preserveEntrySignatures: 'strict',
      plugins: [
        replace({
          __HTML__: clientResult[0].html.replace(
            '<div id="app">',
            '<div id="app" data-server-rendered="true">${html}'
          ),
        }),
      ],
      input: path.resolve(process.cwd(), 'vueflare/node-server'),
    },
    alias: {
      '@vueflare': '/vueflare/entry-server.js',
    },
  })

  process.exit()
})()
