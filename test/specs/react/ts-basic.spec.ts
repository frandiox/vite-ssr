import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setup, reset } from '../../setup/per-suite'
import fetch from 'node-fetch'

const FIXTURE = 'react-ts-basic'

const normalize = (html: string) => html.replace(/<!-- -->/gm, '')

test.before(async (context) => {
  await setup(context, FIXTURE)
})

test.after(reset)

test(`${FIXTURE}/home`, async (context) => {
  // SSR
  context.page.goto(context.baseUrl + '/')
  assert.is(await context.page.textContent('h1'), 'Home Page')

  const homeHtml = normalize(await (await fetch(context.baseUrl + '/')).text())
  assert.match(homeHtml, 'Home Page')
  assert.match(homeHtml, 'Count:0')

  // SPA take over
  await context.page.click('button')
  assert.is(normalize(await context.page.textContent('button')), 'Count:1')
  await context.page.click('a[href="/about"]')
  assert.is(await context.page.textContent('h1'), 'About Page')
  assert.is(normalize(await context.page.textContent('button')), 'Count:1')
})

test(`${FIXTURE}/repos`, async (context) => {
  // SSR
  context.page.goto(context.baseUrl + '/repos')

  const html = await (await fetch(context.baseUrl + '/repos')).text()
  assert.match(html, 'VueJs Org Repos')
  assert.match(html, 'vue')
  assert.match(html, 'official router for Vue')
  assert.match(html, 'Documentation for')

  // SPA take over
  const selector = 'div[data-test="desc-vue-router"]'

  assert.match(
    await context.page.textContent(selector),
    'official router for Vue'
  )

  await context.page.click('button[data-test="remove-vue-router"]')

  const res = await context.page.$$(selector)

  assert.is(res.length, 0)
})

test.run()
