// TODO Research how to make a compatible 1-file bundle with Rollup so Webpack is not needed
// Does Rollup support "target webworker"?
module.exports = {
  entry: './index',
  target: 'webworker',
  resolve: { mainFields: ['main', 'module'] },
}
