// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Set `site` once a domain is chosen (enables absolute canonical / OG URLs).
export default defineConfig({
  integrations: [mdx()],
  markdown: { shikiConfig: { theme: 'github-light' } },
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
