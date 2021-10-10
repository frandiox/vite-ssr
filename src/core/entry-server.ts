import { createUrl } from '../utils/route'
import { useSsrResponse } from '../utils/response'
import { serializeState } from '../utils/state'
import { findDependencies, renderPreloadLinks } from '../utils/html'
import type {
  SsrHandler,
  SsrRenderer,
  Context,
  Options,
  SSRPageDescriptor,
} from './types'

export const viteSSR: SsrHandler = function viteSSR(options, hook) {
  const renderer: SsrRenderer = hook || (options as SsrRenderer)
  const { transformState = serializeState } = options as Options

  return async function (url, { manifest, preload = false, ...extra } = {}) {
    url = createUrl(url)

    // Server redirect utilities
    const { deferred, response, writeResponse, redirect, isRedirect } =
      useSsrResponse()

    const context = {
      url,
      isClient: false,
      initialState: {},
      redirect,
      writeResponse,
      ...extra,
    } as Context

    // Wait for either rendering finished or redirection detected
    const payload = await Promise.race([
      renderer(context, { ...extra, isRedirect }), // Resolves when rendering to string is done
      deferred.promise, // Resolves when 'redirect' is called
    ])

    // The 'redirect' utility has been called during rendering: skip everything else
    if (isRedirect()) return response

    // Not a redirect: get the HTML parts returned by the renderer and continue
    let {
      headTags = '',
      htmlAttrs = '',
      bodyAttrs = '',
      body = '',
    } = payload as SSRPageDescriptor

    // If a manifest is provided and the current framework is able to add
    // modules to the context (e.g. Vue) while rendering, collect the dependencies.
    const dependencies = manifest
      ? // @ts-ignore
        findDependencies(context.modules, manifest)
      : []

    if (preload && dependencies.length > 0) {
      headTags += renderPreloadLinks(dependencies)
    }

    // Serialize the state to include it in the DOM
    const initialState = await transformState(
      context.initialState || {},
      serializeState
    )

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      htmlAttrs,
      headTags,
      body,
      bodyAttrs,
      initialState,
      dependencies,
      ...response,
    }
  }
}

export default viteSSR
