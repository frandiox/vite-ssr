import startServer from './server'

export = (options: Parameters<typeof startServer>[0]) =>
  startServer(options).then((server) => server.listen())
