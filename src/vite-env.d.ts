/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_MODEL?: string
  readonly VITE_DEEPSEEK_API_KEY?: string
  readonly VITE_DOUBAO_MODEL_ID?: string
  readonly VITE_WENGU_API_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
