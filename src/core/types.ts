import type { Renderer, SharedContext, SharedOptions } from '../utils/types'

export interface Options extends Pick<SharedOptions, 'transformState'> {
  url?: string | Location | URL
  spaRedirect?: (location: string) => void
}

export interface Context extends SharedContext {}

export interface SSRPageDescriptor {
  headTags?: string
  htmlAttrs?: string
  bodyAttrs?: string
  body?: string
}

export interface SsrRenderer {
  (context: Context, utils: { isRedirect: () => boolean }):
    | SSRPageDescriptor
    | Promise<SSRPageDescriptor>
}

export interface SsrHandler {
  (App: SsrRenderer, options?: Options): Renderer
}

export interface ClientHandler {
  (App: (context: Context) => void, options?: Options): Promise<void>
}
