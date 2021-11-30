import { deserializeState, serializeState } from '../../utils/state'

describe('state:', () => {
  const state = { foo: 'baz', bar: 5, boo: [], bee: {} }
  const serializedState = serializeState(state)

  test('serializeState', () => {
    expect(serializedState).toMatchInlineSnapshot(
      `"\\"{\\\\\\"foo\\\\\\":\\\\\\"baz\\\\\\",\\\\\\"bar\\\\\\":5,\\\\\\"boo\\\\\\":[],\\\\\\"bee\\\\\\":{}}\\""`
    )
  })

  test('deserializeState', () => {
    // @ TODO
    //expect(deserializeState(serializedState)).toEqual(state)
  })
})
