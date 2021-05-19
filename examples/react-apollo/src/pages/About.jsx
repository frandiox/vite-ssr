import React from 'react'
import { gql, useQuery } from '@apollo/client'

const GET_HELLO = gql`
  query Hello($msg: String!) {
    hello(msg: $msg) {
      otherAnswer
    }
  }
`

export default function About(props) {
  const getGraphHello = () => {
    const { loading, data } = useQuery(GET_HELLO, {
      variables: { msg: 'This is ABOUT page' },
    })

    if (loading) {
      return <p>Loading ...</p>
    }

    return <h3>{(data && data.hello && data.hello.otherAnswer) || ''}</h3>
  }

  return (
    <>
      <h1>About</h1>
      <div>{getGraphHello()}</div>
    </>
  )
}
