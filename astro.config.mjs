import { defineConfig } from 'astro/config';

// The production workflow supplies the same root origin explicitly. Keeping the
// public URL as the local default also makes generated canonical URLs predictable.
export default defineConfig({
  site: process.env.SITE_URL || 'https://farrell236.github.io',
  base: process.env.ASTRO_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4326 },
  vite: { server: { strictPort: true } },
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-light' } },
});
