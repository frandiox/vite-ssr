const fs = require('fs')
const path = require('path')
const { resolveConfig } = require('vite')

const viteConfigJS = 'vite.config.js'
const viteConfigMJS = 'vite.config.mjs'
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
let configFileName
let isTS = false
let isMJS = false

exports.getProjectInfo = function () {
  if (!rootDir) {
    let currentDir = process.cwd()
    while (!rootDir && currentDir !== systemRoot) {
      if (fileExists(currentDir, viteConfigJS)) {
        rootDir = currentDir
        configFileName = viteConfigJS
      } else if (fileExists(currentDir, viteConfigMJS)) {
        isMJS = true
        rootDir = currentDir
        configFileName = viteConfigMJS
      } else if (fileExists(currentDir, viteConfigTS)) {
        isTS = true
        rootDir = currentDir
        configFileName = viteConfigTS
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
    isMJS,
    rootDir,
    configFileName,
  }
}

exports.getEntryPoint = async function (root, indexHtml) {
  if (!root) {
    root = exports.getProjectInfo().rootDir
  }

  if (!indexHtml) {
    indexHtml = await fs.promises.readFile(
      path.resolve(root, 'index.html'),
      'utf-8'
    )
  }

  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryFile = matches[1] || 'src/main'

  return path.join(root, entryFile)
}

exports.resolveViteConfig = async function (mode) {
  return resolveConfig(
    {},
    'build',
    mode || process.env.MODE || process.env.NODE_ENV
  )
}
