<p align="center">
  <img width="180" src="./logo.svg" alt="Vite SSR logo">
</p>

# Vite SSR

Server Side Rendering for Vite 2 in Node.js. Supports Vue and React (Svelte WIP).

- ⚡ Lightning Fast HMR (powered by Vite, even in SSR mode).
- 💁‍♂️ Consistent DX experience abstracting most of the SSR complexity.
- 🔍 Small library, unopinionated about your API logic and page routing.

[Live demo](https://vitesse-ssr.vercel.app/) of Vitesse + Vite SSR.

> See [Vitedge](https://github.com/frandiox/vitedge) for SSR in Cloudflare Workers.

## Installation

Create a normal [Vite](https://vitejs.dev/guide/) project for Vue or React.

```sh
yarn create @vitejs/app my-app --template vue
yarn create @vitejs/app my-app --template vue-ts

yarn create @vitejs/app my-app --template react
yarn create @vitejs/app my-app --template react-ts
```

Then, add `vite-ssr` with your package manager (direct dependency) and your framework router.

```sh
yarn add vite-ssr vue-router@4

yarn add vite-ssr react-router-dom@5
```

## Usage

Add Vite SSR plugin to your Vite config file (see [`vite.config.js`](./examples/vue/vite.config.js) for a full example).

```js
// vite.config.js
import vue from '@vitejs/plugin-vue'
import viteSSR from 'vite-ssr/plugin.js'
// import reactRefresh from '@vitejs/plugin-react-refresh'

export default {
  plugins: [
    viteSSR(),
    vue(), // reactRefresh()
  ],
}
```

Import Vite SSR wrapper in your main entry file as follows. See full examples for [Vue](./examples/vue/src/main.js) and [React](./examples/react/src/main.jsx).

```js
import App from './App' // Vue or React main app
import routes from './routes'
import viteSSR from 'vite-ssr'

export default viteSSR(App, { routes }, (context) => {
  /* custom logic */
})
```

That's right, in Vite SSR **there's only 1 single entry file** by default. The plugin will take care of providing your code with the right environment.
If you need conditional logic that should only run in either client or server, use Vite's `import.meta.env.SSR` boolean variable and the tree-shaking will do the rest.

If you are building a library on top of Vite SSR or for whatever reason you need to separate the entry files, provide the client entry file in `index.html` (as in a normal Vite app) and pass the server entry file as a CLI flag: `vite-ssr [build|dev] --ssr ./src/entry-server.js`. Then, import the main Vite SSR handler from `vite-ssr/vue/entry-client` or `vite-ssr/vue/entry-server` directly (or `vite-ssr/react/*`).

### SSR initial state

The SSR initial state is the application data that is serialized as part of the server-rendered HTML for later hydration in the browser. This data is normally gathered using fetch or DB requests from your API code.

#### Initial state in Vue

Vue has multiple ways to provide the initial state to Vite SSR:

- Call your API before entering a route (Router's `beforeEach` or `beforeEnter`) and populate `route.meta.state`. Vite SSR will get the first route's state and use it as the SSR initial state. See an example [here](./examples/vue/src/main.js).

- Use Vue's `serverPrefetch` to call your API from any component and save the result in the SSR initial state. See an example [here](./examples/vue/src/pages/Homepage.vue).

#### Initial state in React

Unlike Vue, React and its router don't provide yet any mechanism to allow easy data prefetch in SSR (perhaps Suspense or Server Components will make it possible when they are stable).

Therefore, the only way to add initial state is returning it from the main Vite SSR hook. See [`main.jsx`](./examples/react/src/main.jsx) for an example.

## Development

There are 2 ways to run the app locally for development:

- SPA mode: `vite dev` command runs Vite directly without any SSR.
- SSR mode: `vite-ssr dev` command spins up a local SSR server. It supports similar attributes to Vite CLI, e.g. `vite-ssr --port 1337 --open`.

SPA mode will be faster but the SSR one will have closer behavior to a production environment.

## Production

Run `vite-ssr build` for buildling your app. This will create 2 builds (client and server) that you can import and use from your Node backend. See an Express.js example server [here](./examples/node-server/index.js).

Provide `--ssr <entry-file-path>` if you want to use a different entry file for the server. This is mostly useful if you are wrapping Vite SSR in another library.

## References

The following projects served as learning material to develop this tool:

- [@tbgse](https://github.com/tbgse)'s [vue3-vite-ssr-example](https://github.com/tbgse/vue3-vite-ssr-example/)

## Todos

- [x] TypeScript
- [x] Make `src/main.js` file name configurable
- [x] Support build options as CLI flags (`--ssr entry-file` supported)
- [x] Support React
- [x] SSR dev-server
- [x] Make SSR dev-server similar to Vite's dev-server (options, terminal output)
- [ ] Research if `vite-ssr` CLI logic can be moved to the plugin to use `vite` command instead.
- [x] Docs
