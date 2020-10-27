import handler from '../src/main'
const express = require('express')
const path = require('path')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../../client/_assets'))
)

server.get('*', async (req, res) => {
  const html = await handler(req)

  if (html) {
    // This string is replaced at build time.
    return res.end(`__HTML__`)
  }

  res.end()
})

console.log('started server...')
server.listen(8080)
