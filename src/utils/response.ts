import { defer } from './defer'
import type { WriteResponse } from './types'

const isRedirect = ({ status = 0 }) => status >= 300 && status < 400

export function useSsrResponse() {
  const deferred = defer<WriteResponse>()
  let response = {} as WriteResponse

  const writeResponse = (params: WriteResponse) => {
    Object.assign(response, params)
    if (isRedirect(params)) {
      // Stop waiting for rendering when redirecting
      deferred.resolve(response)
    }
  }

  return {
    deferred,
    response,
    writeResponse,
    isRedirect: () => isRedirect(response),
    redirect: (location: string, status = 302) =>
      writeResponse({ headers: { location }, status }),
  }
}

export function useClientRedirect(spaRedirect: (location: string) => void) {
  return {
    writeResponse: () =>
      console.warn('[SSR] Do not call writeResponse in browser'),
    redirect: (location: string, status?: number) => {
      if (location.startsWith('/')) {
        return spaRedirect(location)
      } else {
        window.location.href = location
      }
    },
  }
}
