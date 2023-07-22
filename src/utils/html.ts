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

const bodyTagsOpenRE = new RegExp(`(${containerRE.source})`)

type DocParts = {
  headTags?: string
  bodyTags?: string
  bodyTagsOpen?: string
  htmlAttrs?: string
  bodyAttrs?: string
  body?: string
  initialState?: string
}

export function buildHtmlDocument(
  template: string,
  {
    headTags,
    bodyTags,
    bodyTagsOpen,
    htmlAttrs,
    bodyAttrs,
    body,
    initialState,
  }: DocParts
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

  if (bodyTagsOpen) {
    template = template.replace(bodyTagsOpenRE, `${bodyTagsOpen} $1`)
  }

  if (bodyAttrs) {
    template = template.replace('<body', `<body ${bodyAttrs} `)
  }

  if (bodyTags) {
    template = template.replace('</body>', `${bodyTags}</body>`)
  }

  if (headTags) {
    template = template.replace('</head>', `\n${headTags}\n</head>`)
  }

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
