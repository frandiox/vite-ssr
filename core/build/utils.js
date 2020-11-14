const fs = require('fs').promises
const path = require('path')

function resolveRoot() {
  return process.cwd()
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
  resolveEntryPoint,
}
