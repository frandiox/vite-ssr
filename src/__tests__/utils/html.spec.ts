import { renderPreloadLinks } from '../../utils/html'

describe('renderPreloadLinks', () => {
  test('should render .js and .css files', () => {
    const links = renderPreloadLinks(['foo.js', 'bar.css'])
    expect(links).toMatchInlineSnapshot(
      `"<link rel=\\"modulepreload\\" crossorigin href=\\"foo.js\\"><link rel=\\"stylesheet\\" href=\\"bar.css\\">"`
    )
  })

  test('should return empty string if not .js or .css file', () => {
    const links = renderPreloadLinks(['foo.svg'])
    expect(links.length).toEqual(0)
  })
})
