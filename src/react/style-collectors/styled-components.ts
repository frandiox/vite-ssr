import type { ReactElement } from 'react'
import type { Context } from '../types'
// @ts-ignore
import { ServerStyleSheet } from 'styled-components'

function ssrCollector(context: Context) {
  const sheet = new ServerStyleSheet()

  return {
    collect(app: ReactElement) {
      // @ts-ignore
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

// @ts-ignore
export default import.meta.env.SSR ? ssrCollector : null
