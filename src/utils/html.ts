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
  // @ts-ignore
  `<div id="${containerId}"([\\s\\w\\-"'=[\\]]*)><\\/div>`
)

export function buildHtmlDocument(
  template: string,
  parts: {
    htmlAttrs?: string
    bodyAttrs?: string
    headTags?: string
    body?: string
    initialState?: string
  }
) {
  // @ts-ignore
  if (__DEV__) {
    if (template.indexOf(`id="${containerId}"`) === -1) {
      console.warn(
        `[SSR] Container with id "${containerId}" was not found in index.html`
      )
    }
  }

  return template
    .replace('<html', `<html ${parts.htmlAttrs} `)
    .replace('<body', `<body ${parts.bodyAttrs} `)
    .replace('</head>', `${parts.headTags}\n</head>`)
    .replace(
      containerRE,
      `<div id="${containerId}" data-server-rendered="true"$1>${
        parts.body
      }</div>\n\n  <script>window.__INITIAL_STATE__=${
        parts.initialState || "'{}'"
      }</script>`
    )
}
