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

  <p>{{ homeLocalState }}</p>
</template>

<script>
import { defineComponent, inject, onBeforeMount, ref } from 'vue'

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
    name: {
      type: String,
      default: '',
    },
  },
  serverPrefetch() {
    return this.fetchMyLocalState()
  },
  setup() {
    // This is provided in main.js
    const initialState = inject('initialState')

    // Hydrate from initialState, if there's anything
    const homeLocalState = ref(initialState.homeLocalState || null)

    const fetchMyLocalState = async () => {
      if (!homeLocalState.value) {
        // No data, get it fresh from any API
        homeLocalState.value = await Promise.resolve(
          'This is local component state using serverPrefetch'
        )

        if (import.meta.env.SSR) {
          // Save this data in SSR initial state for hydration later
          initialState.homeLocalState = homeLocalState.value
        }
      }
    }

    onBeforeMount(fetchMyLocalState)

    return {
      fetchMyLocalState,
      homeLocalState,
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
