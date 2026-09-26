// Post-build: add a Content-Security-Policy <meta> to every page in dist/.
//
// Scripts are locked to 'self' plus the SHA-256 of each inline <script> actually
// present in that page, so an injected <script> or onclick="" can't run.
// Styles allow 'unsafe-inline' because the site uses style="" attributes
// (custom properties, chart widths, syntax highlighting); CSS can't execute code.
//
// Headers that only work as HTTP response headers (HSTS, frame-ancestors, ...)
// are set in Caddy. See docs/SECURITY.md.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = 'dist';
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(root);

const base = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  // /status reads the monitor history the status workflow publishes to GitHub.
  "connect-src 'self' https://raw.githubusercontent.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
];

let pages = 0;
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  if (html.includes('http-equiv="content-security-policy"')) continue;

  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc=/.test(attrs)) continue; // external: covered by 'self'
    if (/type="application\/(ld\+)?json"/.test(attrs)) continue; // data, never executed
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  if (/\son[a-z]+="/i.test(html)) {
    console.error(`✖ ${file} contains an inline event handler (onX=""); CSP will block it.`);
    process.exitCode = 1;
  }

  const policy = [...base, `script-src 'self' ${[...hashes].join(' ')}`.trim()].join('; ');
  html = html.replace(/<head>/, `<head><meta http-equiv="content-security-policy" content="${policy}">`);
  writeFileSync(file, html);
  pages++;
}
console.log(`CSP added to ${pages} page(s)`);
