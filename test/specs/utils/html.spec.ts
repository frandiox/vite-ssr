import '../../setup/globals'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { buildHtmlDocument } from '../../../src/utils/html'

const indexHtml = `
<!DOCTYPE html>
<html>
  <head>
    <!--headTags-->
  </head>
  <body>
    <!--bodyTagsOpen-->
    <div id="app" extra-attribute></div>
    <script type="module" src="/src/main.js"></script>
    <!--bodyTags-->
  </body>
</html>
`

function normalizeWhitespaces(string: string) {
  return string
    .trim()
    .replace(/\n\s+/gm, '\n')
    .replace(/[^\S\r\n]+/gm, ' ')
}

test('Build HTML doc', () => {
  // Simple case.
  const result = buildHtmlDocument(indexHtml, {
    body: '<div>give me $1</div>',
    bodyAttrs: 'data-body',
    headTags: '<meta charset="UTF-8" />',
    htmlAttrs: 'data-html',
    bodyTags: '<script type="application/ld+json">{"@id": "2"}</script>',
    bodyTagsOpen: '<script type="application/ld+json">{"@id": "1"}</script>',
    initialState: `'${JSON.stringify({ something: 'another $1' })}'`,
  })

  assert.is(
    normalizeWhitespaces(result),
    normalizeWhitespaces(`
    <!DOCTYPE html>
      <html data-html >
        <head>
          <meta charset="UTF-8" />
        </head>
        <body data-body >
          <script type="application/ld+json">{"@id": "1"}</script>
          <div id="app" data-server-rendered="true" extra-attribute><div>give me $1</div></div>

          <script>window.__INITIAL_STATE__='{"something":"another $1"}'</script>
          <script type="module" src="/src/main.js"></script>
          <script type="application/ld+json">{"@id": "2"}</script>
        </body>
      </html>
    `)
  )
})

test.run()
