import { h, ref, onMounted, defineComponent, watchEffect } from 'vue'

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

export const Helmet = defineComponent({
  name: 'Helmet',
  props: {
    title: {
      type: String,
      default: null,
    },
    meta: {
      type: Array,
      default: () => [],
    },
    script: {
      type: Array,
      default: () => [],
    },
    link: {
      type: Array,
      default: () => [],
    },
    bodyAttrs: {
      type: Object,
      default: null,
    },
    htmlAttrs: {
      type: Object,
      default: null,
    },
  },
  setup(props, { slots }) {
    onMounted(() => {
      watchEffect(() => {
        if (props.title !== null) {
          document.title = props.title
        }
      })

      watchEffect(() => {
        if (props.htmlAttrs) {
          Object.entries(props.htmlAttrs).forEach(([key, value]) =>
            document.documentElement.setAttribute(key, value)
          )
        }
      })

      watchEffect(() => {
        if (props.bodyAttrs) {
          Object.entries(props.bodyAttrs).forEach(([key, value]) => {
            document.body.setAttribute(key, value)
          })
        }
      })
    })

    return () => {
      if (typeof document !== 'undefined') {
        return null
      }

      const children = []
      if (props.bodyAttrs) {
        children.push(h('body', props.bodyAttrs))
      }

      children.push(
        h('head', {}, [
          ...(props.title ? [h('title', {}, props.title)] : []),
          ...props.meta.map((item) => h('meta', item)),
          ...props.link.map((item) => h('link', item)),
          ...props.script.map(({ content, ...item }) =>
            h('script', {
              ...item,
              ...(content && { innerHTML: content }),
            })
          ),
          ...(slots.default ? slots.default() : []),
        ])
      )

      return h('html', props.htmlAttrs, children)
    }
  },
})
