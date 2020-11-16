export {};

declare global {
  interface Window {
    __INITIAL_STATE__: Record<string, any>
  }
}