const S = '/'

export function withPrefix(string, prefix) {
  return string.startsWith(prefix) ? string : prefix + string
}

export function withoutPrefix(string, prefix) {
  return string.startsWith(prefix) ? string.slice(prefix.length) : string
}

export function withSuffix(string, suffix) {
  return string.endsWith(suffix) ? string : string + suffix
}
export function withoutSuffix(string, suffix) {
  return string.endsWith(suffix)
    ? string.slice(0, -1 * suffix.length)
    : string + suffix
}

export function createUrl(urlLike) {
  if (urlLike instanceof URL) {
    return urlLike
  }

  if (!(urlLike || '').includes('://')) {
    urlLike = 'http://e.g' + withPrefix(urlLike, S)
  }

  return new URL(urlLike)
}

export function joinPaths(...paths) {
  return paths.reduce((acc, path) => acc + path, '').replace(/\/\//g, S)
}

export function getFullPath(url, routeBase) {
  url = typeof url === 'string' ? createUrl(url) : url
  let fullPath = withoutPrefix(url.href, url.origin)

  if (routeBase) {
    const parts = fullPath.split(S)
    if (parts[1] === routeBase.replace(/\//g, '')) {
      parts.splice(1, 1)
    }

    fullPath = parts.join(S)
  }

  return fullPath
}
