import React from 'react'
import { Helmet } from 'react-helmet-async'
import { gql, useQuery } from '@apollo/client'

const GET_HELLO = gql`
  query Hello($msg: String!) {
    hello(msg: $msg) {
      answer
    }
  }
`

export default function Home(props) {
  const getGraphHello = () => {
    const { loading, data } = useQuery(GET_HELLO, {
      variables: { msg: 'This is HOME page' },
    })

    if (loading) {
      return <p>Loading ...</p>
    }
    return <h3>{data?.hello?.answer || ''}</h3>
  }

  return (
    <>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <title>Home</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>

      <h1>Home</h1>

      <div>{getGraphHello()}</div>
    </>
  )
}
