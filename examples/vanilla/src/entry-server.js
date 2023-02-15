import './index.css'
import viteSSR from 'vite-ssr/core/entry-server'
import { html } from './utils'

// These are pages following a custom format:
const pageModules = import.meta.glob('./pages/**/*.js', { eager: true })

// Simple server-only router (i.e. this is not an SPA!):
const serverRouter = new Map()
for (const [path, page] of Object.entries(pageModules)) {
  serverRouter.set(path.replace('./pages', '').replace('.js', ''), page.default)
}

const SUPPORTED_TIME_LOCALES = {
  en: 'en-US',
  es: 'es-ES',
  ja: 'ja-JP',
}

export default viteSSR(async (context) => {
  const { initialState, url, redirect } = context

  // Example of server redirection:
  if (url.pathname === '/redirect-test') {
    return redirect('/', 302)
  }

  // Example of routing:
  const page = serverRouter.get(url.pathname)
  if (page) {
    return page(context)
  }

  // Default page:

  // This could use url.pathname instead of querystring
  const lang = (url.searchParams.get('lang') || '').toLowerCase()
  const locale = SUPPORTED_TIME_LOCALES[lang] || SUPPORTED_TIME_LOCALES.en

  const clock = {
    locale,
    options: { timeStyle: 'full' },
  }

  // This will be passed to the browser so it can use the same data
  initialState.clock = clock

  // This could change depending on context.url or anything else
  const body = html`
    <h1>This is my SSR rendered page using Vanilla JS!</h1>
    <p>And this is a clock that is hydrated in the browser:</p>
    <p>
      <strong id="clock">
        ${new Date().toLocaleTimeString(clock.locale, clock.options)}
      </strong>
    </p>
    <p>
      Try adding <a href="/?lang=es"><code>?lang=es</code></a> or
      <a href="/?lang=ja"><code>?lang=ja</code></a> to the URL!
    </p>

    <footer>
      <div>See also:</div>
      <div>
        <a href="/about">About Us</a> -
        <a href="/hello/world">Hello World</a>
      </div>
    </footer>
  `

  return {
    htmlAttrs: `lang="${locale}"`,
    headTags: `<title>Vanilla SSR</title>`,
    body,
  }
})
