<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/repos">Repos</RouterLink>
  </nav>

  <div>
    <button @click="count++">Count:{{ count }}</button>
  </div>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>

<script lang="ts">
import { useHead } from '@vueuse/head';
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'App',
  setup() {
    // Set title for testing
    useHead({
      title: 'vue-ts-head-v0-title',
    });

    return {
      count: ref(0),
    }
  },
})
</script>
