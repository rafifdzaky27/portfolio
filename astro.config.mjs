// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rafifdzaky.com',
  integrations: [mdx(), sitemap()],
  markdown: { shikiConfig: { theme: 'github-light' } },
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  // Content-Security-Policy is added after the build by scripts/csp.mjs
  // (script hashes computed from the final HTML). Other security headers
  // live in the Caddyfile: see docs/SECURITY.md.
});
