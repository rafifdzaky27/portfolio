// CI: run Lighthouse (mobile) against the built site, enforce a performance
// budget, and write the real scores into the footer of every page.
//   node scripts/lighthouse.mjs            (after `npm run build`)
// Lighthouse runs through a pinned `npx` so its large dependency tree never
// enters this project's lockfile. Set CHROME_PATH to use a specific browser.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawn } from 'node:child_process';

const LIGHTHOUSE = 'lighthouse@12.8.2';
// Performance varies with the CI machine, so its floor is lower; the rest are deterministic.
const budget = { performance: 75, accessibility: 95, 'best-practices': 90, seo: 95, weightKb: 1600 };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.json': 'application/json', '.pdf': 'application/pdf' };

// A tiny static server for dist/, same URL rules as Caddy (directory → index.html).
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join('dist', p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!existsSync(file) && existsSync(file + '/index.html')) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': types['.html'] });
    return res.end(readFileSync('dist/404.html'));
  }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
// LH_PATH checks another page (local use); CI measures the homepage.
const url = `http://127.0.0.1:${server.address().port}${process.env.LH_PATH || '/'}`;

const flags = process.env.CI ? '--headless=new --no-sandbox' : '--headless=new';
// Async on purpose: the server above runs in this same process.
const runOnce = () =>
  new Promise((resolve) => {
    const child = spawn(
      'npx',
      ['--yes', LIGHTHOUSE, url, '--quiet', '--output=json', '--output-path=stdout', `--chrome-flags="${flags}"`, '--only-categories=performance,accessibility,best-practices,seo'],
      { shell: true },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
const ran = (o) => o.status === 0 && o.stdout.trim().startsWith('{');

// Chrome sometimes fails to start on a CI runner ("waiting for dynamic
// debugging port"). That says nothing about the site, so try again. A run
// that completes is never retried: a score below budget still fails below.
const ATTEMPTS = 3;
let out;
for (let i = 1; i <= ATTEMPTS; i++) {
  out = await runOnce();
  if (ran(out)) break;
  console.error(out.stderr || out.stdout);
  if (i < ATTEMPTS) console.error(`Lighthouse did not run (attempt ${i} of ${ATTEMPTS}), retrying`);
}
server.close();
if (!ran(out)) {
  console.error('✖ Lighthouse did not run');
  process.exit(1);
}

const lhr = JSON.parse(out.stdout);
if (process.env.LH_REPORT) writeFileSync(process.env.LH_REPORT, out.stdout);
const score = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
const s = { performance: score('performance'), accessibility: score('accessibility'), 'best-practices': score('best-practices'), seo: score('seo') };
const weightKb = Math.round(lhr.audits['total-byte-weight'].numericValue / 1024);
const lcp = (lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(1);

const text = `performance ${s.performance} · accessibility ${s.accessibility} · best practices ${s['best-practices']} · SEO ${s.seo} · ${weightKb} kB · LCP ${lcp} s`;
console.log(`Lighthouse (mobile): ${text}`);

const failures = [];
for (const k of ['performance', 'accessibility', 'best-practices', 'seo']) if (s[k] < budget[k]) failures.push(`${k} ${s[k]} < ${budget[k]}`);
if (weightKb > budget.weightKb) failures.push(`page weight ${weightKb} kB > ${budget.weightKb} kB`);

// Stamp the scores into every page (plain text, so the CSP hashes are unaffected).
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})('dist');
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const next = html.replace(/(data-lh="pending"[^>]*>)[^<]*/g, `$1${text}`).replace(/data-lh="pending"/g, 'data-lh="measured"');
  if (next !== html) writeFileSync(f, next);
}
writeFileSync('dist/lighthouse.json', JSON.stringify({ measuredAt: new Date().toISOString(), scores: s, weightKb, lcp: +lcp, budget }));

if (failures.length) {
  console.error(`✖ performance budget failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('✓ within budget');
