// https://github.com/yahoo/serialize-javascript
const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g
const ESCAPED_CHARS = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

function escapeUnsafeChars(unsafeChar: string) {
  return ESCAPED_CHARS[unsafeChar as keyof typeof ESCAPED_CHARS]
}

export function serializeState(state: any) {
  try {
    // -- Example:
    // Input object: { hello: 'w\'or"ld  -  <script>' }
    // Output string: '{"hello":"w\'or\\"ld  -  \u003Cscript\u003E"}'

    state = JSON.stringify(state || {})
      // 1. Duplicate the escape char (\) for already escaped characters (e.g. \n or \").
      .replace(/(?<!\\)\\(.)/g, '\\\\$1')
      // 2. Escape existing single quotes to allow wrapping the whole thing in '...'.
      .replace(/(?<!\\)'/g, "\\'")
      // 3. Escape unsafe chars.
      .replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars)

    // Wrap the serialized JSON in quotes so that it's parsed
    // by the browser as a string for better performance.
    return `'${state}'`
  } catch (error) {
    console.error('[SSR] On state serialization -', error, state)
    return '{}'
  }
}
