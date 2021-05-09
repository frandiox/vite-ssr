<p align="center">
  <img width="180" src="./logo.svg" alt="Vite SSR logo">
</p>

# Vite SSR

Simple yet powerlful Server Side Rendering for Vite 2 in Node.js.

- ⚡ Lightning Fast HMR (powered by Vite, even in SSR mode).
- 💁‍♂️ Consistent DX experience abstracting most of the SSR complexity.
- 🔍 Small library, unopinionated about your page routing and API logic.
- 🔥 Fast and SEO friendly thanks to SSR, with SPA takeover for snappy UX.
- 🧱 Compatible with Vite's plugin ecosystem such as file-based routing, PWA, etc.

Start a new SSR project right away using Vue, filesystem routes, page layouts, icons auto-import and more with [Vitesse SSR template](https://github.com/frandiox/vitesse-ssr-template). See [live demo](https://vitesse-ssr.vercel.app/).

Vite SSR can be deployed to any Node.js or browser-like environment, including serverless platforms like Vercel, Netlify, or even Cloudflare Workers. It can create pages dynamically from a cloud function and cache the result at the edge network for subsequent requests, effectively behaving as statically generated pages with no cost.

See [Vitedge](https://github.com/frandiox/vitedge) for a more opinionated and fullstack setup.

## Installation

Create a normal [Vite](https://vitejs.dev/guide/) project for Vue or React.

```sh
yarn create @vitejs/app my-app --template [vue|vue-ts|react|react-ts]
```

Then, add `vite-ssr` with your package manager (direct dependency) and your framework router.

```sh
# For Vue
yarn add vite-ssr vue@3 vue-router@4 @vueuse/head

# For React
yarn add vite-ssr react@16 react-router-dom@5
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

Then, simply import the main Vite SSR handler in your main entry file as follows. See full examples for [Vue](./examples/vue/src/main.js) and [React](./examples/react/src/main.jsx).

```js
import App from './App' // Vue or React main app
import routes from './routes'
import viteSSR from 'vite-ssr'

export default viteSSR(App, { routes }, (context) => {
  /* custom logic */
  /* const { app, router, initialState, ... } = context */
})
```

That's right, in Vite SSR **there's only 1 single entry file** by default 🎉. It will take care of providing your code with the right environment.

If you need conditional logic that should only run in either client or server, use Vite's `import.meta.env.SSR` boolean variable and the tree-shaking will do the rest.

<details><summary>Available options</summary>
<p>

The previous handler accepts the following options as its second argument:

- `routes`: Array of routes, according to each framework's router (see [`vue-router`](https://next.router.vuejs.org/api/#routerecordraw) or [`react-router-config`](https://www.npmjs.com/package/react-router-config#route-configuration-shape)).
- `base`: Function that returns a string with the router base. Can be useful for i18n routes or when the app is not deployed at the domain root.
- `pageProps.passToPage`: Whether each route's `initialState` should be automatically passed to the page components as props.
- `debug.mount`: Pass `false` to prevent mounting the app in the client. You will need to do this manually on your own but it's useful to see differences between SSR and hydration.

</p>
</details>

<details><summary>Using separate entry files</summary>
<p>

Even though Vite SSR uses 1 single entry file by default, thus abstracting complexity from your app, you can still have separate entry files for client and server if you need more flexibility. This can happen when building a library on top of Vite SSR, for example.

Simply provide the entry file for the client in `index.html` (as you would normally do in an SPA) and pass the entry file for the server as a CLI flag: `vite-ssr [dev|build] --ssr <path/to/entry-server>`.

Then, import the main SSR handlers for the entry files from `vite-ssr/vue/entry-client` and `vite-ssr/vue/entry-server` instead. Use `vite-ssr/react/*` for React.

</p>
</details>

## SSR initial state and data fetching

The SSR initial state is the application data that is serialized as part of the server-rendered HTML for later hydration in the browser. This data is normally gathered using fetch or DB requests from your API code.

Vite SSR initial state consists of a plain JS object that is passed to your application and can be modified at will during SSR. This object will be serialized and later hydrated automatically in the browser, and passed to your app again so you can use it as a data source.

```js
export default viteSSR(App, { routes }, ({ initialState }) => {
  if (import.meta.env.SSR) {
    // Write in server
    initialState.myData = 'DB/API data'
  } else {
    // Read in browser
    console.log(initialState.myData) // => 'DB/API data'
  }

  // Provide the initial state to your stores, components, etc. as you prefer.
})
```

<details><summary>Initial state in Vue</summary>
<p>

Vue has multiple ways to provide the initial state to Vite SSR:

- Calling your API before entering a route (Router's `beforeEach` or `beforeEnter`) and populate `route.meta.state`. Vite SSR will get the first route's state and use it as the SSR initial state. See a full example [here](./examples/vue/src/main.js).

```js
export default viteSSR(App, { routes }, async ({ app }) => {
  router.beforEach((to, from, next) => {
    if (to.meta.state) {
      return next() // Already has state
    }

    const response = await fetch('my/api/data')

    // This will modify initialState
    to.meta.state = await response.json()

    next()
  })
})
```

- Calling your API directly from Vue components and save the result in the SSR initial state. You can rely on Vue's [`serverPrefetch`](https://ssr.vuejs.org/api/#serverprefetch) or [`suspense`](https://v3.vuejs.org/guide/migration/suspense.html) to await for your data and then render the view. See a full example with `suspense` [here](./examples/vue/src/pages/Homepage.vue).

```js
// Main
export default viteSSR(App, { routes }, ({ app, initialState }) => {
  // You can pass it to your state management, if you like that
  const store = createStore({ state: initialState /* ... */ })
  app.use(store)

  // Or provide it to child components
  app.provide('initial-state', initialState)
})

// Page Component with Server Prefetch
export default {
  async serverPrefetch() {
    await this.fetchMyData()
  },
  async beforeMount() {
    await this.fetchMyData()
  },
  methods: {
    async fetchMyData() {
      const data = await (await fetch('my/api/data')).json()
      const store = useStore()
      store.commit('myData', data)
    },
  },
}
```

```js
// Page Component with Async Setup
export default {
  async setup() {
    const data = await (await fetch('my/api/data')).json()
    const store = useStore()
    store.commit('myData', data)

    return { data }
  },
}

// Use Suspense in your app root
<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>
```

</p>
</details>

<details><summary>Initial state in React</summary>
<p>

There are a few ways to provide initial state in React:

- Call your API and throw a promise in order to leverage React's Suspense (in both browser and server) anywhere in your components. Vite SSR is already adding Suspense to the root so you don't need to provide it.

```jsx
function App({ initialState }) {
  if (!initialState.ready) {
    const promise = getPageProps(route).then((state) => {
      Object.assign(initialState, state)
      initialState.ready = true
    })

    // Throw the promise so Suspense can await it
    throw promise
  }

  return <div>{initialState}</div>
}
```

- Calling your API before entering a route and populate `route.meta.state`. Vite SSR will get the first route's state and use it as the SSR initial state. See a full example [here](./examples/react/src/api.jsx).

```jsx
function App({ router }) {
  // This router is provided by Vite SSR.
  // Use it to render routes and save initial state.

  return (
    <Switch>
      {router.routes.map((route) => {
        if (!route.meta.state) {
          // Call custom API and return a promise
          const promise = getPageProps(route).then((state) => {
            // This is similar to modifying initialState in the previous example
            route.meta.state = state
          })

          // Throw the promise so Suspense can await it
          throw promise
        }

        return (
          <Route key={route.path} path={route.path}>
            <route.component props={...route.meta.state} />
          </Route>
        )
      })}
    </Switch>
  )
}
```

</p>
</details>

### State serialization

Vite SSR simply uses `JSON.stringify` to serialize the state, escapes certain characters to prevent XSS and saves it in the DOM. This behavior can be overriden by using the `transformState` hook in case you need to support dates, regexp or function serialization:

```js
import viteSSR from 'vite-ssr'
import App from './app'
import routes from './routes'

export default viteSSR(App, {
  routes,
  transformState(state, defaultTransformer) {
    if (import.meta.env.SSR) {
      // Serialize during SSR by using,
      // for example, using @nuxt/devalue
      return customSerialize(state)

      // -- Or use the defaultTransformer after modifying the state:
      // state.apolloCache = state.apolloCache.extract()
      // return defaultTransformer(state)
    } else {
      // Deserialize in browser
      return customDeserialize(state)
    }
  },
})
```

## Accessing `response` and `request` objects.

In development, both `response` and `request` objects are passed to the main hook during SSR:

```js
export default viteSSR(
  App,
  { routes },
  ({ initialState, request, response }) => {
    // Access request cookies, etc.
  }
)
```

In production, you control the server so you must pass these objects to the rendering function in order to have them available in the main hook:

```js
import render from './dist/server'

//...

const { html } = await render(url, {
  manifest,
  preload: true,
  request,
  response,
  // Anything here will be available in the main hook.
  initialState: { hello: 'world' }, // Optional prefilled state
})
```

Beware that, in development, Vite uses plain Node.js + Connect for middleware. Therefore, the `request` and `response` objects might differ from your production environment if you use any server framework such as Fastify, Express.js or Polka.

## Head tags and global attributes

Use your framework's utilities to handle head tags and attributes for html and body elements.

<details><summary>Vue Head</summary>
<p>

Install [`@vueuse/head`](https://github.com/vueuse/head) as follows:

```js
import { createHead } from '@vueuse/head'

export default viteSSR(App, { routes }, ({ app }) => {
  const head = createHead()
  app.use(head)

  return { head }
})

// In your components:
// import { useHead } from '@vueuse/head'
// ... useHead({ ... })
```

</p>
</details>

<details><summary>React Helmet</summary>
<p>

Use [`react-helmet-async`](https://github.com/staylor/react-helmet-async) from your components (similar usage to `react-helmet`). The provider is already added by Vite SSR.

```jsx
import { Helmet } from 'react-helmet-async'

// ...
;<>
  <Helmet>
    <html lang="en" />
    <meta charSet="utf-8" />
    <title>Home</title>
    <link rel="canonical" href="http://mysite.com/example" />
  </Helmet>
</>
```

</p>
</details>

## Rendering only in client/browser

Vite SSR exports `ClientOnly` component that renders its children only in the browser:

```jsx
import { ClientOnly } from 'vite-ssr'

//...
;<div>
  <ClientOnly>
    <div>...</div>
  </ClientOnly>
</div>
```

## Development

There are two ways to run the app locally for development:

- SPA mode: `vite dev` command runs Vite directly without any SSR.
- SSR mode: `vite-ssr dev` command spins up a local SSR server. It supports similar attributes to Vite CLI, e.g. `vite-ssr --port 1337 --open`.

SPA mode will be slightly faster but the SSR one will have closer behavior to a production environment.

## Production

Run `vite-ssr build` for buildling your app. This will create 2 builds (client and server) that you can import and use from your Node backend. See an Express.js example server [here](./examples/node-server/index.js), or a serverless function deployed to Vercel [here](https://github.com/frandiox/vitesse-ssr-template/blob/master/serverless/api/index.js).

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
- [ ] Research if `vite-ssr` CLI logic can be moved to the plugin in Vite 2 to use `vite` command instead.
- [x] Docs
