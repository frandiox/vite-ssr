import React from 'react'
import { Helmet } from 'react-helmet-async'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'

const H1 = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`

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
    return <h3>{(data && data.hello && data.hello.answer) || ''}</h3>
  }

  return (
    <>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <title>Home</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>

      <H1>Home</H1>

      <div>{getGraphHello()}</div>
    </>
  )
}
