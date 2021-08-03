import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setup, reset } from '../setup/per-suite'

test.before(async (context) => {
  await setup(context, 'vue-ts-basic')
})

test.after(reset)

test('/home', async (context) => {
  context.page.goto(context.baseUrl + '/')
  assert.is(await context.page.textContent('h1'), 'Home Page')
})

test('/about', async (context) => {
  context.page.goto(context.baseUrl + '/about')
  assert.is(await context.page.textContent('h1'), 'About Page')
})

test.run()
