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
// @ts-ignore
const bodyTeleportsId = __BODY_TELEPORTS_ID__ as string

const containerRE = new RegExp(
  `<div id="${containerId}"([\\s\\w\\-"'=[\\]]*)><\\/div>`
)

const bodyTeleportsRE = new RegExp(
  `<div id="${bodyTeleportsId}"([\\s\\w\\-"'=[\\]]*)><\\/div>`
)

type DocParts = {
  htmlAttrs?: string
  bodyAttrs?: string
  bodyPrepend?: string
  bodyTeleports?: string
  headTags?: string
  body?: string
  initialState?: string
}

export function buildHtmlDocument(
  template: string,
  { htmlAttrs, bodyAttrs, bodyPrepend, bodyTeleports, headTags, body, initialState }: DocParts
) {
  // @ts-ignore
  if (__VITE_SSR_DEV__) {
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

  if (bodyTeleports) {
    if (template.indexOf(`id="${bodyTeleportsId}"`) === -1) {
      bodyPrepend = `${bodyPrepend || ''}\n<div id="${bodyTeleportsId}" data-server-rendered="true">${bodyTeleports || ''}</div>\n`;
    } else {
      template = template.replace(bodyTeleportsRE,
        (_, d1) => `<div id="${bodyTeleportsId}" data-server-rendered="true"${d1 || ''}>${bodyTeleports || ''}</div>\n`);
    }
  }

  if (headTags) {
    template = template.replace('</head>', `\n${headTags}\n</head>`)
  }

  return template.replace(
    containerRE,
    // Use function parameter here to avoid replacing `$1` in body or initialState.
    // https://github.com/frandiox/vite-ssr/issues/123
    (_, d1) =>
      `${bodyPrepend || ''}<div id="${containerId}" data-server-rendered="true"${d1 || ''}>${
        body || ''
      }</div>\n\n  <script>window.__INITIAL_STATE__=${
        initialState || "'{}'"
      }</script>`
  )
}
