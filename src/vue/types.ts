import type { App, Component } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouterOptions,
  Router,
} from 'vue-router'
import type { HeadClient } from '@vueuse/head'
import type {
  Meta,
  Renderer,
  SharedContext,
  SharedOptions,
} from '../utils/types'

export type ExtendedRouteRaw = RouteLocationRaw & {
  props?: any
  meta?: Meta
}

export type ExtendedRouteNormalized = RouteLocationNormalized & {
  props?: any
  meta?: Meta
}

export type Options = SharedOptions & {
  routes: ExtendedRouteRaw[]
  routerOptions?: Omit<RouterOptions, 'routes' | 'history'>
}

type HookResponse = void | {
  head?: HeadClient
}

export type Context = SharedContext & {
  router: Router
}

export type HookParams = Context & {
  app: App
  router: Router
  initialRoute: RouteLocationNormalized
}

export type Hook = (params: HookParams) => HookResponse | Promise<HookResponse>

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
