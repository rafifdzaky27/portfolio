# Design rationale: "Release boarding pass"

**Who visits:** recruiters and hiring managers for DevOps, cloud infrastructure,
SRE and platform roles. In under a minute they should see who Rafif is (photo,
role, education seal), the headline evidence (20+ services, <2% failed prod
runs) and how to reach him.

**Idea:** a release is a trip from `commit` to `production`. The hero is a
boarding pass (photo stub, passenger fields, an ink stamp for S.Kom · GPA 3.87
· cum laude). Sections are "gates", experience is an itinerary, and contact is
the final call. The route map shows the real 60% split: an auto lane, and a
production lane that stops at Rafif's approval gate.

**Palette (light only, one surface family):**

| Token | Use |
|---|---|
| `--paper` #F6F1E7 / `--paper-2` #EFE8DA | page / alternating bands |
| `--card` #FFFDF8 | tickets and cards |
| `--ink` #1F2A2E | text, ticket outlines |
| `--muted` #56646A | secondary text |
| `--accent` #2D7D9A | actions, active nav, the auto lane |
| `--stamp` #B8432F | ink stamps and the approval gate only |

**Type:** Instrument Sans + IBM Plex Mono (both self-hosted, OFL).

**Motion:** a plane on the hero route and packets on the route map. Both have a
Hold button, pause off-screen, and are static under `prefers-reduced-motion`.

**Deliberately different from the reference site:** no dotted-grid paper, no
washi tape, no polaroid, and no bullet-journal glyph set. Status uses
● running / ◐ partial / ○ planned, always with a text label.

**Left out on purpose:** skill bars, logo walls, team logos, live status
counters, analytics, the paper PDF (unpublished).
