import { useContext } from 'vite-ssr/vue'
import { useRoute } from 'vue-router'

export async function useFetchRepos() {
  const { initialState } = useContext()
  const { name } = useRoute()

  let state = initialState[name as string] || null

  if (!state) {
    state = await (
      await fetch('https://api.github.com/orgs/vuejs/repos')
    ).json()

    if (import.meta.env.SSR) {
      initialState[name as string] = state
    }
  }

  return state
}
