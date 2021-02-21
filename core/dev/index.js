const startServer = require('./server')

module.exports = (options) =>
  startServer(options).then((server) => server.listen())
