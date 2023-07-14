declare module 'styled-components' {
  export class ServerStyleSheet {
    constructor()
    _emitSheetCSS: () => string
    collectStyles: (children: any) => JSX.Element
    getStyleTags: () => string
    interleaveWithNodeStream: (input: Readable) => streamInternal.Transform
    seal: () => void
  }
}
