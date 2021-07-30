import type { Context } from '../types'
import { createElement, ReactElement } from 'react'
// @ts-ignore
import createCache from '@emotion/cache'
// @ts-ignore
import { CacheProvider } from '@emotion/react'

function getCache() {
  const cache = createCache({ key: 'css' })
  cache.compat = true
  return cache
}

async function ssrCollector(context: Context) {
  // A subdependency of this dependency calls Buffer on import,
  // so it must be imported only in Node environment.
  // https://github.com/emotion-js/emotion/issues/2446
  // @ts-ignore
  let createEmotionServer: any = await import('@emotion/server/create-instance')
  createEmotionServer = createEmotionServer.default || createEmotionServer

  const cache = getCache()
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache)

  return {
    collect(app: ReactElement) {
      return createElement(CacheProvider, { value: cache }, app)
    },
    toString(html: string) {
      const emotionChunks = extractCriticalToChunks(html)
      return constructStyleTagsFromChunks(emotionChunks)
    },
  }
}

function clientProvider(context: Context) {
  const cache = getCache()

  return {
    provide(app: ReactElement) {
      return createElement(CacheProvider, { value: cache }, app)
    },
  }
}

// @ts-ignore
export default import.meta.env.SSR ? ssrCollector : clientProvider
