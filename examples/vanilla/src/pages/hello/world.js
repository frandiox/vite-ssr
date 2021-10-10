import { html } from '../../utils'

export default function (context) {
  return {
    headTags: '<title>Hello World</title>',
    body: html`
      <h1>This is a nested page</h1>
      <p>Hello world!</p>
    `,
  }
}
