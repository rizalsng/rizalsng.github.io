# CLAUDE.md — /simulacra

Guidance for AI agents and contributors working on the Simulacra demo.

> Scope: this file covers `/simulacra` only. The parent site (`rizalsng.github.io`) has its
> own conventions in `../AGENTS.md` — they do **not** apply here (see "Why single-file" below).

## What this is

**Simulacra** — a static demo of a multi-agent AI policy-simulation platform for Indonesian
local government. Agent personas and environments are framed as being built from ethnographic
data + Satu Data Indonesia + Satu Peta, to simulate public reaction to a policy before it is
enacted.

It is a **visual demo for competition presentation**. No AI model runs, no network calls are
made (beyond the Google Fonts stylesheet), and every number, persona, and conversation is
hardcoded illustrative content. All UI text is in Bahasa Indonesia.

The UX follows MiroFish's five-stage pipeline, contextualised for policy making:

| MiroFish stage | Simulacra section |
|---|---|
| Graph Building — seed extraction, memory injection, GraphRAG | 02 Input Data |
| Environment Setup — entity extraction, persona generation | 03 Persona & Lingkungan |
| Simulation — dual-platform parallel simulation | 04 Pengaturan + 05 Menjalankan Simulasi |
| Report Generation — ReportAgent | 06 Laporan & Insights |
| Deep Interaction — God View, chat with agents | **out of scope**, deliberately omitted |

## Structure

```
simulacra/
  index.html    Everything — markup, <style>, <script>. ~175 KB, no build step.
  CLAUDE.md     This file.
```

### Why single-file (differs from the parent repo)

The parent site splits `css/` and `js/`. Simulacra deliberately does not: it must open from a
USB stick or a `file://` URL on a machine that is not the author's, mid-presentation, with no
server and possibly no network. **Do not split it into separate files.**

The one external dependency is the Google Fonts stylesheet. The `font-family` stacks fall back
to `Arial Black`/`Impact`/`system-ui`, so the page stays legible offline.

## Design system — do not invent tokens

The visual language is a **vanilla CSS port of [neobrutalism.dev](https://www.neobrutalism.dev)**
(`ekmas/neobrutalism-components`). Values were taken verbatim from that project's
`src/styling/globals.css` and `public/r/styling/*.json`:

```
--border-radius   5px          borders        2px solid var(--border)   (3px on hero surfaces)
--box-shadow-x/y  4px          --shadow       4px 4px 0px 0px var(--border)   (no blur, ever)
--background      cream        --main         yellow      --secondary-background  white
--chart-1..5      blue, red, yellow, green, violet
--heading-font-weight 700      --base-font-weight 500
```

Component recipes mirror the upstream React variants:

- `.btn` — `bg-main` + border + shadow; hover translates by `(+4px, +4px)` and drops the shadow.
- `.btn--reverse` — starts flat, hover translates by `(−4px, −4px)` and *gains* the shadow.
- `.btn--neutral` — `bg-secondary-background`.
- `.card`, `.badge`, `.input`, `.textarea` — same border/radius/shadow recipe.

**When you need a new colour or a new elevation, pick one from the existing token block.**
If the design genuinely needs something new, pull it from a neobrutalism.dev palette JSON
rather than eyeballing a hex value.

Accent colours are referenced through maps near the top of the script — `SENT_CLASS`,
`RISK_CLASS`, `ACCENT_VAR`, `NODE_FILL` — not hardcoded at call sites.

## Data model

Everything the demo shows comes from the `SCENARIOS` array. One object per scenario:

```js
{
  id, code, risk, accent, title, location, short,
  files:    [{n, s}],                         // fake seed material
  context,                                    // prefills the Konteks Tambahan textarea
  sources:  {etno, satudata, satupeta, sekunder},   // record counts, display only
  log:      [[text, 'ok'|'wr'|'dim']],        // terminal lines during graph building
  personas: [{n, h, role, age, place, tags[], trust, infl, econ, bio, quote, net}],
  graph:    {nodes:[{id, l:[lines], t, x, y, d}], edges:[[from, to, label]]},
  question, quickQ: [],
  params:   {agents, days, intensity, media, weight},   // the scenario's *authored* defaults
  posts:    [{pi|who, plat:'w'|'b', day, title?, text, sent, kids?}],
  events:   [{d, t}],
  report:   {stats[4], paras[], groups[], timeline[], risks[], recs[]}
}
```

Notes:

- `t` (node type) is one of `gov | issue | grp | obj`, mapped to a colour by `NODE_FILL`.
- Graph coordinates are hand-placed in a `0 0 660 500` viewBox. Node boxes are sized
  `maxLineLen * 6.3 + 22` wide — check for overlap after moving anything.
- `pi` indexes into `personas`; `who` overrides it for non-persona voices (institutional
  accounts, one-off characters).
- `sent` is `MARAH | KHAWATIR | NETRAL | MENDUKUNG`.
- `params.days` is the *authored* timeline. When the user moves the duration slider,
  `scaleDay()` rescales every post and event proportionally, so `day` values must stay
  within `params.days`.
- `report.stats[0].v` is parsed to derive the simulation's ending sentiment index. Keep it a
  percentage string like `'68%'`.

### Adding a scenario

1. Append an object to `SCENARIOS` following the shape above.
2. It appears on the dashboard automatically — `renderScenarioCards()` iterates the array.
3. Sanity-check the data: every `edges` endpoint resolves to a node `id`, no orphan nodes,
   every `pi` is in range, no `day` exceeds `params.days`.

Content should read like real Indonesian civic conversation — local terms (SPPT, musrenbang,
NJOP, alun-alun, gotong royong) used naturally, not as decoration. Reference real public
events for grounding, but keep personas fictional and **do not name real officials** — say
"Pemerintah Kabupaten X". SKN-01 (Pati) is the flagship and is intentionally the most detailed.

## Code conventions

- **Vanilla ES5-style JS**, one plain `<script>`, `var` + function declarations. No modules,
  no build step, no dependencies.
- **All dynamic content goes through `el()` / `svg()` / `textContent`** — never `innerHTML`.
  This matches the parent repo's rule and keeps scenario text safe to edit freely.
- **Every timer goes through `addTimer()`**, which registers it in `state.timers`.
  `stopTimers()` clears them. Leaving section 05 mid-run calls `pauseSim()`; switching
  scenarios calls `resetSim()`. Forgetting `addTimer()` leaks a timer and double-renders
  the feed.
- **Respect `REDUCED`** (`prefers-reduced-motion`). When true: no stagger, no count-up,
  no edge-draw animation, and `startSim()` renders the whole feed synchronously.
- **Accessibility**: `aria-pressed` on toggles, `aria-current` on nav, `role="progressbar"`
  with a live `aria-valuenow`, graph nodes are focusable with `aria-label`, and section
  headings take focus on navigation. Keep these when editing.

## Gotchas

- SVG text/rect inside `.gedge-label` gets `fill` from CSS, which beats a `fill` **attribute**.
  Set `element.style.fill` (inline) when you need to override it — see the edge-label
  background rect.
- Nav steps 03–06 unlock progressively. `loadScenario()` resets `state.unlocked` back to
  `{dashboard, input}`, so any new step must be unlocked explicitly.
- Headless Chrome reports the page as `hidden` and clamps `setInterval` to 1000ms. The
  1×/2×/4× speed control therefore looks broken under headless automation — it is not.
  Verify speed in a real browser window.

## Testing

No test suite. Verify manually:

```sh
cd ..
python3 -m http.server 8000
# open http://localhost:8000/simulacra/
```

Also open `index.html` directly via `file://` — it must work fully with no server.

Checklist:

1. Full flow 01 → 06 for at least two scenarios, console clean.
2. Switching scenarios mid-way clears the previous feed, events, report, and progress.
3. Leave section 05 mid-run and return — the run pauses, no duplicate posts.
4. Turn off both platforms → run is blocked with a toast; one platform → only that feed fills.
5. 390px viewport: sidebar becomes a horizontal bar, no horizontal page scroll.
6. Keyboard only (Tab + Enter) through every section, including graph nodes.
7. macOS Reduce Motion on → animations off, all content still renders.
