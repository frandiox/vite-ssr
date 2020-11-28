const fs = require('fs').promises
const path = require('path')

const viteConfigJS = 'vite.config.js'
const viteConfigTS = 'vite.config.ts'
const systemRoot = path.parse(process.cwd()).root
const fileExists = async (dir, file) => {
  try {
    await fs.access(path.resolve(dir, file))
    return true
  } catch (_) {
    return false
  }
}

let rootDir
let isTS = false

exports.getProjectInfo = async function () {
  if (!rootDir) {
    let currentDir = process.cwd()
    while (!rootDir && currentDir !== systemRoot) {
      if (await fileExists(currentDir, viteConfigJS)) {
        rootDir = currentDir
      } else if (await fileExists(currentDir, viteConfigTS)) {
        isTS = true
        rootDir = currentDir
      } else {
        currentDir = path.resolve(currentDir, '..')
      }
    }

    if (!rootDir) {
      throw new Error(`Could not find Vite config file`)
    }
  }

  return {
    isTS,
    rootDir,
    configFileName: isTS ? viteConfigTS : viteConfigJS,
  }
}

exports.getEntryPoint = async function () {
  const { rootDir } = await exports.getProjectInfo()

  const indexHtml = await fs.readFile(
    path.resolve(rootDir, 'index.html'),
    'utf-8'
  )

  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryFile = matches[1] || 'src/main'

  return path.join(rootDir, entryFile)
}
