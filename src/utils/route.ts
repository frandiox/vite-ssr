const S = '/'

export function withPrefix(string: string, prefix: string) {
  return string.startsWith(prefix) ? string : prefix + string
}

export function withoutPrefix(string: string, prefix: string) {
  return string.startsWith(prefix) ? string.slice(prefix.length) : string
}

export function withSuffix(string: string, suffix: string) {
  return string.endsWith(suffix) ? string : string + suffix
}
export function withoutSuffix(string: string, suffix: string) {
  return string.endsWith(suffix) ? string.slice(0, -1 * suffix.length) : string
}

export function createUrl(urlLike: string | URL | Location) {
  if (typeof urlLike === 'string' && !(urlLike || '').includes('://')) {
    urlLike = 'http://e.g' + withPrefix(urlLike, S)
  }

  return new URL(urlLike.toString())
}

export function getFullPath(url: string | URL | Location, routeBase?: string) {
  url = createUrl(url)
  url.pathname = withSuffix(url.pathname, S)
  let fullPath = withoutPrefix(url.href, url.origin)

  if (routeBase) {
    routeBase = withSuffix(withPrefix(routeBase, S), S)
    if (fullPath.indexOf(routeBase) === 0) {
      fullPath = withPrefix(fullPath.replace(routeBase, ''), S)
    }
  }

  return fullPath
}
