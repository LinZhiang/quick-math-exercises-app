export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    chrome?: 'home' | 'app'
  }
}
