import type { ReactElement } from 'react'
// @ts-ignore
import { ServerStyleSheet } from 'styled-components'

export function appStyledWrapper(app: ReactElement, context: any) {
  const sheet = new ServerStyleSheet()

  context.styles = () => {
    const styles = sheet.getStyleTags()
    sheet.seal()

    return styles
  }

  // @ts-ignore
  return sheet.collectStyles(app)
}
