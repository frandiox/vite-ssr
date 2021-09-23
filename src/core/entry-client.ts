import { deserializeState } from '../utils/state'
import { useClientRedirect } from '../utils/response'
import type { ClientHandler, Context } from './types'

export const viteSSR: ClientHandler = async function viteSSR(
  App,
  {
    url = window.location,
    transformState = deserializeState,
    spaRedirect = (location: string) => {
      window.location.href = location
    },
  } = {}
) {
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
  await App(context)
}

export default viteSSR
