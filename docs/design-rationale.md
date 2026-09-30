# Design rationale: PitOS

**Who visits:** recruiters and hiring managers for DevOps, SRE, platform and
infrastructure roles. In under a minute they should see who Rafif is, the
headline evidence (20+ services on GitHub Actions, <2% failed production
runs, ~60% deployed automatically) and how to reach him.

**Idea:** the site uses the desktop from Pit Wall On-Call, the on-call game
Rafif builds and runs. That desktop is called PitOS. Each section is an app
window, so the page reads like a shift at work:

| Window | App it borrows from | What it holds |
|---|---|---|
| About | Home | Photo, role, three headline numbers, CV and email |
| Release pipeline | Monitoring | The release pipeline as a service map, case studies, what he runs |
| Pit Wall On-Call | Browser | The game, how it ships, the game-day log |
| ~/experience | Files | Jobs, degree and certificates, with filters |
| Homelab | Monitoring | A small service map of the homelab |
| ~/notes | Files | Postmortems, decisions, status and research |
| Contact | Settings | Email, phone, LinkedIn, GitHub |

The dock at the bottom is the navigation. On phones it becomes a tab bar.
Inner pages are stacks of windows too: case studies open in "Docs", incidents
in "Incident" windows, the résumé in a document viewer.

**Tokens:** copied from `pit-wall-on-call/apps/web/src/styles/tokens.css`, so
the site and the game are one system. Dark is the default. The top bar switch
sets `data-theme="light"` on `<html>` and saves the choice in `localStorage`
(`pitos-theme`).

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | #111217 | #f4f5f7 | Page behind the windows |
| `--panel` | #181b1f | #ffffff | Window and panel surface |
| `--text` | #d8dee9 | #1f2329 | Body text |
| `--muted` | #8e97a5 | #5a6270 | Secondary text |
| `--accent` | #3d71d9 | #2f5fc4 | Actions, links, selected node |
| `--ok` / `--warn` / `--crit` | #73bf69 / #ff9830 / #f2495c | #2a7d34 / #b85c12 / #c9283b | Status only, always with a text label |

`--faint` is lifted from the game's #5f6875 to #7d8591 so small text passes
4.5:1 contrast.

**Type:** IBM Plex Sans and IBM Plex Mono, self-hosted through Fontsource
(OFL). Interface text is 13px, like the game. Case studies and notes use a
larger reading scale (`--step-*`).

**Wallpapers:** inline SVGs from the game, Jakarta at dusk for dark and
Yogyakarta for light.

**Motion:** only the animated "auto" edges on the pipeline map and small
hover states. The home page marks the window in view as focused. All of it
stops under `prefers-reduced-motion`.

**Left out on purpose:** skill bars, logo walls, team logos, hobbies,
analytics, the paper PDF (unpublished), and anything the game has that a
visitor would have to learn first (window dragging, a start menu).
