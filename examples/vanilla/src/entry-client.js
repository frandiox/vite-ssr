import './index.css'
import viteSSR from 'vite-ssr/core/entry-client'

export default viteSSR((context) => {
  const { initialState } = context
  console.log('Serialized state from server:', initialState)

  // Hydrate page if necessary
  const clockNode = document.querySelector('#clock')
  if (clockNode) {
    const { clock = {} } = initialState

    setInterval(() => {
      clockNode.innerHTML = new Date().toLocaleTimeString(
        clock.locale,
        clock.options
      )
    }, 200)
  }
})
