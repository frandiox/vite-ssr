import type { FunctionComponent, ReactNode } from 'react'
import type { IncomingMessage } from 'connect'
import type { ServerResponse } from 'http'
import type { Router } from './utils'
import type {
  Base,
  Meta,
  PagePropsOptions,
  Renderer,
  WriteResponse,
} from '../utils/types'

export type RouteRaw = {
  name?: string
  path: string
  component: any
  meta?: Meta
  routes?: RouteRaw[]
  [key: string]: any
}

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
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any
  ) => any | Promise<any>
  suspenseFallback?: ReactNode
  PropsProvider?: PropsProvider
  prepassVisitor?: any
}

export type Context = {
  url: URL | Location
  isClient: boolean
  router: Router
  initialState: Record<string, any>
  writeResponse: (params: WriteResponse) => void
  request?: IncomingMessage
  response?: ServerResponse
  [key: string]: any
}

export type Hook = (params: Context) => any | Promise<any>

export type ClientHandler = (
  App: any,
  options: Options,
  hook?: Hook
) => Promise<void>

export type SsrHandler = (App: any, options: Options, hook?: Hook) => Renderer
