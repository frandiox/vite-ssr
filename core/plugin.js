module.exports = {
  alias: {
    'vite-ssr': 'vite-ssr/entry-client',
  },
  rollupInputOptions: {
    preserveEntrySignatures: 'strict',
  },
  rollupOutputOptions: {
    preserveModules: true,
  },
}
