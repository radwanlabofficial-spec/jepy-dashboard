/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Jepy Worker API. Empty or unset runs the console on demo fixtures. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
