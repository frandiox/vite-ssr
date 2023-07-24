import type { App, Component } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouterOptions,
  Router,
} from 'vue-router'
import type { Unhead } from '@unhead/schema'
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

export interface Options extends SharedOptions {
  routes: ExtendedRouteRaw[]
  routerOptions?: Omit<RouterOptions, 'routes' | 'history'>
}

type HookResponse = void | {
  head?: Unhead<any>
}

export interface Context extends SharedContext {}

export interface HookParams extends Context {
  app: App
  router: Router
  initialRoute: RouteLocationNormalized
}

export interface Hook {
  (params: HookParams): HookResponse | Promise<HookResponse>
}

export interface ClientHandler {
  (App: Component, options: Options, hook?: Hook): Promise<void>
}

export interface SsrHandler {
  (App: Component, options: Options, hook?: Hook): Renderer
}
