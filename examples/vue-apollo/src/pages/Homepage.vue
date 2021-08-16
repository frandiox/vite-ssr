<template>
  <h1>Page Home</h1>
  <h3>{{ (result && result.hello && result.hello.answer) || '' }}</h3>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GET_HELLO = gql`
  query Hello($msg: String!) {
    hello(msg: $msg) {
      answer
    }
  }
`

export default defineComponent({
  name: 'Homepage',
  setup() {
    const { result } = useQuery(GET_HELLO, { msg: 'This is the home page' })

    return {
      result,
    }
  },
})
</script>

<style scoped>
.test {
  color: #333;
}
</style>
