const fs = require('fs').promises
const path = require('path')

function resolveViteConfig() {
  // TODO make it configurable
  try {
    return require(path.resolve(process.cwd(), 'vite.config.js'))
  } catch (error) {
    console.warn('vite.config.js not found')
    return null
  }
}

function resolveRoot() {
  const viteConfig = resolveViteConfig()
  return (viteConfig && viteConfig.root) || process.cwd()
}

async function resolveEntryPoint() {
  const root = resolveRoot()
  const indexHtml = await fs.readFile(path.resolve(root, 'index.html'), 'utf-8')
  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryFile = matches[1] || 'src/main'

  return path.join(root, entryFile)
}

module.exports = {
  resolveViteConfig,
  resolveEntryPoint,
}
