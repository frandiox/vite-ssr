import type { ServerResponse } from 'http'
import type { IncomingMessage } from 'connect'

export interface Meta {
  propsGetter?: boolean | string
  state?: Record<string, any> | null
  [key: string]: any
}

export interface Base {
  (params: { url: Location | URL }): string
}

export interface State {
  [key: string]: any
}

export interface PagePropsOptions {
  passToPage?: boolean
}

export interface SharedOptions {
  base?: Base
  debug?: { mount?: boolean }
  pageProps?: PagePropsOptions
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any
  ) => any | Promise<any>
}

export interface SharedContext {
  url: URL | Location
  isClient: boolean
  initialState: Record<string, any>
  redirect: (location: string, status?: number) => void
  writeResponse: (params: WriteResponse) => void
  request?: IncomingMessage
  response?: ServerResponse
  [key: string]: any
}

export interface WriteResponse {
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

export interface Rendered extends WriteResponse {
  html: string
  htmlAttrs: string
  headTags: string
  body: string
  bodyAttrs: string
  initialState: any
  dependencies: string[]
}

export interface RendererOptions {
  manifest?: Record<string, string[]>
  preload?: boolean
  [key: string]: any
}

export interface Renderer {
  (url: string | URL, options?: RendererOptions): Promise<
    Rendered | WriteResponse
  >
}
