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

export function findDependencies(modules, manifest) {
  const files = new Set()

  for (const id of modules || []) {
    for (const file of manifest[id] || []) {
      files.add(file)
    }
  }

  return [...files]
}

export function renderPreloadLinks(files) {
  let link = ''

  for (const file of files || []) {
    if (file.endsWith('.js')) {
      link += `<link rel="modulepreload" crossorigin href="${file}">`
    } else if (file.endsWith('.css')) {
      link += `<link rel="stylesheet" href="${file}">`
    }
  }

  return link
}

export function parseHTML(body = '') {
  const [helmet = ''] = body.match(/<html[^>]*?>(.|\s)*?<\/html>/im) || []
  let [, head = ''] = helmet.match(/<head[^>]*?>((.|\s)*?)<\/head>/im) || []
  let [, bodyAttrs = ''] = helmet.match(/<body([^>]*?)>/im) || []
  let [, htmlAttrs = ''] = helmet.match(/<html([^>]*?)>/im) || []

  if (helmet) {
    const viteDataAttribute = /\sdata-v-[\d\w]+/gm
    head = head.replace(viteDataAttribute, '')
    bodyAttrs = bodyAttrs.replace(viteDataAttribute, '')
    htmlAttrs = htmlAttrs.replace(viteDataAttribute, '')
    body = body.replace(helmet, '<!---->')
  }

  return { body, head, bodyAttrs, htmlAttrs }
}
