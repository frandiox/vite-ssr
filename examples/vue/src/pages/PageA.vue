<template>
  <h1>Page A - Message from server: {{ msg }}</h1>
</template>

<script>
export default {
  name: 'PageA',
  props: {
    msg: String,
    server: Boolean,
    name: String,
  },
  mounted() {
    this.randomNumber = Math.random()
  },
  data() {
    return {
      randomNumber: 0,
      initialized: false,
      count: 0,
    }
  },
}
</script>
