import { Dispatch, useState } from 'react'
import { useContext } from 'vite-ssr/react'

const isLoading: Record<string, boolean> = {}

export function useFetch<T = any>(url: string) {
  const { initialState } = useContext()

  const [state, setState] = useState(initialState[url])

  if (!state && !isLoading[url]) {
    isLoading[url] = true
    throw fetch(url)
      .then((result) => result.json())
      .then((result) => {
        isLoading[url] = false
        setState((initialState[url] = result))
      })
  }

  return [state, setState] as [T, Dispatch<T>]
}

export function useFetchRepos<T = any>() {
  return useFetch<T>('https://api.github.com/orgs/vuejs/repos')
}
