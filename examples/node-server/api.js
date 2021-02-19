// Example API

module.exports = [
  {
    route: '/api/getProps',
    handler(req, res) {
      const url = new URL('http://e.c' + req.originalUrl)
      console.log('getProps', url.searchParams.toString())
      res.end(
        JSON.stringify({
          server: true,
          msg:
            'This is page ' +
            (url.searchParams.get('name') || '').toUpperCase(),
        })
      )
    },
  },
]
