import React from 'react'

export default function Home(props) {
  console.log('cachondeo', Object.keys(props))
  return (
    <>
      <h1>Home</h1>
      <p>{JSON.stringify(props, null, 2)}</p>
    </>
  )
}
