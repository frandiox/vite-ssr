import handler from '../src/main'
const express = require('express')
const path = require('path')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../../client/_assets'))
)

server.get('*', async (req, res) => {
  const { html } = await handler(req)
  res.end(html)
})

console.log('started server...')
server.listen(8080)
