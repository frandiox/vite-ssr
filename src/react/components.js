import { useState, useEffect, createElement, Fragment } from 'react'

export const ClientOnly = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true))

  return mounted ? createElement(Fragment, { children }) : null
}
