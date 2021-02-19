import React from 'react'

export default function Home(props) {
  return (
    <>
      <h1>Home</h1>
      <p>{JSON.stringify(props, null, 2)}</p>
    </>
  )
}
