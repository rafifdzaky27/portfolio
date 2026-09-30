// The "operating manual": postmortems, architecture decisions, a 90-day plan and
// the cost of running this site. Every postmortem is an incident that really
// happened while building the site (Sep 2026). Keep them that way.

export type Sev = 'SEV-3' | 'SEV-4';

export interface Postmortem {
  id: string;
  slug: string;
  title: string;
  date: string;
  sev: Sev;
  kind: string;
  impact: string;
  detection: string;
  timeline: { t: string; e: string }[];
  rootCause: string;
  fix: string;
  wentWell: string;
  lesson: string;
  actions: { done: boolean; text: string }[];
}

export const postmortems: Postmortem[] = [
  {
    id: 'PM-001',
    slug: 'resume-downloads',
    title: 'The résumé page downloaded the résumé instead of showing it',
    date: '2026-09-26',
    sev: 'SEV-3',
    kind: 'caught before launch',
    impact:
      'On machines with a download manager (IDM), every visit to /resume started a PDF download and the viewer stayed blank. Found in review before launch, so no public visitors were affected.',
    detection: 'Reported by me while reviewing the site on my own machine.',
    timeline: [
      { t: 'Build', e: 'The résumé page embedded the PDF so it could be read inline.' },
      { t: 'Review', e: 'Opening /resume fired a download every time; the embedded viewer showed nothing.' },
      { t: 'Diagnosis', e: 'The embed requests the PDF on page load. Download managers intercept any PDF response, so "view" became "download".' },
      { t: 'Fix', e: 'The page now renders the résumé as an image with a text version. The PDF is fetched only when someone clicks Download.' },
    ],
    rootCause:
      'The design assumed every browser renders PDFs inline. A page view should never fetch a file that the browser, or a plugin, may treat as a download.',
    fix: 'Image viewer plus a full text version; the PDF is an explicit download link.',
    wentWell: 'Caught before launch. The text version also made the résumé readable by screen readers and search engines.',
    lesson: 'Test on a real, messy machine, not only a clean browser profile.',
    actions: [
      { done: true, text: 'Render the résumé as an image and text; no document loads on page view.' },
      { done: true, text: 'Make "Download PDF" an explicit, labelled link.' },
    ],
  },
  {
    id: 'PM-002',
    slug: 'csp-broke-styles',
    title: 'The Content-Security-Policy would have broken 81 styles',
    date: '2026-09-26',
    sev: 'SEV-3',
    kind: 'near miss',
    impact:
      "None in production. Turning on the framework's built-in CSP blocked 81 inline style attributes (layout, charts, colours) in a test run.",
    detection: 'An automated headless-browser test that counts CSP violations on every page before deploy.',
    timeline: [
      { t: 'Change', e: "Enabled the framework's built-in CSP as part of a security review." },
      { t: 'Test', e: '81 violations: every style="" attribute was blocked. A style-src-attr directive I added was silently dropped.' },
      { t: 'Decision', e: 'Replaced it with a post-build script that hashes each inline script into the policy.' },
      { t: 'Verify', e: '0 violations on 8 pages; 5 of 5 injected XSS payloads blocked.' },
    ],
    rootCause:
      'The built-in policy assumed no inline style attributes, but the site uses them for custom properties and chart widths. The config accepted a directive it then ignored, so the failure was silent.',
    fix: "Scripts are limited to 'self' plus the SHA-256 of each inline script. Styles allow inline, because CSS can't execute code.",
    wentWell: 'The test ran before deploy, so the breakage never shipped.',
    lesson: "A security control needs a test that proves it doesn't break the product, not only a check that it's present.",
    actions: [
      { done: true, text: 'Build fails if an inline event handler (onclick="") appears.' },
      { done: true, text: 'Deploy verifies the CSP is present on the live homepage.' },
    ],
  },
  {
    id: 'PM-003',
    slug: 'deploy-details-in-logs',
    title: 'Deploy details were visible in public Actions logs',
    date: '2026-09-27',
    sev: 'SEV-3',
    kind: 'security',
    impact:
      "The repository is public. The deploy workflow hard-coded the deploy host's internal address, user and path, and a connectivity check printed them in the public logs. The address isn't reachable from the internet, and no key or credential was exposed.",
    detection: 'A security review I ran after the site went live.',
    timeline: [
      { t: 'Review', e: 'Read the workflow and its public run logs the way an outsider would.' },
      { t: 'Finding', e: 'Host, user and path appeared in plain text, and a verbose check echoed them into every run.' },
      { t: 'Fix', e: 'Moved them to repository secrets (masked in logs) and made the check quiet.' },
      { t: 'Hardening', e: 'Pinned third-party actions to commit SHAs and delete the deploy key at the end of every run.' },
    ],
    rootCause:
      '"Not a credential" was treated as "fine to publish". Values that are not secrets can still map the inside of a network.',
    fix: 'Secrets for host, user and path; pinned actions; key cleanup; a documented threat model in the repo.',
    wentWell: 'Credentials were already in secrets, so nothing needed rotating.',
    lesson: 'Review public artifacts (logs, history, docs) as an attacker would, not only the code.',
    actions: [
      { done: true, text: 'Move host, user and path into repository secrets.' },
      { done: true, text: 'Pin third-party actions to commit SHAs.' },
      { done: true, text: 'Accept the residual risk: old values stay in git history (a private address; rewriting public history is not worth it).' },
      { done: false, text: 'Keep the CI network rule to one host and one port, and re-check it after every change.' },
    ],
  },
  {
    id: 'PM-004',
    slug: 'radio-kept-talking',
    title: 'The team radio kept talking after you left the section',
    date: '2026-09-27',
    sev: 'SEV-4',
    kind: 'near miss',
    impact: 'None in production. In testing, jumping to Contact left the radio clip playing, because part of the board was still on screen.',
    detection: 'A scripted test that scrolls and clicks like a visitor, at desktop and mobile widths.',
    timeline: [
      { t: 'Test', e: 'Jumped from the radio board to Contact: audio still playing.' },
      { t: 'Diagnosis', e: '"In view" meant "any part visible", not "what you are looking at".' },
      { t: 'Fix', e: 'The radio now belongs to the middle of the screen: it starts in the middle 20% and stops once the board leaves the middle 60%.' },
      { t: 'Verify', e: 'Re-ran the scripted test on desktop and mobile: stops on leave, never overlaps.' },
    ],
    rootCause: 'The trigger measured visibility, not attention.',
    fix: 'Two observers with a gap between them (hysteresis), and a single audio element so two clips can never overlap.',
    wentWell: 'The test described the behaviour I wanted, so the bug was obvious the first time it ran.',
    lesson: 'Write the test as the user would describe the behaviour, not as the code implements it.',
    actions: [
      { done: true, text: 'Middle-band start and stop, with hysteresis.' },
      { done: true, text: 'Stop on tab hide, on page leave and on mute.' },
    ],
  },
  {
    id: 'PM-005',
    slug: 'stale-dev-server',
    title: 'A stale dev server blocked the dependency install',
    date: '2026-09-27',
    sev: 'SEV-4',
    kind: 'tooling',
    impact: 'Local `npm ci` failed with EPERM before a commit, which cost a few minutes. Nothing shipped broken.',
    detection: 'The install failed loudly.',
    timeline: [
      { t: 'Failure', e: '`npm ci` could not replace the framework’s native binary: EPERM.' },
      { t: 'Diagnosis', e: 'A preview server from an earlier test was still running and held the file open. Windows locks files in use.' },
      { t: 'Why it lingered', e: 'The cleanup command assumed Linux (pkill), which does nothing on Windows.' },
      { t: 'Fix', e: 'Stopped the server by PID and reinstalled from the lockfile.' },
    ],
    rootCause: 'The test did not own the lifecycle of the server it started.',
    fix: 'Tests now stop the servers they start; the cleanup uses the platform’s own tools.',
    wentWell: 'The lockfile made the reinstall deterministic.',
    lesson: 'Clean up what you start, and never assume the Linux toolbox on another OS.',
    actions: [{ done: true, text: 'Stop test servers by PID when a test finishes.' }],
  },
];

export interface Adr {
  id: string;
  title: string;
  date: string;
  status: 'Accepted' | 'Superseded' | 'Proposed';
  context: string;
  decision: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

export const adrs: Adr[] = [
  {
    id: 'ADR-001',
    title: 'Host the portfolio on my homelab, not a hosting platform',
    date: '2026-09',
    status: 'Accepted',
    context:
      'A static site could live on a free hosting platform in five minutes. But the site is also evidence: I want it to run on infrastructure I operate myself.',
    decision: 'Serve the static build from my homelab, behind Cloudflare, deployed by my own pipeline.',
    pros: ['Real operations practice: deploys, TLS, headers, monitoring.', 'Near-zero marginal cost on a host that is on anyway.'],
    cons: [
      'I own the uptime. A power or internet cut at home takes the site down.',
      'More moving parts than a hosting platform.',
    ],
    alternatives: ['Free static hosting (simplest, and the fallback if the lab is ever down for long).', 'A small VPS (about US$5 a month).'],
  },
  {
    id: 'ADR-002',
    title: 'Expose the site through Cloudflare Tunnel, not port forwarding',
    date: '2026-09',
    status: 'Accepted',
    context: 'The site needs to be public; the home network must not be.',
    decision: 'cloudflared dials out to Cloudflare. No inbound ports are opened on the router, and the origin has no public IP.',
    pros: ['Nothing at home to scan or attack directly.', 'TLS, caching and DDoS protection at the edge.'],
    cons: [
      'A dependency on Cloudflare for every request.',
      'The hop from cloudflared to Caddy is plain HTTP, acceptable only because it stays on localhost.',
    ],
    alternatives: ['Port forwarding with a dynamic-DNS name (rejected: exposes the home IP).', 'A VPS as a reverse proxy over a VPN.'],
  },
  {
    id: 'ADR-003',
    title: 'Deploy with rsync over Tailscale into immutable release folders',
    date: '2026-09',
    status: 'Accepted',
    context: 'GitHub Actions has to reach a machine that has no public IP.',
    decision:
      'The runner joins my tailnet as an ephemeral, tagged node, rsyncs the build into a new release folder, and switches a `current` symlink atomically.',
    pros: ['Rollback is one symlink switch.', 'Visitors never see a half-copied release.', 'No self-hosted runner to patch.'],
    cons: ['An ephemeral node joins the tailnet on every deploy, so the ACL has to be tight.', 'Old releases need pruning.'],
    alternatives: ['A self-hosted runner in the lab (more to maintain, and it runs untrusted CI code at home).', 'Pull-based deploys from the host.'],
  },
  {
    id: 'ADR-004',
    title: 'A static site with no backend',
    date: '2026-09',
    status: 'Accepted',
    context: 'Recruiters need to read a page, not log in or submit forms.',
    decision: 'Astro builds plain HTML. Interactivity is client-side; contact goes through email.',
    pros: ['Almost no attack surface: no server code, database or cookies.', 'Fast, cacheable, and cheap to run.'],
    cons: ['No contact form or analytics without adding a service.', 'Live data (such as the status page) has to come from somewhere else.'],
    alternatives: ['A small backend for a contact form (rejected: attack surface for little value).'],
  },
  {
    id: 'ADR-005',
    title: 'A CSP generated at build time with script hashes',
    date: '2026-09',
    status: 'Accepted',
    context: "The framework's built-in CSP blocked the site's inline styles (see PM-002).",
    decision:
      "A post-build script hashes every inline script into a CSP meta tag on every page. Styles allow inline; headers that a meta tag can't set live in Caddy.",
    pros: ['Injected scripts, inline handlers and eval are blocked.', 'The policy always matches the exact build that ships.'],
    cons: ["A meta CSP can't set frame-ancestors, so that needs a server header.", 'Inline styles are allowed.'],
    alternatives: ['Nonces (need a server per request, which a static site does not have).', 'No CSP (rejected).'],
  },
  {
    id: 'ADR-006',
    title: 'Monitor the site from outside the homelab',
    date: '2026-09',
    status: 'Accepted',
    context: 'A monitor that runs on the same host as the site cannot report that host being down.',
    decision: 'A GitHub Action checks the public site from outside and publishes the results to the status page.',
    pros: ['An independent vantage point, and free for a public repository.', 'Nothing in the lab has to be exposed.'],
    cons: [
      'GitHub can delay scheduled runs, so the resolution is coarse.',
      "Checks run from GitHub's network, not from Indonesia.",
    ],
    alternatives: ['Uptime Kuma in the lab (useful for internal checks, blind to its own outage).', 'A paid external monitor.'],
  },
];

export const firstNinety = {
  note: 'A draft. By the end of week one I would rewrite it around what your team needs.',
  phases: [
    {
      days: 'Days 1–30',
      name: 'Listen and map',
      goal: 'Understand before changing anything.',
      items: [
        'Get access the proper way: my own accounts and keys, least privilege from day one.',
        'Inventory every service: where it runs, how it deploys, who owns it, what it costs.',
        'Read the incident history and shadow on-call.',
        'Ship one small, safe pipeline improvement to learn the release path end to end.',
      ],
    },
    {
      days: 'Days 31–60',
      name: 'Make releases predictable',
      goal: 'Fewer surprises on deploy day.',
      items: [
        'Turn the deploy process into one template with approvals, health checks and rollback.',
        "Close monitoring gaps: alert on what users feel, not every CPU spike.",
        'Run a restore from backup, and write down how long it really takes.',
      ],
    },
    {
      days: 'Days 61–90',
      name: 'Make it measurable',
      goal: 'Numbers the team and management can both read.',
      items: [
        'Report deploy frequency, change failure rate and time to restore each month.',
        'Codify at least one server build (Ansible or Terraform), so a rebuild is not tribal knowledge.',
        'Write runbooks for the five most common alerts and hand them to the team.',
      ],
    },
  ],
  wont: ['Rewrite everything in the first month.', 'Change production without a rollback path.', 'Add a tool before there is a problem it solves.'],
};

/** What running this site costs. Assumptions are shown on the page and editable. */
export const finops = {
  assumptions: {
    watts: 30, // average draw of the whole lab host (assumed; the host runs other VMs too)
    tariff: 1444.7, // Rp per kWh, PLN household R-1 ≥ 1,300 VA (assumed)
    domainUsdYear: 11, // typical .com renewal (assumed)
    usdToIdr: 16500, // assumed exchange rate
  },
  free: [
    { name: 'Cloudflare (DNS, CDN, Tunnel)', note: 'free plan' },
    { name: 'GitHub Actions', note: 'free for public repositories' },
    { name: 'Tailscale', note: 'free personal plan' },
  ],
  compare: [
    { name: 'Free static hosting', usd: 0, note: 'cheapest; nothing to operate, nothing to learn' },
    { name: 'Small VPS', usd: 5, note: 'e.g. a 1 GB Linode, before bandwidth or backups' },
  ],
};
