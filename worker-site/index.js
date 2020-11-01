import handler from '../example/dist/ssr/src/main'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    event.respondWith(
      new Response(e.message || e.toString(), {
        status: 500,
      })
    )
  }
})

async function handleEvent(event) {
  try {
    if (
      event.request.url.includes('/_assets/') ||
      event.request.url.includes('/favicon.ico')
    ) {
      // --- STATIC FILES
      return await getAssetFromKV(event, {})
    } else if (event.request.url.includes('/api/getProps')) {
      // --- API ENDPOINTS
      const url = new URL(event.request.url)

      console.log(
        'getProps',
        Array.from(url.searchParams.entries()).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value,
          }),
          {}
        )
      )

      return new Response(
        JSON.stringify({
          server: true,
          msg:
            'This is page ' +
            (url.searchParams.get('name') || '').toUpperCase(),
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json;charset=UTF-8' },
        }
      )
    } else {
      // --- SSR

      // TODO Apparently, a worker cannot call itself so server-side request to '/api/getProps' will fail
      const { html } = await handler({
        ...event.request,
        url: 'http://127.0.0.1:8787', // TODO this should be request.url
      })

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      })
    }
  } catch (error) {
    console.log('Error:', error.message)
    return new Response(error.message, {
      status: 500,
      headers: {
        'content-type': 'text/plain',
      },
    })
  }
}
