<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useFetchRepos } from '../state'

type Repo = {
  id: number
  name: string
  description: string
  stargazers_count: string
}

export default defineComponent({
  name: 'ReposPage',
  async setup() {
    const repos = ref<Repo[]>(await useFetchRepos())

    const removeRepo = (id: number) => {
      const i = repos.value.findIndex((item) => item.id === id)
      repos.value.splice(i, 1)
    }

    return {
      repos,
      removeRepo,
    }
  },
})
</script>

<template>
  <div>
    <h1>VueJs Org Repos</h1>
    <div
      v-for="repo of repos"
      :key="repo.id"
      style="padding: 4px; border: 1px solid gray; margin: 4px"
    >
      <div>
        <h3 :data-test="`name-${repo.name}`">Name: {{ repo.name }}</h3>
        <div :data-test="`desc-${repo.name}`">
          {{ repo.description }}
          <strong>{{ repo.stargazers_count }} stars</strong>
        </div>
        <button @click="removeRepo(repo.id)" :data-test="`remove-${repo.name}`">
          remove
        </button>
      </div>
    </div>
  </div>
</template>
