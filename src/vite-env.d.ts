/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `demo` (the default) or `live`. */
  readonly VITE_API_MODE?: string;
  /** Base URL of the Jepy Worker API. Empty in live mode means same-origin through the Pages proxy. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
