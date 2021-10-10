// This is just a utility to highlight HTML in VSCode
export const html = (s, ...args) =>
  s.map((ss, i) => `${ss}${args[i] || ''}`).join('')
