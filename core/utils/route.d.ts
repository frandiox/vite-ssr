declare module 'vite-ssr/utils/route' {
  export const withPrefix: (string: string, prefix: string) => string
  export const withoutPrefix: (string: string, prefix: string) => string
  export const withSuffix: (string: string, suffix: string) => string
  export const withoutSuffix: (string: string, suffix: string) => string
  export const joinPaths: (paths: string[]) => string
  export const createUrl: (urlLike: string) => URL
  export const getFullPath: (url: string | URL, routeBase?: string)
}
