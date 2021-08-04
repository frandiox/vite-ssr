<template>
  <h1>Vite-SSR + Typescript</h1>
  <h2>A small state test for rehydration: {{ count }}</h2>
  <button @click="count++">Add to count</button>
  <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/a">Go to A</RouterLink>
    <RouterLink to="/b">Go to B</RouterLink>
  </nav>
  <h1>Below is the currently rendered route!:</h1>

  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<style lang="scss" scoped>
nav {
  margin: 1em auto 0;
  width: 500px;
  text-align: center;
  background-color: navy;
  a {
    display: inline-block;
    padding: 1em;
    color: white;
  }
}
</style>
