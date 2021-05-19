// Example API

const { buildSchema, graphql } = require('graphql')

const schema = buildSchema(`
  type Hello {
    answer: String!
    otherAnswer: String!
  }
  type Query {
    hello (msg: String!): Hello!
  }
`)

// The root provides a resolver function for each API endpoint
const root = {
  hello: ({ msg }) => ({
    answer: `Graphql Server: Hello world! ${msg}`,
    otherAnswer: `Graphql Server: Something else! ${msg}`,
  }),
}

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let bodyJs = {}
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = [
  {
    route: '/api/getProps',
    method: 'get',
    handler(req, res) {
      const url = new URL('http://e.c' + req.originalUrl)
      console.log('getProps', url.searchParams.toString())
      const routeName = url.searchParams.get('name') || ''
      res.end(
        JSON.stringify({
          name: routeName,
          server: true,
          msg: 'This is page ' + routeName.toUpperCase(),
        })
      )
    },
  },
  {
    route: '/graphql',
    method: 'post',
    async handler(req, res) {
      const body = await parseBody(req)

      const data = await graphql(
        schema,
        body.query,
        root,
        body.operationName,
        body.variables
      )

      res.setHeader('Cache-Control', 'max-age=0')
      res.end(JSON.stringify(data))
    },
  },
]
