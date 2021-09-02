// This code is copied directly from Vite source (it is not exported)

import chalk from 'chalk'
import strip from 'strip-ansi'
import type { RollupError } from 'rollup'
import type { ErrorPayload } from 'vite/types/hmrPayload'
import type { ViteDevServer } from 'vite'

const splitRE = /\r?\n/
function pad(source: string, n = 2): string {
  const lines = source.split(splitRE)
  return lines.map((l) => ` `.repeat(n) + l).join(`\n`)
}

export function logServerError(
  error: Error | RollupError,
  server: ViteDevServer
) {
  server.ssrFixStacktrace(error as Error)

  const msg = buildErrorMessage(error, [
    chalk.red(`Internal server error: ${error.message}`),
  ])

  server.config.logger.error(msg, {
    clear: true,
    timestamp: true,
    error,
  })

  setTimeout(() => {
    server.ws.send({ type: 'error', err: prepareError(error) })
  }, 100) // Wait until browser injects ViteErrorOverlay custom element
}

function prepareError(err: Error | RollupError): ErrorPayload['err'] {
  return {
    message: strip(err.message),
    stack: strip(cleanStack(err.stack || '')),
    id: (err as RollupError).id,
    frame: strip((err as RollupError).frame || ''),
    plugin: (err as RollupError).plugin,
    pluginCode: (err as RollupError).pluginCode,
    loc: (err as RollupError).loc,
  }
}

function buildErrorMessage(
  err: RollupError,
  args: string[] = [],
  includeStack = true
): string {
  if (err.plugin) args.push(`  Plugin: ${chalk.magenta(err.plugin)}`)
  if (err.id) args.push(`  File: ${chalk.cyan(err.id)}`)
  if (err.frame) args.push(chalk.yellow(pad(err.frame)))
  if (includeStack && err.stack) args.push(pad(cleanStack(err.stack)))
  return args.join('\n')
}

function cleanStack(stack: string) {
  return stack
    .split(/\n/g)
    .filter((l) => /^\s*at/.test(l))
    .join('\n')
}
