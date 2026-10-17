# Walkthrough — pages (archetypes, page anatomy, display components)

Branch `walkthrough/pages`. Area: page types/width/header, the page archetypes, every display
component, islands, their YAML authoring and the visual editor.

Legend: ✅ verified (how) · 🔧 was broken → fixed (#n, see list) · ❌ broken, not fixed (why) · N/A (why) ·
⏳ not walked yet.

## Fixtures and permanent tests added

| What | Where |
|---|---|
| YAML display gallery (every display component on one definition-only page) | `backend/shared/core/src/test/resources/specs/ui/display-gallery.yaml` (golden source) + copy in `e2e/sut/modules/sample1/.../specs/ui/display-gallery.yaml` (`/display-gallery`) |
| Java golden of the gallery → browser expander (specsOnly path) | `YamlDisplayGallerySyncTest` writes `libs/mateu/.../__fixtures__/display-gallery.golden.json`; `expandDisplayGallery.test.ts` |
| Every component that runs something, composed in code, handlers echo their params | sample1 `pages/InteractiveDisplay` (`/arch/interactive`), `e2e/tests/shared/interactive-display.spec.ts` (11) |
| The twelve archetypes + `@AutoPage` | sample1 `pages/*` (`/arch/dashboard`, `welcome`, `hero-search`, `smart-search`, `todo`, `calendar`, `collection-detail`, `general-overview`, `foldout`, `item-overview`, `gantt`, `data-management`, `auto-page`), `e2e/tests/shared/archetypes.spec.ts` (16) |
| Page header in code and in YAML | sample1 `PageAnatomy` (`/arch/page`), `WelcomeBannerPage`, `yaml-page.yaml` (`/yaml-page`), `e2e/tests/shared/page-anatomy.spec.ts` (6) |
| Renderer-agnostic (Vaadin + VB) | `e2e/tests/renderer/display-components.spec.ts` (3), `e2e/tests/renderer/archetypes.spec.ts` (6) |
| Redwood projection | `apps/redwood/poc/test-display.mjs`: the whole Java gallery projects to atoms + queue/welcome/hero/notice/empty-state/stat/title/subtitle cases |
| Ports | Python `tests/test_yaml_display_gallery.py`, .NET `YamlDisplayGalleryTests` |
| RN / IntelliJ | RN `markdownInline.test.ts`, `ganttSelection.test.ts`, `planningDrag.test.ts` (+1); IntelliJ `DisplayComponentsRenderTest` (+2) |

Runs done for this walk: the four new shared specs (33 tests) pass on **mvc, webflux, quarkus,
micronaut and helidon** SUTs; the whole shared suite (357) on mvc; the renderer specs on Vaadin and on
VB (mvc-app1 built with `mateu-redwood`); the gallery and the YAML page header from a real
**specsOnly static bundle** (demo-static-vcn's YAML module + the gallery, served by `serve-static.mjs`);
`/arch/interactive` on **React Native** (expo web) with every action round-tripping; the gallery wire
through IntelliJ `renderProbe`. Core 1753 tests, Python 786, .NET 710, libs/mateu 1455, redwood poc all
suites, RN unit, IntelliJ `DisplayComponentsRenderTest`/`WireTypeRenderTest` green.

## Bugs fixed (one line each, commit)

1. Schema: `ProgressSteps.steps` described the flow verbs (`data.Step` vs `fluent.Step` share a simple name) — editors flagged every valid step (`b85177ac3`).
2. Expander (static bundle): a `Notice`'s `content` vanished; `MatrixGrid` sections without id shared one collapse key, short rows shifted the grid (`2fa4f40f6`).
3. Routing: a root `@UI("")` view hijacked every definition-only (YAML, no view model) route — in the e2e SUT no YAML page ever rendered (`e6cade3c4`).
4. a11y: kanban/timeline/stat/org-chart/feature/status/gantt/calendar items were `role=button` + tab stop even with no action; folded foldout strips had no tab stop; map markers were mouse-only (`69b9466de`).
5. `mateu-bpmn`: a rejected import escaped as an unhandled rejection and left an empty box (`69b9466de`).
6. uidl generic resolver: `SmartSearchPage<Filters,Row>`/`HeroSearch` listings took the **Filters** class as rows — wrong columns (`06bb9f45a`).
7. Composed pages (tree archetypes, `@AutoPage` bridges, adapters) never sent `SetWindowTitle`: stale tab title, no navigation announcement — Java, .NET, Python + conformance goldens (`06bb9f45a`, `465424b82`).
8. Page `@Fab` was a dead click twice over: never advertised (Java/.NET/Python) and dispatched on the component host outside its listener (`06bb9f45a`).
9. `mateu-content-header` hid every secondary toolbar action in "…" whenever the title block was taller than the actions (`06bb9f45a`).
10. Vaadin: a string field with options (GeneralOverview record switcher, all 3 backends) was a text field showing "r1" (`66c17aaa7`).
11. Redwood: a `TaskQueue` swallowed its page; `ProgressSteps` made any page a wizard and dropped its `ProgressBar`; `Notice` lost its own action and content; an `EmptyState` with a CTA lost it (`b890e1a6e`).
12. Redwood: a `HeroSection` made any page the Welcome page and lost its content (`8d1b9a4fe`).
13. Redwood: a `Stat` with an action was inert (`6825d7135`).
14. Python/.NET: every display component authored in YAML rendered "Unsupported component" (`eae9f3eef`, `e7d3d2be2`).
15. Python/.NET: Markdown, Image, Badge, Avatar, AvatarGroup, Chart, Bpmn, ProgressBar did not exist (`d0bbb8104`, `ab04bd2d1`).
16. Java: charts, diagrams, cards, markdown, images, badges, avatars, progress bars all had the wire id `"fieldId"` (shared DOM ids; Redwood painted two diagrams into one) (`1b0a0282c`).
17. Redwood: composed pages had a "…" header; `SmartSearchPage` lost its intro line (`3eb67e627`).
18. Redwood: a `HeroSearch` lost its hero (content before a listing is painted above it) (`7b8973859`).
19. Redwood: Welcome tiles holding Markdown showed only their titles (`379c60a99`).
20. IntelliJ: an image Swing cannot decode dumped its data URI as text (`a516cacf3`).
21. Static bundle: `staticOnly` refused components whose actions are client flows (`steps:`) (`d669c7bfb`).
22. Static bundle: a route's `state:` seeds were shipped in the manifest and never applied (`79bc037b1`).
23. `@AutoPage`: an inferred dashboard advertised none of its model's actions — every drill-in a dead click (`465424b82`).
24. RN: a Markdown link printed its raw `[text](url)` (`82dbc51b0`).
25. RN: gantt tasks could not be selected; a movable planning board's blocks could not be tapped (`28ca30802`).
26. IntelliJ: a gantt task could not be selected (`077fede37`).

## Matrix

Columns: **Java** (annotations/fluent, served — mvc + the 4 other adapters for the shared specs) ·
**YAML** (definition-only page, Java server) · **Static** (specsOnly bundle) · **Vaadin** ·
**Redwood/VB** · **.NET** · **Python** (wire + YAML builder) · **RN** (expo web) · **IntelliJ**
(renderProbe + unit tests) · **Editor** (visual editor).

### Display components

| Component | Java | YAML | Static | Vaadin | Redwood | .NET | Python | RN | IntelliJ | Editor |
|---|---|---|---|---|---|---|---|---|---|---|
| EntityHeader, Text sizes, Separator, BulletedList, Faq, Testimonials, Skeleton, Meter, Funnel, Heatmap, TrendChart, ComparisonCard, Scoreboard/MetricCard, DashboardLayout/Panel, HeroSection | ✅ | ✅ sync | ✅ bundle + expander | ✅ display-gallery.spec | ✅ test-display + VB | 🔧 #14 | 🔧 #14 | ✅ expo web | ✅ probe (❌ layout, see below) | ✅ palette (schema-derived) |
| Markdown, Image, Badge, Avatar, AvatarGroup, Chart, Bpmn, ProgressBar | ✅ (🔧 #16 ids) | ✅ | ✅ | ✅ (🔧 #5) | ✅ | 🔧 #15 | 🔧 #15 | ✅ (🔧 #24) | ✅ (🔧 #20) | ✅ |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔧 batch 1, decision 10: Python fluent `Card` with Java's component slots | ✅ | ✅ | ✅ |
| Notice (action + content) | ✅ | ✅ | 🔧 #2 | ✅ | 🔧 #11 | ✅ | ✅ | ✅ | ✅ | ✅ |
| MatrixGrid (link + edit, sections) | ✅ | ✅ | 🔧 #2 | ✅ link + edit round trip | ✅ renders; ⏳ VB edit | ✅ | ✅ | ✅ link | ⏳ (MatrixGridsTest exists) | ✅ |
| PlanningBoard (select, drag/move) | ✅ | ✅ | ✅ | ✅ select + drag | ✅ renders; ⏳ VB drag | ✅ | ✅ | 🔧 #25 select | ⏳ (PlanningDragTest exists) | ✅ |
| Gantt (bar click) | ✅ | ✅ | ✅ | ✅ (🔧 #4) | ✅ GanttPage drawer; ❌ console `<rect> width negative` errors from oj-gantt on /arch/interactive (not investigated) | ✅ | ✅ | 🔧 #25 | 🔧 #26 | ✅ |
| Kanban, Timeline, OrgChart, StatusList, FeatureGrid, PricingTable, OfferCard, CalloutCard, TaskQueue, EmptyState CTA, ActionPanel | ✅ | ✅ | ✅ | ✅ round trips (🔧 #4) | ✅ round trips (🔧 #11) | ✅ | ✅ | ✅ round trips | ✅ (DisplayComponentsRenderTest) | ✅ |
| Stat (action) | ✅ | ✅ | ✅ | ✅ | 🔧 #13 | ✅ | ✅ | ✅ | ⏳ | ✅ |
| Map with markers | ✅ | ✅ | ✅ | 🔧 #4 keyboard button, round trip ✅ | ❌ marker click not walked green (Leaflet marker locator timed out) | ✅ | ✅ | ✅ | ✅ list rows (MapRowsTest) | ✅ |
| Calendar (views, days, day/event click) | ✅ | ✅ | ✅ | ✅ | ❌ an event click on VB ran nothing (chip clickable, sink installed; the click fired a nav-drawer chain — not diagnosed) | ✅ | ✅ | ✅ (web: nested `<button>` warning — day cell holds event buttons) | ⏳ | ✅ |
| CustomComponent | ✅ | ✅ | ✅ | ✅ placeholder + children | ✅ placeholder | ✅ | ✅ | ✅ | ⏳ | ✅ |
| ProgressSteps | ✅ | 🔧 #1 | ✅ | ✅ | 🔧 #11 | ✅ | ✅ | ✅ | ⏳ | ✅ |
| ComponentAdapter island, embedded mediator island | ✅ /adapter-demo save round trip; /inline-host (confirm-dirty.spec) | N/A (code) | N/A (server) | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| MicroFrontend | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

IntelliJ ❌: rendering the gallery or `/arch/interactive` with `renderProbe` (1200×885), Gantt, Kanban,
PlanningBoard and MatrixGrid are squeezed to a few pixels high and overlap when many components share
one vertical page (needs a look at the vertical layout / scroll host in the tool window).

### Page anatomy

| Feature | Java | YAML | Static | Vaadin | Redwood | .NET | Python |
|---|---|---|---|---|---|---|---|
| Overline, title, subtitle, badge, KPI, timestamp | ✅ page-anatomy | ✅ /yaml-page | 🔧 #22 seeds | ✅ | ✅ /arch/page renders | ⏳ | ⏳ |
| Window title (`SetWindowTitle`) | 🔧 #7 | ✅ | ✅ | ✅ | 🔧 #17 header | 🔧 #7 | 🔧 #7 |
| Toolbar / buttons | 🔧 #9 | ✅ flow | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Banners: static, action-returned replace/append | ✅ | ✅ static | ✅ static | ✅ | ⏳ | ⏳ | ⏳ |
| FABs | 🔧 #8 | ✅ flow | ✅ | ✅ | ⏳ | 🔧 #8 | 🔧 #8 |
| Peer nav (+ back) | ✅ | ✅ renders | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Record switcher | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ |
| `@WelcomeBanner` | ✅ | N/A | N/A | ✅ | 🔧 #12 keeps the form | ⏳ | ⏳ |
| Page width / page type | ✅ archetypes.spec | ⏳ | ⏳ | ✅ data-page-width/type | ⏳ | ⏳ | ⏳ |
| `@AutoPage` | 🔧 #23 (+ window title #7) | N/A | N/A | ✅ | ⏳ | ⏳ | ⏳ |
| Visible heading on composed archetypes | 🔧 batch 1, decision 9: Vaadin shows the window title as the heading of composed archetypes (`composedHeading.ts`), like Redwood (#17) |

### Archetypes (Java, served)

| Archetype | Vaadin | Redwood | 5 adapters | .NET / Python |
|---|---|---|---|---|
| Dashboard (+ MetricCard drill-in) | ✅ archetypes.spec | ✅ drill-in ("View") | ✅ | ⏳ browser |
| Welcome (CTAs) | ✅ | ✅ CTA (🔧 #19 tile text) | ✅ | ⏳ |
| HeroSearch | ✅ (🔧 #6) | 🔧 #18, search ✅ | ✅ | ⏳ |
| SmartSearchPage (+ preSearchContent) | ✅ (🔧 #6) ; preSearch ✅ /patterns/search | ✅ columns, 🔧 #17 subtitle | ✅ | ⏳ |
| TodoList | ✅ | ✅ | ✅ | ⏳ |
| CalendarPage (views, days, day click, create) | ✅ | ✅ navigation | ✅ | ⏳ |
| CollectionDetail | ✅ | ✅ | ✅ | ⏳ |
| GeneralOverview (+ info slot) | 🔧 #10 ; info ✅ /patterns/overview | ✅ | ✅ | ⏳ |
| Foldout (+ panel width, summary) | ✅ (/patterns/foldout) | ✅ renders | ✅ | ⏳ |
| ItemOverview | ✅ | ✅ tabs | ✅ | ⏳ |
| GanttPage (bar → drawer, Escape) | ✅ | ✅ | ✅ | ⏳ |
| DataManagement (+ docked panels) | ✅ (+ /patterns/data toggles) | ✅ switch | ✅ | ⏳ |

### Not walked yet

- MicroFrontend (all columns).
- .NET / Python archetype and page-header pages in a browser (their unit and conformance suites pass).
- Visual editor canvas/Play interaction for display components (palette completeness only; the canvas uses the same expander, which is pinned).
- Redwood static bundle (`-Dmateu.bundle.renderer=redwood`).
- IntelliJ interactions beyond its unit tests; RN archetype pages.

## Doc claims found wrong

- `reference/parity.md`: "Nothing on the server surface remains Java-only" — eight display components were Java-only (#15); Python still lacks a fluent `Card`.
- `reference/parity.md`: "YAML pages … ✅ ✅ ✅" — the ports rendered every display component of a YAML page as "Unsupported component" (#14).
- `conformance/cases/{dashboard,notice,status-list}/case.md`: "Known divergence" sections predicted port xfails that no longer exist (rewritten).
- `ux-patterns/smart-search.md`: "an optional intro line under the page title" — true again since batch 1, decision 9 (Vaadin composes the heading).

## Notes for other areas

- Redwood shell: a 400 + `catalogRegistry Invalid JSON '#{env.catalogJson}#'` on every VB page load.
- `GanttPage`/`DataManagement` heading touches the viewport edge on edge-to-edge pages (cosmetic).
- RN `npm test`: `MateuViewController.test.ts` fails with `mock.module is not a function` on the local Node (pre-existing).
- `npx npm@11 ci --workspace mateu-redwood` wipes the other workspaces' node_modules (and vice versa); re-run the other `ci` after building Redwood.
