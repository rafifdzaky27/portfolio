// Generate the static share cards. The colours and window chrome match PitOS.
// Run `npm run generate:og` after changing the copy or visual system.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { copyFile } from 'node:fs/promises';

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);

const cards = [
  {
    file: 'og-pitos.png',
    window: 'About · rafif',
    eyebrow: 'DEVOPS ENGINEER  /  JAKARTA, WIB',
    heading: ['Rafif Dzaky', 'Daniswara'],
    detail: 'I ship software and run the systems behind it.',
    panel: 'PRODUCTION  /  AT A GLANCE',
    rows: [
      ['20+', 'services on GitHub Actions', 'green'],
      ['<2%', 'failed production deploy runs', 'green'],
      ['~60%', 'services deploy automatically', 'blue'],
    ],
    label: 'PORTFOLIO  ·  PITOS',
  },
  {
    file: 'og-ci-cd.png',
    window: 'Docs · ~/work/ci-cd',
    eyebrow: 'CASE STUDY  /  01',
    heading: ['CI/CD for 20+', 'production services'],
    detail: 'From SSH releases to tested, gated pipelines.',
    panel: 'RELEASE  /  SIGNALS',
    rows: [
      ['20+', 'services on GitHub Actions', 'green'],
      ['~60%', 'automatic deploys', 'blue'],
      ['<2%', 'failed production runs', 'green'],
    ],
    label: 'CI/CD  ·  GITHUB ACTIONS',
  },
  {
    file: 'og-monitoring.png',
    window: 'Docs · ~/work/monitoring',
    eyebrow: 'CASE STUDY  /  02',
    heading: ['Monitoring &', 'incident response'],
    detail: 'Signals, investigation and recovery for production.',
    panel: 'OBSERVABILITY  /  STACK',
    rows: [
      ['01', 'Prometheus · metrics', 'blue'],
      ['02', 'Grafana · dashboards', 'blue'],
      ['03', 'Uptime Kuma · availability', 'green'],
    ],
    label: 'LINUX  ·  OBSERVABILITY',
  },
  {
    file: 'og-linux-ops.png',
    window: 'Docs · ~/work/linux-ops',
    eyebrow: 'CASE STUDY  /  03',
    heading: ['Linux & VPS', 'operations'],
    detail: 'The work between a server and a healthy app.',
    panel: 'INFRASTRUCTURE  /  SCOPE',
    rows: [
      ['01', 'Linode VPS · provisioning', 'blue'],
      ['02', 'DNS · TLS · access', 'blue'],
      ['03', 'Backups · databases', 'green'],
    ],
    label: 'LINUX  ·  INFRASTRUCTURE',
  },
  {
    file: 'og-pit-wall-on-call.png',
    window: 'Docs · ~/work/pit-wall-on-call',
    eyebrow: 'CASE STUDY  /  04',
    heading: ['Pit Wall On-Call', 'built & operated'],
    detail: 'An on-call game shipped with a production pipeline.',
    panel: 'GAME  /  DELIVERY',
    rows: [
      ['700+', 'tests plus browser checks', 'green'],
      ['SHA', 'tagged container images', 'blue'],
      ['AUTO', 'rollback, game-day proven', 'green'],
    ],
    label: 'GAME  ·  DEVOPS  ·  HOMELAB',
  },
  {
    file: 'og-homelab.png',
    window: 'Monitoring · ~/homelab',
    eyebrow: 'PERSONAL PROJECT  /  HOMELAB',
    heading: ['A lab for', 'what comes next'],
    detail: 'Building and documenting infrastructure at home.',
    panel: 'HOMELAB  /  TOOLKIT',
    rows: [
      ['01', 'Proxmox · one physical host', 'blue'],
      ['02', 'Terraform · Ansible', 'blue'],
      ['03', 'DNS · Tailscale · Docker', 'green'],
    ],
    label: 'HOMELAB  ·  LEARNING IN PUBLIC',
  },
];

const row = ([value, label, tone], index) => {
  const y = 216 + index * 89;
  const accent = tone === 'green' ? '#73bf69' : '#8ab4ff';
  return `
    <rect x="758" y="${y}" width="360" height="72" rx="7" fill="#1f2329" stroke="#333a44"/>
    <rect x="758" y="${y}" width="4" height="72" rx="2" fill="${accent}"/>
    <text x="779" y="${y + 32}" class="metric" fill="${accent}">${escapeXml(value)}</text>
    <text x="779" y="${y + 57}" class="caption">${escapeXml(label)}</text>
    <rect x="1078" y="${y + 15}" width="27" height="19" rx="3" fill="#24392c"/>
    <text x="1091.5" y="${y + 29}" text-anchor="middle" class="ok">OK</text>`;
};

const cardSvg = (card) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#1b1730"/><stop offset=".48" stop-color="#6b3550"/><stop offset="1" stop-color="#d67b50"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#73bf69"/><stop offset=".55" stop-color="#3d71d9"/><stop offset="1" stop-color="#5cc8ff"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-15%" width="120%" height="135%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <style>
      .sans { font-family: 'IBM Plex Sans', Arial, sans-serif; }
      .mono, .caption, .metric, .ok { font-family: 'IBM Plex Mono', Consolas, monospace; }
      .caption { font-size: 16px; fill: #b3bdca; }
      .metric { font-size: 24px; font-weight: 700; }
      .ok { font-size: 10px; font-weight: 700; fill: #73bf69; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <path d="M0 460h1200v170H0z" fill="#171322" opacity=".88"/>
  <path d="M0 500h1200M0 548h1200" stroke="#d18465" opacity=".18"/>
  <rect width="1200" height="42" fill="#0b0c0f"/>
  <rect x="34" y="10" width="23" height="23" rx="5" fill="#1f2329" stroke="#3a414b"/>
  <path d="M41 27V16m0 7c0-4 3-6 8-6" fill="none" stroke="#e6e9ee" stroke-width="2" stroke-linecap="round"/>
  <circle cx="51" cy="16" r="2" fill="#73bf69"/>
  <text x="69" y="27" class="sans" font-size="17" font-weight="700" fill="#e6e9ee">Rafif Dzaky</text>
  <text x="1135" y="27" text-anchor="end" class="mono" font-size="13" fill="#b3bdca">rafifdzaky.com</text>

  <rect x="48" y="78" width="1104" height="491" rx="12" fill="#000" opacity=".34" filter="url(#shadow)"/>
  <rect x="48" y="66" width="1104" height="491" rx="11" fill="#181b1f" stroke="#3a414b" stroke-width="2"/>
  <path d="M49 77a10 10 0 0 1 10-10h1082a10 10 0 0 1 10 10v37H49z" fill="#1f2329"/>
  <path d="M49 114h1102" stroke="#333a44"/>
  <rect x="66" y="81" width="18" height="18" rx="4" fill="#294c9a"/>
  <text x="75" y="94" text-anchor="middle" class="mono" font-size="12" font-weight="700" fill="#fff">${card.window.startsWith('About') ? 'R' : 'D'}</text>
  <text x="94" y="95" class="sans" font-size="15" font-weight="700" fill="#d8dee9">${escapeXml(card.window)}</text>
  <path d="M1073 91h12m18-5v10h10V86zm30 0 10 10m0-10-10 10" stroke="#8e97a5" stroke-width="2" fill="none"/>

  <rect x="78" y="145" width="210" height="24" rx="4" fill="#23382c"/>
  <text x="90" y="161" class="mono" font-size="12" font-weight="700" fill="#8dcc91">OPEN TO DEVOPS ROLES</text>
  <text x="78" y="214" class="mono" font-size="15" letter-spacing="1.2" fill="#8ab4ff">${escapeXml(card.eyebrow)}</text>
  <text x="77" y="286" class="sans" font-size="52" font-weight="700" letter-spacing="-1.5" fill="#e6e9ee">${escapeXml(card.heading[0])}</text>
  <text x="77" y="349" class="sans" font-size="52" font-weight="700" letter-spacing="-1.5" fill="#e6e9ee">${escapeXml(card.heading[1])}</text>
  <path d="M78 379h601" stroke="url(#line)" stroke-width="3"/>
  <text x="78" y="422" class="sans" font-size="22" fill="#c5ccd6">${escapeXml(card.detail)}</text>
  <text x="78" y="498" class="mono" font-size="17" fill="#8e97a5">RAFIF DZAKY DANISWARA</text>

  <rect x="739" y="145" width="397" height="353" rx="8" fill="#15181c" stroke="#333a44"/>
  <path d="M739 189h397" stroke="#333a44"/>
  <circle cx="761" cy="168" r="5" fill="#73bf69"/>
  <text x="777" y="173" class="mono" font-size="15" font-weight="700" fill="#c5ccd6">${escapeXml(card.panel)}</text>
  ${card.rows.map(row).join('')}

  <text x="69" y="601" class="mono" font-size="15" fill="#eef1f5">rafifdzaky.com</text>
  <text x="1131" y="601" text-anchor="end" class="mono" font-size="15" fill="#eef1f5">${escapeXml(card.label)}</text>
</svg>`;

for (const card of cards) {
  await sharp(Buffer.from(cardSvg(card)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(fileURLToPath(new URL(`../public/${card.file}`, import.meta.url)));
  console.log(`Generated public/${card.file}`);
}

// Keep the previous public image URL working for already-shared previews.
await copyFile(
  fileURLToPath(new URL('../public/og-pitos.png', import.meta.url)),
  fileURLToPath(new URL('../public/og-image.png', import.meta.url)),
);
