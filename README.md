# rafif-portfolio

Personal engineering portfolio for Rafif Dzaky Daniswara. Static site built with Astro.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs dist/
npm run check:links  # build + verify every internal link and anchor
```

## Where things live

| Path | What |
|---|---|
| `src/data/profile.ts` | Contact, experience, skills, education, credentials |
| `src/data/homelab.ts` | Homelab items, troubleshooting notes, 31-module roadmap with statuses |
| `src/content/work/*.mdx` | Case studies (CI/CD, monitoring, Linux ops) |
| `src/components/DeliveryPath.astro` | Interactive hero diagram |
| `src/components/diagrams/` | Case-study diagrams |
| `src/styles/tokens.css` | Colour, type, spacing, motion tokens |
| `public/Rafif_Dzaky_Daniswara_Resume.pdf` | Résumé served for View / Download |
| `pipeline-templates/` | v2 Laravel CI/CD templates (draft; not part of the site build) |
| `docs/design-rationale.md` | Design decisions |

## Updating

- **New résumé:** replace `public/Rafif_Dzaky_Daniswara_Resume.pdf` (keep the filename).
- **Homelab module done:** change its `state` in `src/data/homelab.ts`. Do it only once there's a repo, screenshot or log to back it.
- **Domain chosen:** set `site` in `astro.config.mjs` for canonical and OG URLs.

`dist/` is plain static files and can be hosted on any static host.
