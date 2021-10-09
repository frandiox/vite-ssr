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
  (p1: SsrRenderer | Options, p2?: SsrRenderer): Renderer
}

export interface ClientHook {
  (context: Context): void
}
export interface ClientHandler {
  (p1: ClientHook | Options, p2?: ClientHook): Promise<Context>
}
