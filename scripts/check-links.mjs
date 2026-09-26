// Checks every internal href/src (and #anchor) in the built site.
// Run after `npm run build`:  node scripts/check-links.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const root = 'dist';
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(root);

const broken = new Set();
const external = new Set();
let count = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const self = '/' + relative(root, file).split('\\').join('/').replace(/index\.html$/, '');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    count++;
    if (/^(https?:|mailto:|tel:)/.test(url)) {
      external.add(url);
      continue;
    }
    const [pathPart, hash] = url.split('#');
    let target = join(root, decodeURIComponent(pathPart || self));
    if (!extname(target)) target = join(target, 'index.html');
    if (!existsSync(target)) {
      broken.add(`${file} -> ${url}`);
      continue;
    }
    if (hash && !readFileSync(target, 'utf8').includes(`id="${hash}"`)) broken.add(`${file} -> #${hash} (no such id)`);
  }
}

console.log(`checked ${count} links in ${files.length} pages`);
console.log('external:', [...external].join('  '));
if (broken.size) {
  console.error('BROKEN:\n' + [...broken].join('\n'));
  process.exit(1);
}
console.log('no broken internal links');
