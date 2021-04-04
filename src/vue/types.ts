import type { App, Component } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
} from 'vue-router'
import type { HeadClient } from '@vueuse/head'

export type Meta = {
  propsGetter?: boolean | string
  [key: string]: any
}

export type ExtendedRouteRaw = RouteLocationRaw & {
  props?: any
  meta?: Meta
}

export type ExtendedRouteNormalized = RouteLocationNormalized & {
  props?: any
  meta?: Meta
}

export type Options = {
  routes: ExtendedRouteRaw[]
  base?: (params: { url: Location | URL }) => string
  debug?: { mount?: boolean }
  pageProps?: { passToPage: boolean }
  transformState?: (state: any) => any | Promise<any>
}

type HookResponse = void | {
  head?: HeadClient
}

export type Hook = (params: {
  app: App
  url: URL | Location
  router: Router
  isClient: boolean
  initialState: Record<string, any>
  initialRoute: RouteLocationNormalized
}) => HookResponse | Promise<HookResponse>

type Renderer = (
  url: string | URL,
  options?: {
    manifest?: Record<string, string[]>
    preload?: boolean
    [key: string]: any
  }
) => Promise<{ html: string; dependencies: string[] }>

export type ClientHandler = (
  App: Component,
  options: Options,
  hook?: Hook
) => Promise<void>

export type SsrHandler = (
  App: Component,
  options: Options,
  hook?: Hook
) => Renderer
