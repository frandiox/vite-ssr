import { deserializeState } from '../utils/deserialize-state'
import { useClientRedirect } from '../utils/response'
import type { ClientHandler, Context, Options } from './types'

export const viteSSR: ClientHandler = async function viteSSR(options, hook) {
  if (!hook && typeof options === 'function') {
    hook = options
    options = {}
  }

  const {
    url = window.location,
    transformState = deserializeState,
    spaRedirect,
  } = (options || {}) as Options

  // Deserialize the state included in the DOM
  const initialState = await transformState(
    // @ts-ignore
    window.__INITIAL_STATE__,
    deserializeState
  )

  // Browser redirect utilities
  const { redirect, writeResponse } = useClientRedirect(spaRedirect)

  const context = {
    url,
    isClient: true,
    initialState: initialState || {},
    writeResponse,
    redirect,
  } as Context

  // Main hook / component
  hook && (await hook(context))

  return context
}

export default viteSSR
