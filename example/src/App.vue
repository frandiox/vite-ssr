<template>
  <h1>A small state test for rehydration: {{ count }}</h1>
  <button @click="count++">Add to count</button>
  <nav>
    <router-link to="/">Go to Home</router-link>
    <router-link to="/a">Go to A</router-link>
    <router-link to="/b">Go to B</router-link>
  </nav>
  <h1>Below is the currently rendered route:</h1>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
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
