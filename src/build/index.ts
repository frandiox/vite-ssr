import { ssrBuild, build } from 'vite';
import replace from '@rollup/plugin-replace';
import path from 'path';
import mergeOptions from 'merge-options'
import { BuildConfig } from 'vite'
import config from '../plugin'
import resolveEntryPoint from './utils'

mergeOptions.bind({ concatArrays: true })
const [name] = Object.keys(config.alias)

type Options = {
  clientOptions?: BuildConfig | {};
  ssrOptions?: BuildConfig | {};
}

export default async ({ clientOptions = {}, ssrOptions = {} }: Options = {}) => {
  const clientResult = await build(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/client'),
        alias: config.alias,
      },
      clientOptions
    )
  )

  await ssrBuild(
    mergeOptions(
      {
        outDir: path.resolve(process.cwd(), 'dist/ssr'),
        alias: {
          [name]: path.resolve(__dirname, '../entry-server'),
        },
        rollupInputOptions: {
          ...config.rollupInputOptions,
          input: await resolveEntryPoint(),
          plugins: [
            replace({
              __VITE_SSR_HTML__: clientResult[0].html.replace(
                '<div id="app"></div>',
                '<div id="app" data-server-rendered="true">${html}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>'
              ),
            }),
          ],
        },
        rollupOutputOptions: config.rollupOutputOptions,
      },
      ssrOptions
    )
  )
}
