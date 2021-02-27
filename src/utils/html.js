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
  let [, headTags = ''] = helmet.match(/<head[^>]*?>((.|\s)*?)<\/head>/im) || []
  let [, bodyAttrs = ''] = helmet.match(/<body([^>]*?)>/im) || []
  let [, htmlAttrs = ''] = helmet.match(/<html([^>]*?)>/im) || []

  if (helmet) {
    const viteDataAttribute = /\sdata-v-[\d\w]+/gm
    headTags = headTags.replace(viteDataAttribute, '')
    bodyAttrs = bodyAttrs.replace(viteDataAttribute, '')
    htmlAttrs = htmlAttrs.replace(viteDataAttribute, '')
    body = body.replace(helmet, '<!---->')
  }

  return { body, headTags, bodyAttrs, htmlAttrs }
}
