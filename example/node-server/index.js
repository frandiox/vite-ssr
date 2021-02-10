global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')

const { ssr } = require('../dist/server/package.json')
const { default: handler } = require('../dist/server')

const server = express()

for (const asset of ssr.assets || []) {
  server.use(
    '/' + asset,
    express.static(path.join(__dirname, '../dist/client/' + asset))
  )
}

server.get('*', async (req, res) => {
  if (req.path === '/api/getProps') {
    console.log('getProps', req.query)
    return res.end(
      JSON.stringify({
        server: true,
        msg: 'This is page ' + (req.query.name || '').toUpperCase(),
      })
    )
  }

  const url = req.protocol + '://' + req.get('host') + req.originalUrl
  const { html } = await handler({ request: { ...req, url } })
  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
