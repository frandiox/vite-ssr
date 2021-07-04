import type { App, Component } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouterOptions,
  Router,
} from 'vue-router'
import type { HeadClient } from '@vueuse/head'
import type { IncomingMessage } from 'connect'
import type { ServerResponse } from 'http'
import type { Meta, PagePropsOptions, Renderer } from '../utils/types'

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
  routerOptions?: Omit<RouterOptions, 'routes' | 'history'>
  debug?: { mount?: boolean }
  pageProps?: PagePropsOptions
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any
  ) => any | Promise<any>
}

type HookResponse = void | {
  head?: HeadClient
}

export type Context = {
  url: URL | Location
  isClient: boolean
  initialState: Record<string, any>
  request?: IncomingMessage
  response?: ServerResponse
  [key: string]: any
}

export type Hook = (
  params: Context & {
    app: App
    router: Router
    initialRoute: RouteLocationNormalized
  }
) => HookResponse | Promise<HookResponse>

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
