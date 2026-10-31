# Reference apps: every Mateu feature, every producer, every renderer

> **Origin (2026-10-31):** the Star Wars demo could not get usable images (the stills are Lucasfilm's,
> unlicensed), which reopened the question of what the demos are for. The answer: two **reference
> apps** — a multi-museum collection and NASA space exploration — that use **all** of Mateu, authored
> the same way in **every producer** (YAML, Java, C#, Python), rendered by **every renderer** (Vaadin,
> Redwood, the app, desktop), and pinned by **one** test suite run across that whole matrix.
>
> **Status:** living plan. Phases have checkboxes, branch and PR; update on every step (log at the
> bottom). Related: `renderer-e2e-strategy.md` (agnostic selectors, drivers per renderer),
> `conformance/README.md` (the shared wire corpus), `maui-parity-plan.md`.

---

## 1. Goals

1. **Every feature is used by a demo.** "Every feature" is not a wish: it is an **inventory derived
   from the code** (§3), and a gate fails CI when an item of it is used by no reference app.
2. **Every producer serves the same app.** The museum and the space apps exist in YAML (the reference,
   built first) and as Java, C# and Python code, with the same routes, labels and data — so their wire
   can be compared and the same UI tests run against each.
3. **Every renderer passes the same tests.** One functional suite, written against behaviour (roles,
   accessible names, visible text, stable `data-*` hooks — never a renderer's DOM), run per
   producer × renderer.
4. **Real, usable content.** Images and data with licences that allow it (CC0 / public domain),
   credited, so the demos can be shown, published and screenshotted without asking anybody.

Non-goals: replacing the unit and conformance tests the ports already have; testing the data services
beyond their own suites.

## 2. The two reference apps

Both read a **writable data service** modelled on `swapi-service` (Spring Boot, H2 seeded at boot,
search / filters / ranges / paging / sort on the server, writes behind a key, CORS `*`), seeded once by
a committed script from open data. The service is the shared fixture of every cell of the matrix.

| | Museum (`museum-service`, `demo-museum`) | Space (`space-service`, `demo-space`) |
|---|---|---|
| Data | The Met, Art Institute of Chicago, Cleveland Museum of Art open access — CC0 only | NASA Image and Video Library (public domain) + Wikidata (CC0) |
| Collections | museums, artists, artworks, departments, exhibitions, loans, conservation tasks, visits | missions, astronauts, spacecraft, launch sites, celestial bodies, launches, mission tasks, budget |
| Images | the museums' official IIIF/CDN URLs, credited per record | `images-assets.nasa.gov`, credited per record; no insignia implying endorsement |
| Natural fits | map (museums), calendar (exhibitions), wizard (loan request), board (conservation), tree (museum → department → gallery), charts (visits), multimedia (artwork), hero search | calendar (launches), map (sites), wizard (plan a mission), board (tasks), tree (solar system / spacecraft components), charts (launches, budget), multimedia (mission), hero search |

Synthetic data (loans, tasks, budgets, visits, values) is generated deterministically by the seed
script and labelled as such in each README.

Features that fit neither theme naturally go into a small **lab** section of whichever app hosts them
best (e.g. a file upload as "attach a conservation report", the AI chat as "ask the collection",
access control as curator vs visitor) — and only the irreducible rest into lab pages.

## 3. The inventory — what "every feature" means

Derived, not hand-kept. A script (`scripts/feature-inventory.*`, phase 0) builds
`design/reference-apps/inventory.json` from:

| Source | What it lists | Size today |
|---|---|---|
| `backend/shared/uidl/uidl-catalog.json` | wire components, by family (Actionable, FormTemplate, Step, Trigger, …) | 125 components, 5 families |
| `backend/shared/uidl/*-schema.json` (specs, routes, sources, actions, mount, types) | what YAML can declare: page types, field stereotypes, source options, actions, triggers | — |
| `io.mateu.uidl.annotations` | code-first declarations (`@Menu`, `@EyesOnly`, `@Toc`, `@Zones`, …) | 174 annotations |
| `io.mateu.uidl.interfaces` | code-first capabilities (Listing + capabilities, CrudStore, suppliers, …) | 109 interfaces |
| Redwood `poc/coverage.mjs` | per-component renderer support (`full` / `part` / `layout`) | 117 entries |

Each item gets: the **producers** that can express it (YAML / Java / C# / Python), the **renderers**
that support it, and the **reference-app page(s)** that use it. Items a producer cannot express are
marked as such — that is information, not a gap to paper over. Code-only declarations (annotations,
interfaces) are covered by the code ports (phases 3–5), not by YAML.

## 4. The matrix

Producers: **YAML** · **Java** (code-first, mvc) · **C#** (Mateu.NET) · **Python** (FastAPI).
Renderers: **Vaadin** (web) · **Redwood** (web) · **App** (React Native; expo-web in CI) ·
**Desktop** (to confirm: the IntelliJ/Swing renderer via `renderProbe`, and/or `Mateu.app`).

Two apps × 4 producers × 4 renderers = 32 cells. Not all on every PR:

- **Every PR:** YAML × Vaadin and YAML × Redwood for both apps, the wire diff of every producer
  against YAML (cheap: no browser), and the coverage gate.
- **Nightly:** the full matrix.

## 5. The tests — three layers

1. **Wire (L1).** For a fixed list of interactions per app (first load of each route, search, filter,
   open a record, save, run a wizard step, move a card…), every producer's normalised wire must equal
   YAML's. This is the conformance corpus idea at app scale; the normaliser is the corpus's.
2. **Functional UI (L2).** One Playwright suite per app (`e2e/tests/reference/<app>/`), agnostic
   selectors only (as `e2e/tests/renderer/smoke.spec.ts`). Projects per renderer and per producer
   (baseURL). The app and desktop get their drivers in phase 6; until then they run L1 only.
3. **Coverage gate (L3).** Fails when an inventory item is used by no reference app (in the producer
   that can express it), or a test-id / route the suite relies on disappears. Report-only first,
   enforcing once phase 2 lands.

Conventions all producers follow so one suite fits all: the same routes; the same labels and titles;
`data-testid`-style hooks only where role and name are not enough (each one listed in the app's
README); the same seeded data (the service is shared).

## 6. Phases

### Phase 0 — inventory and coverage report

- [ ] The inventory script and `inventory.json` (§3).
- [ ] The coverage report: inventory × the two apps' specs → used / unused / not expressible.
- [ ] Decide the lab items (§2) from the report.

Exit: a report that says, item by item, where it is used or why it is not.

### Phase 1 — the two apps in YAML (in progress, 2026-10-31)

- [ ] `museum-service` + `demo-museum` (branch `feat/demo-museum`) — first cut being built.
- [ ] `space-service` + `demo-space` (branch `feat/demo-space`) — first cut being built.
- [ ] Close the YAML-expressible gaps of the phase-0 report, page by page.
- [ ] Both renderers by hand; Mateu bugs found → their own PRs.
- [ ] Publish the data services (`museum.mateu.io`, `space.mateu.io`) and the demos; retire or freeze
      `demo-starwars`.

Exit: every YAML-expressible inventory item used by at least one app; both apps right in Vaadin and
Redwood.

### Phase 2 — the functional suite

- [ ] `e2e/tests/reference/museum/` and `…/space/`: one journey per feature group (listing,
      record, forms, wizard, board, calendar, map, charts, tree, multimedia, search, templates).
- [ ] Projects YAML × Vaadin and YAML × Redwood in CI; the coverage gate enforcing.

Exit: green on both web renderers, on every PR.

### Phase 3 — Java code-first port

- [ ] Both apps as Java classes (mvc), same routes and data; the code-only items (annotations,
      interfaces) used here.
- [ ] L1 wire diff vs YAML; L2 on Vaadin and Redwood.

### Phase 4 — Python port   ·   Phase 5 — C# port

- [ ] Same as phase 3 (FastAPI; Mateu.NET). Their gaps against Java become their own issues.

### Phase 6 — the app and desktop

- [ ] React Native through expo-web with the same L2 suite (selectors by role/name already hold
      there, per `renderer-e2e-strategy.md`); a device run later.
- [ ] Desktop: decide which (IntelliJ/Swing, `Mateu.app`); extend `renderProbe` to the reference
      apps' feature list.

### Phase 7 — the matrix in CI

- [ ] Nightly full matrix; per-PR subset (§4); one dashboard of cells.

## 7. Decisions to take

1. **Where the apps live.** Proposal: `demo/demo-museum`, `demo/demo-space` in this repo (like
   `demo-starwars`); the data services in their own repos (like `swapi-service`).
2. **Desktop.** Which renderer "desktop" means for the matrix.
3. **Hosting** of the two data services and the demos (as `swapi.mateu.io` and the Star Wars demos).
4. **`demo-starwars`.** Keep (it documents the progressive example suite) or retire once the new apps
   cover it.

## 8. Risks

- **The inventory is large** (≈400 items). Phase 0 will show how many are not natural in either
  theme; the lab section must stay small or the apps stop being demos.
- **Image hosting.** The museums' and NASA's URLs are official and stable, but external; a cache in
  the data service is the fallback if one changes.
- **Matrix cost.** 32 cells with browsers are slow; hence the per-PR subset and L1 (no browser) as the
  everyday guard.
- **Producer drift.** Four authorings of the same app drift unless L1 runs on every PR.

## Log

- 2026-10-31 — Plan written. Phase 1 started: both apps' first cut (data service + YAML demo) under
  way on `feat/demo-museum` and `feat/demo-space`.
