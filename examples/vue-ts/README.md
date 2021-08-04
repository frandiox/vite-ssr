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

* Update `vite.config.ts`. See [updated vite.cofnig.ts].(https://github.com/thruthesky/vite-ssr/blob/vue-ts/examples/vue-ts/vite.config.ts).



* Create `./src/route.ts` and fill routes. See [updated ./src/route.ts].(https://github.com/thruthesky/vite-ssr/blob/vue-ts/examples/vue-ts/src/route.ts).

* Update `./src/main.ts`. It gets dummy data by an API call. See updated []./src/main.ts](https://github.com/thruthesky/vite-ssr/blob/vue-ts/examples/vue-ts/src/main.ts). 


* Create sub pages.

* Create `./src/index.css`

* Run `npx vite-ssr dev`

