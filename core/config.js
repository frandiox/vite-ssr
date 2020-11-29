const fs = require('fs')
const path = require('path')
const { resolveConfig } = require('vite')

const viteConfigJS = 'vite.config.js'
const viteConfigTS = 'vite.config.ts'
const systemRoot = path.parse(process.cwd()).root
const fileExists = (dir, file) => {
  try {
    fs.accessSync(path.resolve(dir, file))
    return true
  } catch (_) {
    return false
  }
}

let rootDir
let isTS = false

exports.getProjectInfo = function () {
  if (!rootDir) {
    let currentDir = process.cwd()
    while (!rootDir && currentDir !== systemRoot) {
      if (fileExists(currentDir, viteConfigJS)) {
        rootDir = currentDir
      } else if (fileExists(currentDir, viteConfigTS)) {
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
  const { rootDir } = exports.getProjectInfo()

  const indexHtml = await fs.promises.readFile(
    path.resolve(rootDir, 'index.html'),
    'utf-8'
  )

  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryFile = matches[1] || 'src/main'

  return path.join(rootDir, entryFile)
}

exports.resolveViteConfig = async function (mode) {
  const { rootDir, configFileName } = await await exports.getProjectInfo()
  return resolveConfig(
    mode || process.env.MODE || process.env.NODE_ENV,
    path.join(rootDir, configFileName)
  )
}
