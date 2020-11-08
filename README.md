# Vite SSR

`vite-ssr` creates one build for the server, used on first rendering, and another one for the client that takes over after the first rendering.

See [Vitedge](https://github.com/frandiox/vitedge) for SSR in Cloudflare Workers.

Note: this is a WIP prototype, use with caution.

References:

- [@tbgse](https://github.com/tbgse)'s [vue3-vite-ssr-example](https://github.com/tbgse/vue3-vite-ssr-example/)
- [@l5x](https://github.com/l5x)'s [vue-ssr-cloudflare-workers-template](https://github.com/l5x/vue-ssr-cloudflare-workers-template)

## Usage

Create a normal [Vite](https://github.com/vitejs/vite) app.

Add `vite-ssr`:

```sh
yarn add vite-ssr
```

Add `vite-ssr/plugin` to your `vite.config.js` (see [`example/vite.config.js`](./example/vite.config.js) for an example)

See [`example/src/main.js`](./example/src/main.js) for further instructions.

Use the following as an NPM script for buildling: `"build": "vite-ssr build"`

## Development

Run `yarn setup` in root directory (that will install all the dependencies).

`yarn dev` starts Vite locally, whereas `yarn build` builds for production.

Test the production build with `yarn serve:node` for a Node server.

~~For testing in a Cloudflare worker, install [Wrangler](https://github.com/cloudflare/wrangler) globally, set your Cloudflare account ID in `worker-site/wrangler.toml`, and run `yarn serve:worker`.~~ Cloudflare workers need more setup due to some restrictions in their environment. See [Vitedge](https://github.com/frandiox/vitedge) for that.

If anything in `core` directory is modified, run `yarn refresh` to make sure that `example` gets the latest version.

## Todos

- TypeScript
- Export a build plugin so a project can be built using `vite build` (not sure if it's possible)
- Make `src/main.js` file name configurable
- Rethink router requirement (currently it relies on `vue-router`)
- Support React? (PRs welcome)
- Better docs
- Check if bundled files are correct or need more tree shaking
- Create a webworker-ready bundle using Rollup and remove Webpack
- Improve DX in this project (yarn workspaces or lerna)
