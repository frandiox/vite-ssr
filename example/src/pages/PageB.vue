<template>
  <h1>Page B - Message from server: {{ msg }}</h1>
</template>

<script>
export default {
  name: 'PageB',
  props: {
    msg: String,
  },
}
</script>
