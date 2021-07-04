export type Meta = {
  propsGetter?: boolean | string
  state?: Record<string, any> | null
  [key: string]: any
}

export type Base = (params: { url: Location | URL }) => string

export type State = Record<string, any>

export type PagePropsOptions = {
  passToPage?: boolean
}

export type Redirection = {
  location?: string
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

export type Rendered = {
  html: string
  htmlAttrs: string
  headTags: string
  body: string
  bodyAttrs: string
  initialState: any
  dependencies: string[]
}

export type Renderer = (
  url: string | URL,
  options?: {
    manifest?: Record<string, string[]>
    preload?: boolean
    [key: string]: any
  }
) => Promise<Rendered | Redirection>
