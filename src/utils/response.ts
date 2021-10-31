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

const externalRedirect = (location: string) => {
  window.location.href = location
}

export function useClientRedirect(spaRedirect = externalRedirect) {
  return {
    writeResponse: () =>
      console.warn('[SSR] Do not call writeResponse in browser'),
    redirect: (location: string, status?: number) => {
      return location.startsWith('/')
        ? spaRedirect(location)
        : externalRedirect(location)
    },
  }
}
