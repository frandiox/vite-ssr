import http from 'http'
import path from 'path'
import { chromium } from 'playwright-chromium'
import serve from '../scripts/serve'
import { Context } from 'uvu'

let app: http.Server

export async function setup(context: Context, fixture: string) {
  try {
    const fixturePath = path.resolve('test', 'fixtures', fixture)

    context.browser = await chromium.launch()
    context.page = await context.browser.newPage()

    const served = await serve(fixturePath)
    if (served) {
      app = served.server
      context.baseUrl = served.baseUrl
    }
  } catch (error) {
    console.error(error)

    // If setup failed stop running tests
    process.exit(-1)
  }
}

export async function reset(context: Context) {
  try {
    await context.page.close()
    await context.browser.close()
    await app.close()
    // await fs.remove(path.resolve('_temp'))
  } catch (error) {
    console.error(error)
  }
}
