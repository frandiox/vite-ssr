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
  <p class="test">Message from server: {{ msg }}</p>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
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
    // This will be removed from the client build
    if (import.meta.env.SSR) {
      // Vite/plugin-vue is injecting this function in the setup scope
      const { initialState } = useSSRContext()
      // Initial state is mutable and will be hydrated in the client
      initialState.perkele = true
    }

    return {
      json: JSON.stringify({ something: true }),
    }
  },
})
</script>

<style scoped>
.test {
  color: #333;
}
</style>
>
