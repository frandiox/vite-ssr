<template>
  <h1>Page A</h1>
  <h3>{{ (result && result.hello && result.hello.otherAnswer) || '' }}</h3>
</template>

<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GET_HELLO = gql`
  query Hello($msg: String!) {
    hello(msg: $msg) {
      otherAnswer
    }
  }
`

export default {
  name: 'PageA',
  setup() {
    const { result } = useQuery(GET_HELLO, { msg: 'This is page A' })

    return {
      result,
    }
  },
}
</script>
