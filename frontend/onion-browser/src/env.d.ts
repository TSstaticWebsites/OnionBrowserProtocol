/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIRECTORY_AUTHORITY_URL: string
  readonly VITE_ENTRY_PROXY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
