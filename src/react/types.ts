import type { FunctionComponent, ReactNode } from 'react'

export type Meta = {
  propsGetter?: boolean | string
  state?: Record<string, any> | null
  [key: string]: any
}

export type RouteRaw = {
  name?: string
  path: string
  component: any
  meta?: Meta
  routes?: RouteRaw[]
  [key: string]: any
}

export type Base = (params: { url: Location | URL }) => string

export type PagePropsOptions = {
  passToPage?: boolean
}

export type State = Record<string, any>

export type PropsProvider = FunctionComponent<{
  from?: RouteRaw
  to: RouteRaw
  [key: string]: any
}>

export type Options = {
  routes: RouteRaw[]
  base?: Base
  debug?: { mount?: boolean }
  pageProps?: PagePropsOptions
  transformState?: (state: any) => any | Promise<any>
  suspenseFallback?: ReactNode
  PropsProvider?: PropsProvider
  prepassVisitor?: any
}

export type Hook = (params: {
  url: URL | Location
  router: any
  isClient: boolean
  initialState: Record<string, any>
}) => any | Promise<any>

type Renderer = (
  url: string | URL,
  options?: {
    manifest?: Record<string, string[]>
    preload?: boolean
    [key: string]: any
  }
) => Promise<{ html: string; dependencies: string[] }>

export type ClientHandler = (
  App: any,
  options: Options,
  hook?: Hook
) => Promise<void>

export type SsrHandler = (App: any, options: Options, hook?: Hook) => Renderer
