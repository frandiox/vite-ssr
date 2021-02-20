// This is a simple Node server that uses the built project.

global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')

const example = process.argv[2]

if (!example) {
  throw new Error('Specify example name in the first argument')
}

const dist = `../${example}/dist`

// This contains a list of static routes (assets)
const { ssr } = require(`${dist}/server/package.json`)

// The manifest is required for preloading assets
const manifest = require(`${dist}/client/ssr-manifest.json`)

// This is the server renderer we just built
const { default: renderPage } = require(`${dist}/server`)

const api = require('./api')

const server = express()

// Serve every static asset route
for (const asset of ssr.assets || []) {
  server.use(
    '/' + asset,
    express.static(path.join(__dirname, `${dist}/client/` + asset))
  )
}

// Custom API to get data for each page
// See src/main.js to see how this is called
api.forEach(({ route, handler }) => server.get(route, handler))

// Everything else is treated as a "rendering request"
server.get('*', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl

  const { html } = await renderPage(url, {
    manifest,
    preload: true,
  })

  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
