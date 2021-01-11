<template>
  <Helmet
    :html-attrs="{ lang: 'es' }"
    :body-attrs="{ class: 'dummy test' }"
    :link="[{ rel: 'stylesheet' }]"
    :script="[{ type: 'application/ld+json', content: json }]"
    title="Home!"
  >
    <meta name="description" content="This should be moved to head" />
  </Helmet>

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
  setup() {
    return {
      json: JSON.stringify({ something: true }),
    }
  },
}
</script>
