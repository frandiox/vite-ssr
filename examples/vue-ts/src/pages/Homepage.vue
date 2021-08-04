<template>
  <h1>This is the homepage. Server's getProps works: {{ server }}</h1>
  <p class="test">Message from server: {{ msg }}</p>

  <p>{{ homeLocalState }}</p>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'
import { useHead } from '@vueuse/head'

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
    // This is provided in main.js
    const initialState: any = inject('initialState')

    console.log('initState; ', initialState)

    // Hydrate from initialState, if there's anything
    const homeLocalState = ref(initialState.homeLocalState || null)

    useHead({
      title: 'Home - Vite SSR + Typescript!',
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
      // If there is no data in initial state, you can get it from your own API.
      const res: Response = await fetch(
        'https://jsonplaceholder.typicode.com/todos/1'
      )
      const json = (await res.json()) as any
      homeLocalState.value = json.title + ' ' + new Date().toLocaleString()

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
