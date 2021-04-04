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

export type Renderer = (
  url: string | URL,
  options?: {
    manifest?: Record<string, string[]>
    preload?: boolean
    [key: string]: any
  }
) => Promise<{ html: string; dependencies: string[] }>
