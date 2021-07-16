import { defer } from './defer'
import type { WriteResponse } from './types'

const isRedirect = ({ status = 0 } = {}) => status >= 300 && status < 400

export function useResponseSSR() {
  const deferred = defer<string>()
  let response

  const writeResponse = (params: WriteResponse) => {
    response = params
    if (isRedirect(params)) {
      // Stop waiting for rendering when redirecting
      deferred.resolve('')
    }
  }

  return {
    deferred,
    response,
    writeResponse,
    isRedirect: () => !!response && isRedirect(response),
  }
}

export function useResponseClient({
  spaRedirect,
}: { spaRedirect?: (location: string) => void } = {}) {
  const writeResponse = (params: WriteResponse) => {
    const location = (params.headers || {}).location
    if (location) {
      if (spaRedirect && location.startsWith('/')) {
        return spaRedirect(location)
      } else {
        window.location.href = location
      }
    }
  }

  return {
    writeResponse,
  }
}
