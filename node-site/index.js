const { default: handler } = require('../dist/ssr/src/main')
const express = require('express')
const path = require('path')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../dist/client/_assets'))
)

server.get('*', async (req, res) => {
  const { html } = await handler(req)
  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
