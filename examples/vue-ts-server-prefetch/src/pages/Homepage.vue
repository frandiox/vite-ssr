<template>
  <h1>serverPrefetch Test</h1>
  <address v-for="user in users">
    {{ user.name }}
  </address>
</template>

<script setup lang="ts">
import { inject, onMounted, onServerPrefetch, ref } from 'vue'

const initialState: any = inject('initialState')

const users = ref(initialState.users || null)

onServerPrefetch(fetchData)

onMounted(() => {
  if (!users.value) {
    fetchData()
  }
})

async function fetchData() {
  const res: Response = await fetch(
    'https://jsonplaceholder.typicode.com/users'
  )
  users.value = (await res.json()) as any
  if (import.meta.env.SSR) {
    initialState['users'] = users.value
  }
}
</script>
