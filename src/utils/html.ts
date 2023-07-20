export function findDependencies(
  modules: string[],
  manifest: Record<string, string[]>
) {
  const files = new Set<string>()

  for (const id of modules || []) {
    for (const file of manifest[id] || []) {
      files.add(file)
    }
  }

  return [...files]
}

export function renderPreloadLinks(files: string[]) {
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

// @ts-ignore
const containerId = __CONTAINER_ID__ as string

const containerRE = new RegExp(
  `<div id="${containerId}"([\\s\\w\\-"'=[\\]]*)><\\/div>`
)

type DocParts = {
  htmlAttrs?: string
  bodyAttrs?: string
  headTags?: string
  bodyTags?: string
  bodyTagsOpen?: string
  body?: string
  initialState?: string
}

export function buildHtmlDocument(
  template: string,
  { body, initialState, htmlAttrs, bodyAttrs, ...tags }: DocParts
) {
  // @ts-ignore
  if (__DEV__) {
    if (template.indexOf(`id="${containerId}"`) === -1) {
      console.warn(
        `[SSR] Container with id "${containerId}" was not found in index.html`
      )
    }
  }

  if (htmlAttrs) {
    template = template.replace('<html', `<html ${htmlAttrs} `)
  }

  if (bodyAttrs) {
    template = template.replace('<body', `<body ${bodyAttrs} `)
  }

  Object.entries(tags).forEach(([key, value]) => {
    template = template.replace(`<!--${key}-->`, value)
  })

  return template.replace(
    containerRE,
    // Use function parameter here to avoid replacing `$1` in body or initialState.
    // https://github.com/frandiox/vite-ssr/issues/123
    (_, d1) =>
      `<div id="${containerId}" data-server-rendered="true"${d1 || ''}>${
        body || ''
      }</div>\n\n  <script>window.__INITIAL_STATE__=${
        initialState || "'{}'"
      }</script>`
  )
}
