import type { ServerResponse } from 'http'
import type { IncomingMessage } from 'connect'

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

export type SharedOptions = {
  base?: Base
  debug?: { mount?: boolean }
  pageProps?: PagePropsOptions
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any
  ) => any | Promise<any>
}

export type SharedContext = {
  url: URL | Location
  isClient: boolean
  initialState: Record<string, any>
  redirect: (location: string, status?: number) => void
  writeResponse: (params: WriteResponse) => void
  request?: IncomingMessage
  response?: ServerResponse
  [key: string]: any
}

export type WriteResponse = {
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

export type Rendered = WriteResponse & {
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
) => Promise<Rendered | WriteResponse>
