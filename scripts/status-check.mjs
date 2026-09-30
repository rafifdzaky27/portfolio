// Run by .github/workflows/status.yml about every 15 minutes: checks the public
// site from outside the homelab and keeps a rolling history for /status.
//   node scripts/status-check.mjs <previous.json> <out.json>
// A failed check is data, not an error, so this always exits 0.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [prevPath, outPath] = process.argv.slice(2);
const targets = [
  { key: 'site', name: 'Website', url: 'https://rafifdzaky.com/', expect: 'Rafif Dzaky Daniswara' },
  { key: 'cli', name: 'Terminal résumé (/cli.txt)', url: 'https://rafifdzaky.com/cli.txt', expect: 'whoami' },
];
const KEEP_RECENT = 96; // ~24 h at one check per 15 min
const KEEP_DAYS = 90;

const now = new Date();
const iso = now.toISOString();
let data = {};
try {
  if (prevPath && existsSync(prevPath)) data = JSON.parse(readFileSync(prevPath, 'utf8') || '{}');
} catch {
  data = {};
}
data.since ??= iso;
data.components ??= {};

for (const t of targets) {
  const t0 = Date.now();
  let ok = false;
  let code = 0;
  let note = '';
  try {
    const res = await fetch(t.url, {
      redirect: 'follow',
      headers: { 'user-agent': 'rafifdzaky-status/1 (+https://github.com/rafifdzaky27/portfolio)' },
      signal: AbortSignal.timeout(15000),
    });
    code = res.status;
    const body = await res.text();
    ok = res.ok && body.includes(t.expect);
    if (res.ok && !ok) note = 'unexpected content';
  } catch (e) {
    note = e.name === 'TimeoutError' ? 'timeout' : 'connection failed';
  }
  const ms = Date.now() - t0;

  const c = (data.components[t.key] ??= { name: t.name, days: {}, recent: [] });
  c.name = t.name;
  c.recent.push({ t: iso, ok, ms, code, ...(note && { note }) });
  c.recent = c.recent.slice(-KEEP_RECENT);

  const day = iso.slice(0, 10);
  const d = (c.days[day] ??= { n: 0, up: 0, ms: 0 });
  d.n++;
  if (ok) {
    d.up++;
    d.ms += ms;
  }
  const cutoff = new Date(now.getTime() - KEEP_DAYS * 864e5).toISOString().slice(0, 10);
  for (const k of Object.keys(c.days)) if (k < cutoff) delete c.days[k];

  console.log(`${ok ? 'UP  ' : 'DOWN'} ${t.url} ${code} ${ms} ms ${note}`);
}

data.updated = iso;
writeFileSync(outPath, JSON.stringify(data));
