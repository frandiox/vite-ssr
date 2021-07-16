import type { FunctionComponent, ReactNode } from 'react'
import type { Router } from './utils'
import type {
  Meta,
  Renderer,
  SharedContext,
  SharedOptions,
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

export type Options = SharedOptions & {
  routes: RouteRaw[]
  suspenseFallback?: ReactNode
  PropsProvider?: PropsProvider
  prepassVisitor?: any
}

export type Context = SharedContext & {
  router: Router
}

export type Hook = (params: Context) => any | Promise<any>

export type ClientHandler = (
  App: any,
  options: Options,
  hook?: Hook
) => Promise<void>

export type SsrHandler = (App: any, options: Options, hook?: Hook) => Renderer
