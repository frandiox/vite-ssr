<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
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
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'App',
  setup() {
    return {
      count: ref(0),
    }
  },
})
</script>
