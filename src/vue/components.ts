import { ref, onMounted, defineComponent, inject, App } from 'vue'
import type { Context } from './types'

export const ClientOnly = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })

    return () => (show.value && slots.default ? slots.default() : null)
  },
})

const CONTEXT_SYMBOL = Symbol()
export function provideContext(app: App, context: Context) {
  app.provide(CONTEXT_SYMBOL, context)
}

export function useContext() {
  return inject(CONTEXT_SYMBOL) as Context
}
