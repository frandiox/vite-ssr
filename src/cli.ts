#!/usr/bin/env node

const [, , ...args] = process.argv

const options = {} as Record<string, any>

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  const nextArg = args[i + 1]
  if (arg.startsWith('--')) {
    options[arg.replace('--', '')] =
      !nextArg || nextArg.startsWith('--') ? true : nextArg
  }
}

const [command] = args

if (command === 'build') {
  // @ts-ignore
  const build = require('./build')

  ;(async () => {
    const { mode, ssr, watch } = options

    await build({
      clientOptions: { mode, build: { watch } },
      serverOptions: { mode, build: { ssr } },
    })

    if (!watch) {
      process.exit()
    }
  })()
} else if (
  command === 'dev' ||
  command === undefined ||
  command.startsWith('-')
) {
  require('./dev')(options)
} else {
  console.log(`Command "${command}" not supported`)
}
