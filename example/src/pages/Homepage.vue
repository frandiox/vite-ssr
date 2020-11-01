<template>
  <h1>This is the homepage. Server's getProps works: {{ server }}</h1>
  <p>Message from server: {{ msg }}</p>
</template>

<script>
export default {
  name: 'Homepage',
  props: {
    server: {
      type: Boolean,
      default: false,
    },
    msg: {
      type: String,
      default: '',
    },
  },
}
</script>
