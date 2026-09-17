/// <reference types="vite/client" />

/** Injected by vite.config.js from CF_PAGES_COMMIT_SHA at build time. */
declare const __BUILD_SHA__: string;

interface ImportMetaEnv {
  /** `demo` (the default) or `live`. */
  readonly VITE_API_MODE?: string;
  /** Base URL of the Jepy Worker API. Empty in live mode means same-origin through the Pages proxy. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
