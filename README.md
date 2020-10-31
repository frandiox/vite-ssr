# Vite SSR

> Use Vite for server side rendering in Node or in a Cloudflare Worker

References:

- [@tbgse](https://github.com/tbgse)'s [vue3-vite-ssr-example](https://github.com/tbgse/vue3-vite-ssr-example/)
- [@l5x](https://github.com/l5x)'s [vue-ssr-cloudflare-workers-template](https://github.com/l5x/vue-ssr-cloudflare-workers-template)

## Usage

This is a WIP prototype, use with caution.

Create a normal [Vite](https://github.com/vitejs/vite) app.

Add `vite-ssr`:

```sh
yarn add vite-ssr
```

Add `vite-ssr/plugin` to your `vite.config.js` (see [`example/vite.config.js`](./example/vite.config.js) for an example)

See [`example/src/main.js`](./example/src/main.js) for further instructions.

## Development

Run `yarn` in `core`, then in `example` directory (order matters).

`yarn dev` starts Vite locally, whereas `yarn build` builds for production.

Test the production build with `yarn serve:node` for a Node server (run `yarn` in `node-site` first).
For testing in a Cloudflare worker, install [Wrangler](https://github.com/cloudflare/wrangler) globally, set your Cloudflare account ID in `worker-site/wrangler.toml`, run `yarn` in that directory and, finally, `yarn serve:worker`.

## Todos

- TypeScript
- Better docs
- Check if bundled files are correct or need more tree shaking
- Create a webworker-ready bundle using Rollup and remove Webpack
- Improve DX in this project (yarn workspaces or lerna)
