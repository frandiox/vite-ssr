#!/usr/bin/env node
const build = require('vite-ssr/build')

const [, , ...args] = process.argv

if (args[0] === 'build') {
  ;(async () => {
    await build()
    process.exit()
  })()
} else {
  console.log(`Command "${args[0]}" not supported`)
}
