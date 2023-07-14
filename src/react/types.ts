import type { FunctionComponent, ReactElement, ReactNode } from 'react'
import type {
  Meta,
  Renderer,
  SharedContext,
  SharedOptions,
} from '../utils/types'
import type { Router } from './utils'

export interface RouteRaw {
  name?: string
  path: string
  component: any
  meta?: Meta
  routes?: RouteRaw[]
  children?: RouteRaw[]
  [key: string]: any
}

export interface PropsProvider
  extends FunctionComponent<{
    from?: RouteRaw
    to: RouteRaw
    [key: string]: any
  }> {}

export interface Context extends SharedContext {
  router: Router
}

export interface Options extends SharedOptions {
  routes: RouteRaw[]
  suspenseFallback?: ReactNode
  PropsProvider?: PropsProvider
  prepassVisitor?: any
}

export interface ServerOptions extends Options {
  styleCollector?:
    | null
    | ((context: Context) => {
        collect: (app: ReactElement) => ReactElement
        toString: (html: string) => string
        cleanup?: () => void
      })
}

export interface ClientOptions extends Options {
  styleCollector?:
    | null
    | ((context: Context) => {
        provide?: (app: ReactElement) => ReactElement
        cleanup?: () => void
      })
}

export interface HookParams extends Context {}

export interface Hook {
  (params: HookParams): any | Promise<any>
}

export interface ClientHandler {
  (App: any, options: ClientOptions, hook?: Hook): Promise<void>
}

export interface SsrHandler {
  (App: any, options: ServerOptions, hook?: Hook): Renderer
}
