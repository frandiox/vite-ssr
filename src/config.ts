import fs from 'fs'
import path from 'path'
import { resolveConfig } from 'vite'

export async function resolveViteConfig(mode?: string) {
  return resolveConfig(
    {},
    'build',
    mode || process.env.MODE || process.env.NODE_ENV
  )
}

export async function getEntryPoint(root?: string, indexHtml?: string) {
  if (!root) {
    const config = await resolveViteConfig()
    root = config.root
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

  const entryFile = matches?.[1] || 'src/main'

  return path.join(root, entryFile)
}
