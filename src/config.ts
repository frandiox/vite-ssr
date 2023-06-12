import fs from 'fs'
import path from 'path'
import { resolveConfig, ResolvedConfig, InlineConfig } from 'vite'

export interface BuildOptions {
  /**
   * Vite options applied only to the client build
   */
  clientOptions?: InlineConfig
  /**
   * Vite options applied only to the server build
   */
  serverOptions?: InlineConfig & {
    /**
     * Extra properties to include in the generated server package.json,
     * or 'false' to avoid generating it.
     */
    packageJson?: Record<string, unknown> | false
  }
}

export interface ViteSsrPluginOptions {
  /**
   * Path to entry index.html
   * @default '<root>/index.html'
   */
  input?: string
  /**
   * ID of the app container in index.html. Defaults to "app".
   */
  containerId?: string
  /**
   * ID of the body teleports container in index.html. Defaults to "body-teleports".
   */
  bodyTeleportsId?: string
  build?: BuildOptions & {
    /**
     * Keep the index.html generated in the client build
     * @default false
     */
    keepIndexHtml?: boolean
  }
  excludeSsrComponents?: Array<RegExp>
  features?: {
    /**
     * Use '@apollo/client' renderer if present
     * @default true
     */
    reactApolloRenderer?: boolean
  }
}

export const INDEX_HTML = 'index.html'

export function getPluginOptions(viteConfig: ResolvedConfig) {
  return ((
    viteConfig.plugins.find((plugin) => plugin.name === 'vite-ssr') as any
  )?.viteSsrOptions || {}) as ViteSsrPluginOptions
}

export async function resolveViteConfig(mode?: string) {
  return resolveConfig(
    {},
    'build',
    mode || process.env.MODE || process.env.NODE_ENV
  )
}

export async function getEntryPoint(
  config?: ResolvedConfig,
  indexHtml?: string
) {
  if (!config) {
    config = await resolveViteConfig()
  }

  if (!indexHtml) {
    indexHtml = await fs.promises.readFile(
      getPluginOptions(config).input || path.resolve(config.root, INDEX_HTML),
      'utf-8'
    )
  }

  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i)

  const entryFile = matches?.[1] || 'src/main'

  return path.join(config.root, entryFile)
}
