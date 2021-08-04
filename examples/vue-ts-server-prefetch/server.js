// This is a simple Node server that uses the built project.
global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')

const dist = `./dist`

// This contains a list of static routes (assets)
const { ssr } = require(`${dist}/server/package.json`)

// The manifest is required for preloading assets
const manifest = require(`${dist}/client/ssr-manifest.json`)

// This is the server renderer we just built
const { default: renderPage } = require(`${dist}/server`)

const server = express()

// Serve every static asset route
for (const asset of ssr.assets || []) {
  server.use(
    '/' + asset,
    express.static(path.join(__dirname, `${dist}/client/` + asset))
  )
}

// Everything else is treated as a "rendering request"
server.get('*', async (request, response) => {
  const url =
    request.protocol + '://' + request.get('host') + request.originalUrl

  const { html, status, statusText, headers } = await renderPage(url, {
    manifest,
    preload: true,
    // Anything passed here will be available in the main hook
    request,
    response,
    // initialState: { ... } // <- This would also be available
  })

  response.writeHead(status || 200, statusText || headers, headers)
  response.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
