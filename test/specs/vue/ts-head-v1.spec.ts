import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setup, reset } from '../../setup/per-suite'
import fetch from 'node-fetch'

const FIXTURE = 'vue-ts-head-v1'

test.before(async (context) => {
  await setup(context, FIXTURE)
})

test.after(reset)

test(`${FIXTURE}/home-with-title`, async (context) => {
  // SSR
  await context.page.goto(context.baseUrl + '/')
  assert.is(await context.page.textContent('h1'), 'Home Page')

  const homeHtml = await (await fetch(context.baseUrl + '/')).text()

  // Check title set using @vueuse/head
  assert.match(homeHtml, 'vue-ts-head-v1-title')

  // SPA take over
  await context.page.click('button')
  assert.is(await context.page.textContent('button'), 'Count:1')
  await context.page.click('a[href="/about"]')
  assert.is(await context.page.textContent('h1'), 'About Page')
  assert.is(await context.page.textContent('button'), 'Count:1')
})

test.run()
