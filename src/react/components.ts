import {
  useState,
  useEffect,
  createElement,
  Fragment,
  FunctionComponent,
} from 'react'

export const ClientOnly: FunctionComponent = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true))

  return mounted ? createElement(Fragment, { children }) : null
}
