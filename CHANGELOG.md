# Changelog

All notable changes to Mateu. Versions follow the scheme described in
[Stability & versioning](https://mateu.io/reference/stability-and-versioning/); every release is a
git tag `vX.Y-…` and a GitHub release whose artifacts are on Maven Central under `io.mateu`.

Upgrading from an earlier alpha? Read [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/)
first — it collects every rename and removal in one place.

This file starts at `v3.0-alpha.400`. For older releases, see the GitHub releases page.

## [Unreleased] — towards 3.0 beta

### Documentation, starters and demos
- **Starters**: `starters/` holds the smallest complete app on every runtime — Spring MVC, Spring
  WebFlux, Quarkus, Micronaut, Helidon MP, ASP.NET Core (C#) and FastAPI (Python). CI compiles the
  Java ones against each commit, boots them and loads their CRUD. The quickstart is the Spring MVC
  starter, file for file.
- **Demos**: every demo takes the Mateu version from a `mateu.version` property; the "start here"
  demos default to the latest release, the showcase demos to the local snapshot. All demos are on
  Spring Boot 4 / Java 21 and have distinct ports. CI compiles every demo against each commit.
- **Docs site**: built on every PR with a broken-link check, deployed from `master` and on every
  release. Every `AutoCrud` snippet now compiles (`store()` is mandatory). New pages: Stability &
  versioning, Migrating from alpha, Deploy to production.
- `CONTRIBUTING.md`, `SECURITY.md` (private reporting through GitHub Security Advisories), a pull
  request template and `CODEOWNERS`.

### Public API
- **`@Experimental`** (`io.mateu.uidl.annotations`) marks API outside the stability promise — it may
  change in a minor release. Marked today: the AI assistant (`@AI`, `Chat`, the MCP wiring); the
  Figma contract is documented as experimental.

- **Name collisions pinned**: the simple names shared by two uidl packages (annotation ⇄ record
  pairs such as `@Badge`/`Badge`) are listed on the stability page with the explicit-import rule,
  and `NameCollisionsTest` fails on a new one. Removing the no-op annotations dropped seven of them
  (`HorizontalLayout`, `VerticalLayout`, `SplitLayout`, `Scroller`, `AccordionPanel`, `Option`,
  `State`); the empty `fluent.ActionType` enum went too.
- **Wire version check** in every first-party renderer (web/Vaadin, Redwood, React Native, IntelliJ):
  a server speaking another wire major gets one clear message instead of a broken screen.

### Breaking (read [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/))
- **Maven artifacts renamed to `mateu-*`**: `io.mateu:mvc-core` → `io.mateu:mateu-mvc`, `uidl` →
  `mateu-uidl`, `vaadin-lit` → `mateu-vaadin`, `annotation-processor-mvc` →
  `mateu-annotation-processor-mvc`… (full table in the migration guide). The old coordinates are
  published as relocation poms, so existing builds keep resolving with a warning.
- **No-op annotations removed** from `io.mateu.uidl.annotations` — nothing ever read them:
  `@Accordion`, `@AccordionPanel`, `@BaseRoute`, `@H1`…`@H5`, `@HorizontalLayout`, `@VerticalLayout`,
  `@SplitLayout`, `@Scroller`, `@Option`, `@RowAction`, `@State`, `@Tabs`. Each has a one-line
  replacement in the migration guide. `@BusinessComponent` now works (it was also unread): a
  field / no-arg method of a registered class holding a `Component` joins the business-component
  catalogue.
- **CORS is off by default** on every adapter; allow origins with `mateu.cors.allowed-origins`.
- **The MCP endpoint is off by default**; `mateu.mcp.enabled=true`.
- **`${secret.X}`** falls back only to the env var `MATEU_SECRET_X` (Java, .NET, Python).
- **RunJS is opt-in** (`<meta name="mateu-allow-run-js" content="true">`).
- **Quarkus** apps declare `quarkus-rest-jackson`; `quarkus-spring-di` is no longer brought in.
- The Spring bean `objectMapper` is now `mateuObjectMapper`.
- Python: CORS needs `cors_origins=[...]`; the distribution is **`mateu-ui`** on PyPI.

### Security and robustness
- An **error boundary** on every backend: `UserFacingException` messages are shown as written;
  anything else shows a generic message with a reference id, logged at ERROR under it.
- Proxied REST URLs are percent-encoded by position on every server and renderer.
- Strict CSP works: expressions run in Mateu's own sandboxed evaluator (no `new Function`).
- Server-sent URLs are checked (`javascript:` refused); token storage is configurable.

### Added
- `io.mateu:mateu-bom`; annotation processors are Gradle-incremental.
- SSE / LongTask on WebFlux, Quarkus and Helidon; client-log, asset caching, YAML mounts and the
  deep-link fallback on every adapter.
- A UI mount declares its home page: `home:` on `type: UI` (Java, .NET, Python).
- The client's own text in English and Spanish, chosen by `Translator.locale(…)` (`AppDto.locale`).
- Redwood renders every wire component type; chat panel, FABs, theme toggle, global search;
  reproducible ~5 MB jar that works at any mount path; `Map` takes `tileUrl`/`attribution`.
- .NET: net8.0 + net10.0, NuGet release job. Python: published to PyPI as `mateu-ui`, mypy-clean,
  split into modules, identity and secrets providers, Excel/PDF exports, embedded islands and more.
- IDE tooling: New › Mateu for every specs/ui file kind, Add Route…, a settings page and
  authentication in IntelliJ; the same in VS Code ("Mateu: New File…", "Mateu: Add Route…").

### Fixed
- .NET and Python primary buttons were sent as `"Primary"` and rendered as plain buttons.
- A nested `@Text`/`@Notice` read its state with an expression that evaluated as a subtraction.
- A dashboard `@Panel` holding a `Text` advertised twelve list actions nothing could trigger.
- A streamed action on the root view of a mount did nothing; LongTask steps no longer retitle the tab.
- The wire conformance corpus (25 cases) now matches exactly in Java, .NET and Python.

## [3.0-alpha.406] — 2026-10-10

Licensing for GA.

- The Apache-2.0 web bundle (`vaadin-lit`) no longer ships any Vaadin commercial component.
- CI fails the build when a bundled frontend package is not under an approved licence.
- Redwood: the starter files were rewritten as Mateu code; neutral branding by default.

## [3.0-alpha.405] — 2026-10-10

Redwood renderer: OPERA Cloud-like PMS parity, and the features it needed everywhere.

### Added
- **Drag rows to a destination** — `@DragRows` on a listing + `DropZone`.
- **Hover details** — `Popover` with a hover trigger, and `@Tooltip` on listing cells.
- **Action panel** ("I want to…"), **matrix grid**, **card menus** (`@Menu(display = cards)`).
- **Calendar** day / week / month / list views, per-date cells and clickable dates.
- **Keyboard access keys** (`@App(accessKeys = true)`), and `@Action(shortcut)` on Redwood.
- **Map** with markers (`Map.markers` + `markerActionId`) on Java, Vaadin, Redwood, React Native,
  IntelliJ, .NET and Python.
- **Reorderable dashboard tiles** (`ResponsiveGrid.reorderable`), also on .NET and Python.
- A wizard completion action that streams (`LongTask`) lands on the result step.
- Redwood: rich text (Markdown), Gantt, fluent Grid, images/avatars/galleries, dashboards and charts
  on any page, notification bell and undoable toasts, periodic refresh.
- Row tones (`@RowStatus`) and listing exports on `AutoCrud`; also on .NET and Python listings.
- `PlanningBoard` (Room Diary): attribute columns, icons, hover summary, resize, double click,
  range selection.
- Redwood: listings with groups/subtotals/totals, column chooser and saved views; client-side rules
  and dependent fields; more field types (radio, multi-select, money, file, image, signature,
  camera); master-detail and split layouts.

### Changed
- **Enum constants are labelled by their name humanized** (`OUT_OF_STOCK` → "Out of stock"), not the
  raw constant.
- A view advertises only the tree action ids it can actually run.

### Fixed
- Redwood: rich text sanitised by the right function; rule selectors fully escaped; only safe schemes
  as a capture image `src`; a finished guided process says so.
- The `vaadin-lit` jar no longer ships stale build files (including Highcharts).

## [3.0-alpha.404] — 2026-10-09

- Visual editor: **Tidy** (fixed-rule structure clean-ups), the **board** (every screen and the flow
  between them) and play mode, design notes on any component, desktop/tablet/phone widths.

## [3.0-alpha.403] — 2026-10-09

- Visual editor: share links (`#mateuz=`), an agent guide, palette cards with real Vaadin and
  Redwood thumbnails, and a look selector.

## [3.0-alpha.402] — 2026-10-07

- **Not-found page**: a route whose record does not exist (a `NoSuchElementException` while the
  route loads) answers a `NotFound` component instead of an error.
- WebFlux: a UI's own sub-route beats the root UI's deep route. WebFlux, Quarkus and Helidon: a deep
  route answers the index instead of a 404.
- Publishing: Maven pinned to 3.9.16 (3.10.0 broke the Central bundle).

## [3.0-alpha.401] — 2026-10-06

- Vaadin: the generated accent strip tiles without a seam.

## [3.0-alpha.400] — 2026-10-06

- Vaadin: `@App(accentColor)` alone gets a generated Redwood-style accent strip.

[Unreleased]: https://github.com/miguelperezcolom/mateu/compare/v3.0-alpha.406...HEAD
[3.0-alpha.406]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.406
[3.0-alpha.405]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.405
[3.0-alpha.404]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.404
[3.0-alpha.403]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.403
[3.0-alpha.402]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.402
[3.0-alpha.401]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.401
[3.0-alpha.400]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.400
