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
  return template
    .replace('<html', `<html ${parts.htmlAttrs} `)
    .replace('<body', `<body ${parts.bodyAttrs} `)
    .replace('</head>', `${parts.headTags}\n</head>`)
    .replace(
      /<div id="app"([\s\w\-"'=[\]]*)><\/div>/,
      `<div id="app" data-server-rendered="true"$1>${
        parts.body
      }</div>\n\n  <script>window.__INITIAL_STATE__=${
        parts.initialState || "'{}'"
      }</script>`
    )
}
