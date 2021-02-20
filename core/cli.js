#!/usr/bin/env node

const [, , ...args] = process.argv

if (args[0] === 'build') {
  const build = require('./build')

  ;(async () => {
    await build()
    process.exit()
  })()
} else if (args[0] === 'dev') {
  require('./dev')
} else {
  console.log(`Command "${args[0]}" not supported`)
}
