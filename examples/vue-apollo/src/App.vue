<template>
  <h1>A small state test for rehydration: {{ count }}</h1>
  <button @click="count++">Add to count</button>
  <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/a">Go to A</RouterLink>
    <RouterLink to="/b">Go to B</RouterLink>
  </nav>
  <h1>Below is the currently rendered route:</h1>

  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      count: 0,
    }
  },
}
</script>
<style scoped>
nav {
  width: 500px;
  display: flex;
  padding: 20px;
  justify-content: space-between;
  margin-left: auto;
  margin-right: auto;
  background: #efefef;
  border: 1px solid #ccc;
  margin-top: 20px;
  border-radius: 4px;
}
</style>
