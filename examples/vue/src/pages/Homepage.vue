<template>
  <div>
    <h1>This is the homepage. Server's getProps works: {{ server }}</h1>
    <p class="test">Message from server: {{ msg }}</p>

    <p>{{ homeLocalState }}</p>
  </div>
</template>

<script>
import { defineComponent, inject, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useContext } from 'vite-ssr/vue'

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
  async setup() {
    const { initialState } = useContext()

    // Hydrate from initialState, if there's anything
    const homeLocalState = ref(initialState.homeLocalState || null)

    useHead({
      title: 'Home!',
      htmlAttrs: { lang: 'es' },
      bodyAttrs: { class: 'dummy test' },
      meta: [
        { name: 'description', content: 'This should be moved to head' },
        { property: 'test', content: homeLocalState },
      ],
      link: [{ rel: 'stylesheet' }],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({ something: true }),
        },
      ],
    })

    if (!homeLocalState.value) {
      // No data, get it fresh from any API
      homeLocalState.value = await new Promise((resolve) =>
        setTimeout(
          () => resolve('This is local component state using Suspense'),
          500
        )
      )

      if (import.meta.env.SSR) {
        // Save this data in SSR initial state for hydration later
        initialState.homeLocalState = homeLocalState.value
      }
    }

    return {
      homeLocalState,
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
