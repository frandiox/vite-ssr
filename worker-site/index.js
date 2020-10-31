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
    if (event.request.url.includes('/_assets/')) {
      return await getAssetFromKV(event, {})
    } else {
      const { html } = await handler(event.request)

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
