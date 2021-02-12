# Vite SSR

`vite-ssr` creates one build for the server, used on first rendering, and another one for the client that takes over after the first rendering.

Supports Vite 2.

See [Vitedge](https://github.com/frandiox/vitedge) for SSR in Cloudflare Workers.

References:

- [@tbgse](https://github.com/tbgse)'s [vue3-vite-ssr-example](https://github.com/tbgse/vue3-vite-ssr-example/)

## Usage

Create a normal [Vite](https://github.com/vitejs/vite) app.

1. Add `vite-ssr` with your package manager (direct dependency).
2. Import `vite-ssr/plugin.js` in your `vite.config.js` file (see [`vite.config.js`](./example/vite.config.js) for an example).
3. You can import `vite-ssr/entry-client.js` or `vite-ssr/entry-server.js` depending on you environment. Or you can directly import from `vite-ssr` to get the corresponding handler according to the running environment (client or server). See an example in [`main.js`](./example/src/main.js).
4. Run `vite-ssr build` for buildling your app. Then, you can import the built files in your backend (see [`node-server/index.js`](./example/node-server/index.js) for an example).

While rendering the first view, you can provide the initial state in `route.meta.state` and `vite-ssr` will take care of rehydration in the client. See [`main.js`](./example/src/main.js) for an example.

## Development

Install dependencies using `yarn` in `core` and in `example`.

From `example` directory, `yarn dev` starts Vite locally, whereas `yarn build` builds for production.

Test the production build with `yarn serve:node` for a Node server (and for serving an API during development).

Run `yarn refresh` for moving latest version of `core` to `example/node_modules` (`yarn link` sucks).

~~For testing in a Cloudflare worker, install [Wrangler](https://github.com/cloudflare/wrangler) globally, set your Cloudflare account ID in `worker-site/wrangler.toml`, and run `yarn serve:worker`.~~ Cloudflare workers need more setup due to some restrictions in their environment. See [Vitedge](https://github.com/frandiox/vitedge) for that.

## Todos

- [x] TypeScript
- ~~Export a build plugin so a project can be built using `vite build` (not sure if it's possible)~~
- [x] Make `src/main.js` file name configurable
- [ ] Support build options in CLI (currently only configurable via JS API)
- [ ] Support React
- Better docs
