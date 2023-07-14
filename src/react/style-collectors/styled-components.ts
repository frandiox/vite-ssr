import type { ReactElement } from 'react'
import { ServerStyleSheet } from 'styled-components'
import type { Context } from '../types'

function ssrCollector(context: Context) {
  const sheet = new ServerStyleSheet()

  return {
    collect(app: ReactElement) {
      return sheet.collectStyles(app)
    },
    toString() {
      return sheet.getStyleTags()
    },
    cleanup() {
      sheet.seal()
    },
  }
}

export default import.meta.env.SSR ? ssrCollector : null
