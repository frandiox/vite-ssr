global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')

const { default: handler } = require('../dist/ssr/_assets/src/main')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../dist/client/_assets'))
)

server.use(
  '/favicon.ico',
  express.static(path.join(__dirname, '../dist/client/favicon.ico'))
)

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
