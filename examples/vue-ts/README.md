# Vue-SSR + Vue 3 + Typescript

## What I did to make it work

* Create a vite project with Typescript support.
  * `npm init vite@latest vue-ts -- --template vue-ts`

* Run to install vite
  * `cd vute-ts`
  * `npm i`

* Disable `Veture` and install `Volar` as recommened for using `<script setup>`

  * And create `.vscode/settings.json` with the following setting for supporting `*.vue` typing.

```json
{
  "volar.tsPlugin": true
}
```

  * You may enable the plugin in settings page and VSCode my reload few times.


* Install `vite-ssr` plugin and other necessary modules.
  * `npm i vite-ssr vue-router @vueuse/head`
  * `npm i -D @vue/server-renderer`

* Update `vite.config.ts`. See the updated sample code.

```ts
import { defineConfig } from 'vite'
import viteSSR from 'vite-ssr/plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [viteSSR(), vue()],
})
```

* Create `./src/route.ts` with the following

```

* Update `./src/main.ts` with the following


* And copy [pages from the example](https://github.com/thruthesky/vite-ssr/tree/master/examples/vue/src/pages) and fix them for Typescript support.

* Create `./src/index.css`

* Add api data at `./public/api/data.json`.

