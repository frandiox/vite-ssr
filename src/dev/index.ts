import { createSsrServer } from './server'

export const startServer = (options: Parameters<typeof createSsrServer>[0]) =>
  createSsrServer(options).then((server) => server.listen())

export { createSsrServer }

export type { SsrOptions } from './server'
