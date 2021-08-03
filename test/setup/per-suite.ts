import fs from 'fs-extra'
import http from 'http'
import path from 'path'
import { Browser, chromium, Page } from 'playwright-chromium'
import serve from '../scripts/serve'
import { Context } from 'uvu'

let browser: Browser
let page: Page
let app: http.Server

export async function setup(context: Context, fixture: string) {
  try {
    const fixturePath = path.resolve('test', 'fixtures', fixture)

    browser = await chromium.launch()
    const browserContext = await browser.newContext()
    page = await browserContext.newPage()

    const served = await serve(fixturePath)
    if (served) {
      app = served.server
      context.page = page
      context.baseUrl = served.baseUrl
    }
  } catch (error) {
    console.error(error)

    // If setup failed stop running tests
    process.exit(-1)
  }
}

export async function reset() {
  try {
    await page.close()
    await page.close()
    await app.close()
    // await fs.remove(path.resolve('_temp'))
    console.log('reset done')
  } catch (error) {
    console.error(error)
  }
}
