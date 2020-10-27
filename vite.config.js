module.exports = {
  rollupInputOptions: {
    preserveEntrySignatures: 'strict',
  },
  rollupOutputOptions: {
    preserveModules: true,
  },
  alias: {
    '@vueflare': '/vueflare/entry-client.js',
  },
}
