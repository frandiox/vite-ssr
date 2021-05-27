import type { ReactElement } from 'react'
// @ts-ignore
import { ServerStyleSheets } from '@material-ui/core/styles'

export function appStyledWrapper(app: ReactElement, context: any) {
  const sheet = new ServerStyleSheets()

  context.styles = () => {
    let css = sheet.toString()

    // @ts-ignore
    if (import.meta.env.PROD) {
      css = css.replace(/\s{2,}/gm, ' ')
    }

    return `<style id="jss-server-side" data-remove-on-hydration>${css}</style>`
  }

  return sheet.collect(app)
}
