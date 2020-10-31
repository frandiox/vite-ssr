module.exports = {
  rollupInputOptions: {
    preserveEntrySignatures: 'strict',
  },
  rollupOutputOptions: {
    preserveModules: true,
  },
  alias: {
    'vite-ssr': 'vite-ssr/entry-client.js',
  },
}
