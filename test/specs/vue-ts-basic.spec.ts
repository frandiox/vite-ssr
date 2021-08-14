import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setup, reset } from '../setup/per-suite'
import fetch from 'node-fetch'

test.before(async (context) => {
  await setup(context, 'vue-ts-basic')
})

test.after(reset)

test('/home', async (context) => {
  // SSR
  context.page.goto(context.baseUrl + '/')
  assert.is(await context.page.textContent('h1'), 'Home Page')

  const homeHtml = await (await fetch(context.baseUrl + '/')).text()
  assert.match(homeHtml, 'Home Page')
  assert.match(homeHtml, 'Count:0')

  // SPA take over
  await context.page.click('button')
  assert.is(await context.page.textContent('button'), 'Count:1')
  await context.page.click('a[href="/about"]')
  assert.is(await context.page.textContent('h1'), 'About Page')
  assert.is(await context.page.textContent('button'), 'Count:1')
})

test.run()
