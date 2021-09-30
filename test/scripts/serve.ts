import fs from 'fs-extra'
import path from 'path'
import execa from 'execa'
import http from 'http'

/**
 * Givin a vue-ssr app path, it builds in and serve it in production mode with express
 */
async function serve(
  root: string
): Promise<{ baseUrl: string; server: http.Server } | undefined> {
  const srcDir = path.resolve(root)

  // build
  await execa('yarn', ['build'], { cwd: srcDir })

  // start prod server
  const serverPath = path.resolve(srcDir, 'server.js')
  if (!fs.existsSync(serverPath)) {
    return
  }

  const { createServer } = await import(serverPath)
  const app = createServer()

  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(0, () => {
        const { port } = server.address()
        const baseUrl = `http://localhost:${port}`
        // console.log(`Test server running at ${baseUrl}`)
        return resolve({ server, baseUrl })
      })
    } catch (e) {
      return reject(e)
    }
  })
}

export default serve
