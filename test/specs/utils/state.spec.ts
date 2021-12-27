import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { serializeState } from '../../../src/utils/serialize-state'

test('serializeState', () => {
  // Simple case.
  assert.is(serializeState({}), `'{}'`)

  // Expect JSON double quotes not to be needlessly escaped.
  assert.is(serializeState({ hello: 'world' }), `'{"hello":"world"}'`)

  // Expect inner double quotes and other characters to be correctly escaped
  assert.is(
    serializeState({ 'he\nllo': 'inner " quote' }),
    `'{"he\\\\nllo":"inner \\\\" quote"}'`
  )

  // Expect single quotes to be escaped.
  assert.is(serializeState({ quote: `'` }), `'{"quote":"\\'"}'`)

  // Expect escape characters to be escaped.
  // In our object, the "esc" property is a string with one character: a backslash.
  // As JSON, that object is: {"esc":"\\"}
  // Then, when that JSON string is wrapped in single quotes, it becomes: '{"esc":"\\\\"}'
  // That is, each backslash is escaped.
  assert.is(serializeState({ esc: '\\' }), String.raw`'{"esc":"\\\\"}'`)
  // Note that:
  assert.is(String.raw`'{"esc":"\\\\"}'`, `'{"esc":"\\\\\\\\"}'`)

  // Expect nested JSON strings to be correctly escaped.
  assert.is(
    serializeState({
      text: JSON.stringify({ insert: '\n' }),
    }),
    String.raw`'{"text":"{\\"insert\\":\\"\\\\n\\"}"}'`
  )

  // Expect angle brackets to be escaped.
  assert.is(
    serializeState({ brackets: `< >` }),
    `'{"brackets":"\\u003C \\u003E"}'`
  )
})

test.run()
