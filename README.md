# Vite SSR

`vite-ssr` creates one build for the server, used on first rendering, and another one for the client that takes over after the first rendering.

See [Vitedge](https://github.com/frandiox/vitedge) for SSR in Cloudflare Workers.

Note: this is a WIP prototype, use with caution.

References:

- [@tbgse](https://github.com/tbgse)'s [vue3-vite-ssr-example](https://github.com/tbgse/vue3-vite-ssr-example/)

## Usage

Create a normal [Vite](https://github.com/vitejs/vite) app.

Add `vite-ssr`:

```sh
yarn add vite-ssr
```

Add `vite-ssr/plugin` to your `vite.config.js` (see [`example/vite.config.js`](./example/vite.config.js) for an example)

See [`example/src/main.js`](./example/src/main.js) for further instructions. The name of this file (entry point) is specified in `example/index.html` (it can be renamed).

Use the following as an NPM script for buildling: `"build": "vite-ssr build"`

## Development

Install dependencies using `yarn` in `core` and in `example`.

From `example` directory, `yarn dev` starts Vite locally, whereas `yarn build` builds for production.

Test the production build with `yarn serve:node` for a Node server (and for serving an API during development).

Run `yarn refresh` for moving latest version of `core` to `example/node_modules` (`yarn link` sucks).

~~For testing in a Cloudflare worker, install [Wrangler](https://github.com/cloudflare/wrangler) globally, set your Cloudflare account ID in `worker-site/wrangler.toml`, and run `yarn serve:worker`.~~ Cloudflare workers need more setup due to some restrictions in their environment. See [Vitedge](https://github.com/frandiox/vitedge) for that.

## Todos

- ~~TypeScript~~
- Export a build plugin so a project can be built using `vite build` (not sure if it's possible)
- ~~Make `src/main.js` file name configurable~~
- Rethink router requirement (currently it relies on `vue-router`)
- Support React? (PRs welcome)
- Better docs
- Check if bundled files are correct or need more tree shaking
- Add a watcher utility to rebuild on file changes
