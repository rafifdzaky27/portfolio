// `npm run build`: astro build, then fill in the build stats the pages show
// (duration, page count, size), then add the CSP. The CSP runs last because it
// hashes the final HTML.
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const t0 = Date.now();
const r = spawnSync('npx astro build', { stdio: 'inherit', shell: true });
if (r.status !== 0) process.exit(r.status ?? 1);
const ms = Date.now() - t0;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})('dist');

const html = files.filter((f) => f.endsWith('.html'));
const pages = html.filter((f) => !f.endsWith('404.html')).length;
const bytes = files.reduce((n, f) => n + statSync(f).size, 0);
const size = bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} kB`;
const stats = { __BUILD_MS__: `${(ms / 1000).toFixed(1)} s`, __PAGES__: String(pages), __DIST_SIZE__: size };

for (const f of files.filter((f) => /\.(html|txt)$/.test(f))) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/__BUILD_MS__|__PAGES__|__DIST_SIZE__/g, (k) => stats[k]);
  if (out !== src) writeFileSync(f, out);
}
console.log(`build stats: ${stats.__BUILD_MS__}, ${pages} pages, ${size}`);

await import('./csp.mjs');
