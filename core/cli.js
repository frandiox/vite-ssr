#!/usr/bin/env node

const [, , ...args] = process.argv

const options = {}

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
  const build = require('./build')

  ;(async () => {
    await build({ serverOptions: { build: { ssr: options.ssr } } })
    process.exit()
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
