# Claims to confirm before publishing

Everything on the site comes from the knowledge base, the résumé, the two
workflow files you pasted, your paper, or your chat messages. The items below
are where Claude **inferred, generalized or wrote playful copy**. Tick each one,
or reword or delete it, before the site goes public.

## Confirmed by you (round 2)

- [x] All 20+ services use CI/CD; ~60% deploy automatically; production runs are dispatched and confirmed by you.
- [x] <2% failure rate = production deploy runs on core services, from GitHub Actions run history.
- [x] Extra DevOps duties: domains, VPS setup, scaling, SSL, IAM, backups & restore, hardening, web server config, DB admin, incident response, secrets, logs/cron/queues, cost & capacity.
- [x] Bash and Python: learnt (shown under "Built in my homelab → Scripting").
- [x] Phone number on the site; cum laude; F1 / Liverpool / tennis section.

## CI/CD: the 16 failure → fix notes (you allowed Claude to write these)

Each note maps to a real step or comment in your YAML. The **symptoms are
reconstructed** from what that step defends against. Check each one sounds like
what actually happened, and delete any you'd struggle to talk about in an interview:

- [ ] Missing Vite manifest in tests (from your YAML comment, likely real)
- [ ] Wayfinder routes missing on fresh checkout
- [ ] Test suite hitting PHP memory limit (`memory_limit=512M`)
- [ ] Lint/format drift breaking later builds
- [ ] Tarball including itself after moving the app to repo root (from your YAML comment, likely real)
- [ ] Dev packages / tests shipped in the artifact
- [ ] FastAPI moved to its own repo, so the Laravel pipeline was trimmed (from your YAML comment)
- [ ] Guard against accidental production runs (typed DEPLOY)
- [ ] Overlapping deploys (concurrency group)
- [ ] Permission denied on storage/ and bootstrap/cache (you mentioned permission errors)
- [ ] Stale config/route caches
- [ ] Horizon / queue workers running old code (you mentioned Horizon/Supervisor)
- [ ] OPcache serving old files (reason for the PHP-FPM reload)
- [ ] Green pipeline, broken site (health check)
- [ ] Scheduler looking dead after deploy (heartbeat priming)
- [ ] Deploy key left on the runner (always() cleanup)

## Other wording to check

- [ ] About: "So when something breaks, I can read it from the app side as well as the server side."
- [ ] Infra ops case: "Resizing plans when a service outgrows its box, and splitting workloads when one host carries too much."
- [ ] Infra ops case: "Access is granted when someone joins and removed when they leave."
- [ ] Monitoring "When it's an incident" routine (stabilize → cause → tell the team → make it stick).
- [ ] Monitoring: "disk and CPU drifting upward over days".
- [ ] Hero field "Baggage: Linux · Docker · GH Actions" and "Seat: on-call, aisle" (playful).

## Playful copy (jokes, but make sure you're comfortable with them)

- [ ] Fun facts: "coffee uptime 99.9%", "favourite exit code 0", "it's always DNS", "last chmod 777: never", "on-time departures 98%+ on core services" (derived from <2%).
- [ ] F1 line: "Max Verstappen is my all-time favourite, and Red Bull Racing is my team." and "race weekends: blocked in the calendar".
- [ ] Liverpool line: "the deploy calendar gets checked against the fixture list" and "matchday: no deploys, ideally".
- [ ] Tennis line: "Still fixing my backhand the way I fix pipelines: one small change at a time."

## Terminal, footer and 404 (new)

- [ ] Terminal `uptime` jokes: "load average 0.60 0.98 1.00" is explained on screen as 60% auto-deploy, 98% on-time, coffee.
- [ ] Terminal `ssh`/`dig`/`neofetch` describe the setup: origin has no public IP, Caddy on localhost only, CI reaches one host on port 22 over Tailscale. True only once the Caddy/Tailscale changes in docs/SECURITY.md are applied.
- [ ] Terminal `kubectl`: says k3s is on the roadmap and not claimed yet. Update when it runs.
- [ ] Footer release line links the commit on the public repo, and shows build time, page count and size.
- [ ] `curl -sL rafifdzaky.com` needs the `@cli` rewrite and the `X-Hire-Me` header in your real Caddyfile (see docs/SECURITY.md).

## Team logos

- [ ] The Red Bull car and the Liverpool crest are trademarks, used here only as fan references in Off the clock, from files you supplied. They're not part of the site's branding. Remove them if an employer or the clubs ever object.
- [ ] The team-radio clips (`src/assets/audio/`) use a voice made to sound like Max Verstappen, reading lines you wrote. The page labels them fan-made and not real team radio. A synthetic voice of a real person is the riskiest item on the page: if it ever causes trouble, remove the three `audio:` entries in `src/data/profile.ts` (and the files) and the radio card keeps working as text.
- [ ] Sector times (28.033 / 31.906 / 25.418, lap 1:25.357) are decorative, not real data.

## Research

- [ ] The page summarises your paper. It does **not** host the PDF, because it's unpublished and the proceedings publisher may not allow a preprint. Add a link once it's in the proceedings.
- [ ] Removed the old claim that HTMT / IPMA / common-method-bias were used. Your paper says discriminant validity (HTMT) was *not* assessed.
- [ ] Co-authors listed as Muhardi Saputra and Haryasena Panduwiyasa.

## Homelab hosting (true only once deployed there)

- [ ] "This site is served from my homelab" appears as a hero fun fact, a callout, and a **Running** node on the map. Only publish once the site actually runs from the lab. Publishing it without opening ports fits roadmap P18 (Cloudflare Tunnel).

## Homelab (unchanged, still confirm)

- [ ] Ansible from WSL marked **Running**; the other built items are **Partial**.
- [ ] Map shows every planned module from the playbook (P02B … P20) as dashed/planned.

## v2 pipeline templates

- [ ] Labelled **written, not yet in production**. Read and understand `pipeline-templates/` before an interview; they haven't been run end to end yet.

## Résumé PDF

- [ ] Your PDF still says pipelines are "covering roughly 60 percent of more than 20 production services". The site now says all services use pipelines and ~60% are automated. Update the PDF so they match.
