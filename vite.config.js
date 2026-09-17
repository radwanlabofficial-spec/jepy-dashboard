import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
  },
  define: {
    // Stamped into the bundle so "which build is live?" is answerable by looking
    // at the UI rather than by inference. Cloudflare Pages exposes
    // CF_PAGES_COMMIT_SHA during its build; locally it reads `dev`.
    __BUILD_SHA__: JSON.stringify((process.env.CF_PAGES_COMMIT_SHA ?? 'dev').slice(0, 7)),
  },
});
