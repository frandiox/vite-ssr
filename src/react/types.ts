import type { FunctionComponent, ReactElement, ReactNode } from 'react'
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

export type Context = SharedContext & {
  router: Router
}

export type Options = SharedOptions & {
  routes: RouteRaw[]
  suspenseFallback?: ReactNode
  PropsProvider?: PropsProvider
  prepassVisitor?: any
}

export type SsrOptions = Options & {
  styleCollector?:
    | null
    | ((context: Context) => {
        collect: (app: ReactElement) => ReactElement
        toString: (html: string) => string
        cleanup?: () => void
      })
}

export type ClientOptions = Options & {
  styleCollector?:
    | null
    | ((context: Context) => {
        provide?: (app: ReactElement) => ReactElement
        cleanup?: () => void
      })
}

export type Hook = (params: Context) => any | Promise<any>

export type ClientHandler = (
  App: any,
  options: ClientOptions,
  hook?: Hook
) => Promise<void>

export type SsrHandler = (
  App: any,
  options: SsrOptions,
  hook?: Hook
) => Renderer
