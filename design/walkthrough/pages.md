# Walkthrough — pages (archetypes, page anatomy, display components)

Branch `walkthrough/pages`. Area: page types/width/header, the page archetypes, every display
component, islands, their YAML authoring and the visual editor.

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken, not fixed (why) · N/A (why) ·
⏳ not walked yet.

## Fixtures and permanent tests added

| What | Where |
|---|---|
| YAML display gallery (every display component on one definition-only page) | `backend/shared/core/src/test/resources/specs/ui/display-gallery.yaml` (golden source) + copy in `e2e/sut/modules/sample1/.../specs/ui/display-gallery.yaml` (`/display-gallery`) |
| Java golden of the gallery → browser expander | `YamlDisplayGallerySyncTest` writes `libs/mateu/.../__fixtures__/display-gallery.golden.json`; `expandDisplayGallery.test.ts` |
| Every component that runs something, composed in code, handlers echo params | sample1 `pages/InteractiveDisplay` (`/arch/interactive`), `e2e/tests/shared/interactive-display.spec.ts` (11) |
| The twelve archetypes | sample1 `pages/*` (`/arch/dashboard`, `welcome`, `hero-search`, `smart-search`, `todo`, `calendar`, `collection-detail`, `general-overview`, `foldout`, `item-overview`, `gantt`, `data-management`), `e2e/tests/shared/archetypes.spec.ts` (13) |
| Page header in code and in YAML | sample1 `PageAnatomy` (`/arch/page`), `WelcomeBannerPage`, `yaml-page.yaml` (`/yaml-page`), `e2e/tests/shared/page-anatomy.spec.ts` (6) |
| Renderer-agnostic (Vaadin + VB) | `e2e/tests/renderer/display-components.spec.ts` (3) |
| Redwood projection of the gallery | `apps/redwood/poc/test-display.mjs` (gallery + queue/welcome/notice/empty-state/stat cases) |
| Ports | Python `tests/test_yaml_display_gallery.py`, .NET `YamlDisplayGalleryTests` |

All four new shared specs (30 tests) pass on **mvc, webflux, quarkus, micronaut and helidon** SUTs
(run locally, ports 18400/18401). The whole shared suite (355) passes on mvc.

## Bugs fixed (one line each)

1. 🔧 Schema: `ProgressSteps.steps` described the flow verbs (`data.Step` vs `fluent.Step` share a simple name) — editors flagged every valid step (`b85177ac3`).
2. 🔧 Expander (static bundle): a `Notice`'s `content` stayed raw and vanished; `MatrixGrid` sections without id shared one collapse key and short rows shifted the grid (`2fa4f40f6`).
3. 🔧 Routing: a root `@UI("")` view hijacked every definition-only (YAML, no view model) route — in the e2e SUT no YAML page ever rendered (`e6cade3c4`).
4. 🔧 a11y: kanban/timeline/stat/org-chart/feature/status/gantt/calendar items were `role=button`+tab stop even with no action; folded foldout strips had no tab stop; map markers were mouse-only (OpenLayers canvas) — now real buttons (`69b9466de`).
5. 🔧 `mateu-bpmn`: a rejected import (e.g. no diagram interchange) escaped as an unhandled rejection and left an empty box (`69b9466de`).
6. 🔧 uidl generic resolver: `SmartSearchPage<Filters,Row>`/`HeroSearch` listings took the **Filters** class as rows — wrong columns (`06bb9f45a`).
7. 🔧 Composed pages (every tree archetype, `@AutoPage` bridges, adapters) never sent `SetWindowTitle`: stale tab title, no navigation announcement — Java, .NET, Python + conformance goldens (`06bb9f45a`).
8. 🔧 Page `@Fab` was a dead click twice over: action not advertised (Java/.NET/Python) and dispatched on the component host, outside its listener (`06bb9f45a`).
9. 🔧 `mateu-content-header` collapsed every secondary toolbar action into "…" whenever the title block was taller than the actions (overline/subtitle/timestamp) (`06bb9f45a`).
10. 🔧 Vaadin: a string field with options (the GeneralOverview record switcher, in all 3 backends) rendered as a text field showing "r1" (`66c17aaa7`).
11. 🔧 Redwood: a page with a `TaskQueue` became the queue page and lost everything else; any page with `ProgressSteps` became a wizard and lost its `ProgressBar`; `Notice` dropped its own action and non-button content; an `EmptyState` with a CTA lost it (`b890e1a6e`).
12. 🔧 Redwood: a page with a `HeroSection` became the Welcome page and lost its content (`8d1b9a4fe`).
13. 🔧 Redwood: a `Stat` with an action was inert (`6825d7135`).
14. 🔧 Python and .NET: every display component authored in YAML rendered "Unsupported component" (generic builders) (`eae9f3eef`, `e7d3d2be2`).
15. 🔧 Python and .NET: Markdown, Image, Badge, Avatar, AvatarGroup, Chart, Bpmn, ProgressBar had no fluent component/wire metadata despite parity.md's "nothing remains Java-only" (`d0bbb8104`, `ab04bd2d1`).

## Matrix

Columns: **Java** (annotations/fluent, served by mvc; the shared specs also on webflux/quarkus/micronaut/helidon) ·
**YAML** (definition-only page, Java server) · **Static** (browser expander = specsOnly bundle path) ·
**Vaadin** · **Redwood/VB** · **.NET** · **Python** · **RN** · **IntelliJ** · **Editor** (visual editor palette/canvas).

### Display components

| Component | Java | YAML | Static | Vaadin | Redwood | .NET | Python | RN | IntelliJ | Editor |
|---|---|---|---|---|---|---|---|---|---|---|
| EntityHeader, Text sizes, Separator, BulletedList, Faq, Testimonials, Skeleton, Meter, Funnel, Heatmap, TrendChart, ComparisonCard, Scoreboard/MetricCard, DashboardLayout/Panel, HeroSection | ✅ sync | ✅ YamlDisplayGallerySyncTest | ✅ expandDisplayGallery | ✅ display-gallery.spec | ✅ test-display + VB walk | ✅ YamlDisplayGalleryTests | ✅ test_yaml_display_gallery | ⏳ | ⏳ | ✅ palette derived from schema (paletteCompleteness) |
| Markdown, Image, Badge, Avatar, AvatarGroup, Chart, Bpmn, ProgressBar | ✅ | ✅ | ✅ | ✅ (Bpmn 🔧 #5) | ✅ | 🔧 #15 | 🔧 #15 | ⏳ | ⏳ | ✅ |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ no Python fluent Card (its metadata takes a string title, Java's a component — owner: align the Python CardMetadata?) | ⏳ | ⏳ | ✅ |
| Notice (action + content) | ✅ | ✅ | 🔧 #2 | ✅ interactive-display | 🔧 #11 | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| MatrixGrid (link + edit cells, sections) | ✅ | ✅ | 🔧 #2 | ✅ link+edit round trip | ✅ projection; ⏳ VB edit | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| PlanningBoard (select, drag/move) | ✅ | ✅ | ✅ | ✅ select + drag round trip | ✅ renders; ⏳ VB drag | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| Gantt (bar click) | ✅ | ✅ | ✅ | ✅ (🔧 #4 a11y) | ✅ renders; ❌ console `<rect> width negative` errors from oj-gantt on /arch/interactive (not investigated) | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| Kanban, Timeline, OrgChart, StatusList, FeatureGrid, PricingTable, OfferCard, CalloutCard, TaskQueue, EmptyState CTA, ActionPanel | ✅ | ✅ | ✅ | ✅ round trips (🔧 #4) | ✅ round trips (🔧 #11) | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| Stat (action) | ✅ | ✅ | ✅ | ✅ | 🔧 #13 | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| Map with markers | ✅ | ✅ | ✅ | 🔧 #4 (keyboard button), round trip ✅ | ❌ marker click not walked green (Leaflet marker locator timed out) | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| Calendar (views, days, day click, event click) | ✅ | ✅ | ✅ | ✅ (event; day passes through event w/o action 🔧 #4) | ❌ event click produced no message on VB (chip clickable, sink installed — not diagnosed) | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| CustomComponent | ✅ | ✅ | ✅ | ✅ placeholder + children (unregistered) | ✅ placeholder | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| ProgressSteps | ✅ | 🔧 #1 schema | ✅ | ✅ | 🔧 #11 | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| MicroFrontend, ComponentAdapter islands, embedded mediator islands | ⏳ (existing API-level coverage: component-adapter.spec, confirm-dirty embedded) | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### Page anatomy

| Feature | Java | YAML | Vaadin | Redwood | .NET | Python |
|---|---|---|---|---|---|---|
| Overline, title, subtitle, badge, KPI, timestamp | ✅ page-anatomy | ✅ /yaml-page | ✅ | ✅ VB walk (/arch/page renders) | ⏳ | ⏳ |
| Window title (`SetWindowTitle`) | 🔧 #7 | ✅ | ✅ | ✅ | 🔧 #7 | 🔧 #7 |
| Toolbar / buttons | ✅ (🔧 #9) | ✅ flow | ✅ | ⏳ | ⏳ | ⏳ |
| Banners: static, action-returned replace/append | ✅ | ✅ static | ✅ | ⏳ | ⏳ | ⏳ |
| FABs | 🔧 #8 | ✅ flow (🔧 #8 dispatch) | ✅ | ⏳ | 🔧 #8 | 🔧 #8 |
| Peer nav (+ back) | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Record switcher | ✅ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ |
| `@WelcomeBanner` | ✅ | N/A | ✅ | ✅ (🔧 #12 keeps the form) | ⏳ | ⏳ |
| Page width (`@PageWidth`) | ✅ data-page-width | ⏳ | ✅ | ⏳ | ⏳ | ⏳ |
| Page type / `@AutoPage` | ✅ sync (existing) + window title of inferred dashboards 🔧 #7 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Visible heading on composed archetypes | ❌ Dashboard / SmartSearchPage / ItemOverview render no page heading on Vaadin (GanttPage/DataManagement compose one; docs say "intro line under the page title") — owner: should tree archetypes compose their `@Title`? On VB they show an empty "…" header |

### Archetypes (Java, served)

| Archetype | Vaadin | Redwood | Other adapters | .NET / Python |
|---|---|---|---|---|
| Dashboard (+ MetricCard drill-in) | ✅ archetypes.spec | ⏳ | ✅ (5 adapters) | ⏳ |
| Welcome (CTAs) | ✅ | ✅ renders; ❌ tile body texts not shown on VB | ✅ | ⏳ |
| HeroSearch | ✅ (🔧 #6 columns) | ⏳ | ✅ | ⏳ |
| SmartSearchPage | ✅ (🔧 #6) ; preSearchContent ⏳ | ⏳ | ✅ | ⏳ |
| TodoList | ✅ | ⏳ | ✅ | ⏳ |
| CalendarPage (views, days, day click, create) | ✅ | ⏳ | ✅ | ⏳ |
| CollectionDetail | ✅ | ⏳ | ✅ | ⏳ |
| GeneralOverview (+ info slot) | 🔧 #10 switcher; info slot ✅ (/patterns/overview) | ⏳ | ✅ | ⏳ |
| Foldout (+ panel width, summary) | ✅ (/patterns/foldout strips + summary) | ⏳ | ✅ | ⏳ |
| ItemOverview | ✅ | ⏳ | ✅ | ⏳ |
| GanttPage (bar → drawer, Escape) | ✅ | ⏳ | ✅ | ⏳ |
| DataManagement (+ docked panels) | ✅ (+ /patterns/data toggles) | ⏳ | ✅ | ⏳ |

### Not walked yet (whole columns)

- React Native and IntelliJ renderers for every row (only their static wire-type parity tests exist).
- Static bundle served end to end (`mateu:bundle specsOnly` in a browser) — only the expander unit path.
- Visual editor canvas/Play interaction for the display components (palette completeness only).
- .NET / Python archetype pages walked in a browser (their unit/conformance suites pass).

## Doc claims found wrong

- `reference/parity.md`: "Nothing on the server surface remains Java-only" — eight display components
  were Java-only (fixed, #15); Python still lacks a fluent `Card`.
- `reference/parity.md`: "YAML pages … ✅ ✅ ✅" — the ports rendered every display component of a
  YAML page as "Unsupported component" (fixed, #14).
- `conformance/cases/{dashboard,notice,status-list}/case.md` "Known divergence" sections predicted
  port xfails that no longer exist (rewritten).
- `ux-patterns/smart-search.md`: "an optional intro line under the page title" — no page title is
  rendered (❌ above, owner decision).

## Notes for other areas

- Java components `Markdown`, `Image`, `Badge`, `Avatar`, `AvatarGroup`, `Chart`, `Bpmn`, `ProgressBar`
  carry the literal id `"fieldId"` on the wire (duplicate DOM ids when two are on a page).
- Redwood shell: a 400 + `catalogRegistry Invalid JSON '#{env.catalogJson}#'` on every VB page load.
- `GanttPage`/`DataManagement` heading touches the viewport edge on edge-to-edge pages (cosmetic).
