# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Mateu

Mateu is a model-driven UI framework for Java. You annotate Java classes with `@UI` and Mateu generates forms, CRUD screens, navigation, and a full web UI automatically. Developers write zero frontend code for typical business apps.

## Repository Layout

```
backend/          ← Maven multi-module Java backend
  shared/
    core/         ← Framework kernel (hexagonal: application / domain / infra layers)
    uidl/         ← Public API: annotations (@UI, @Action, @Button, etc.) and interfaces (CrudRepository, ListingBackend, …)
    dtos/         ← Wire DTOs exchanged between backend and frontend (UIIncrementDto, FormDto, …)
    annotation-processor-core/   ← AP logic shared by all framework adapters
    annotation-processor-indexer/← Writes META-INF/mateu/ui-registrations into module jars
    frontend/
      vaadin-lit/ ← Bundled vaadin web-component assets served by the Spring boot app
      sapui5-lit/ ← Same for SAP UI5 renderer
      redhat-lit/ ← Same for PatternFly/RedHat renderer
  mvc/            ← Spring MVC adapter (SpaRedirectFilter, annotation-processor-mvc, …)
  webflux/        ← Spring WebFlux adapter
  micronaut/      ← Micronaut adapter
  quarkus/        ← Quarkus adapter
  helidon-mp/     ← Helidon MicroProfile adapter

backend/dotnet/   ← C# server-side (Mateu.NET) — ASP.NET reflection mapper emitting the same
                    /mateu/v3/sync wire model so existing renderers render a C# backend.
                    See backend/dotnet/DESIGN.md + README.md.
backend/python/   ← Python server-side — FastAPI + Pydantic reflection mapper emitting the same
                    /mateu/v3/sync wire model. Field modifiers via Annotated[...], class/method
                    features via decorators. See backend/python/DESIGN.md + README.md.
                    (backend/go is still a placeholder.)

frontend/web/monorepo/    ← TypeScript/Lit/Vite monorepo
  libs/mateu/             ← Shared lib: API client, domain state, base web-components
  apps/vaadin/            ← Vaadin-themed renderer (builds → backend/shared/frontend/vaadin-lit)
  apps/sapui5/            ← SAP UI5 renderer
  apps/redwood/           ← Redwood renderer
  apps/redhat/            ← PatternFly renderer

frontend/app/             ← Native (non-browser) renderers — all speak the same /mateu/v3/sync API
  javafx/                 ← Desktop (JavaFX) — tabbed/docking power-user workspace
  react-native/           ← Mobile (Expo/TypeScript) — iOS & Android
  compose/                ← Compose Multiplatform (Kotlin): ONE codebase → desktop + iOS + Android
                            (commonMain renderers; desktop/iosMain/androidMain entry points)

demo/             ← Runnable demo apps (Spring MVC, WebFlux, Micronaut, Quarkus, Helidon)
e2e/              ← Playwright end-to-end tests + SUT (subject under test) apps
```

## Key Architecture Concepts

### Two-Step Annotation Processing

`@UI` classes can live in a framework-agnostic module (no Spring/Quarkus dep, only `io.mateu:uidl`).

1. **Indexer AP** (`annotation-processor-indexer`) — compile the UI module with this AP; it writes `META-INF/mateu/ui-registrations` into the jar.
2. **Framework AP** (e.g. `annotation-processor-mvc`) — compile the app module with this AP **and** with the UI module on the AP classpath; it reads the index and generates Spring MVC / WebFlux / Micronaut / Quarkus controllers.

Both the UI module **and** the AP must appear in `<annotationProcessorPaths>` of the app's `pom.xml`. See `e2e/README.md` for the canonical example.

### Runtime Flow

Frontend → `POST /{baseUrl}/mateu/v3/components/_/action` → `MateuController` (infra) → application use case → domain → reflection-based mappers → `UIIncrementDto` (JSON) → frontend renders via web-components.

The same `UIIncrementDto` carries `commands` (e.g. `SetWindowTitle`, `navigateTo`), `messages` (toasts/alerts), and `fragments` (partial UI updates).

### Frontend Renderers

Each renderer in `frontend/web/monorepo/apps/<name>/` is a standalone Vite app. Its `copy` npm script builds and copies artifacts directly into the matching `backend/shared/frontend/<name>-lit/src/main/resources` folder so they are served as static assets.

The shared lib (`libs/mateu`) contains: `MateuApiClient`, SSE support, `mateu-ux` (root web component), `mateu-dialog`, `mateu-grid`, `mateu-choice`, and base infrastructure. Renderers import from `mateu` workspace package and provide renderer-specific web-components for each DTO type.

## Creating a Release

Releases follow the pattern `Mateu v3.0-alpha.N`. To cut a new one:

1. Check the latest release number:
   ```bash
   gh release list --limit 5
   ```
2. Create the next release (increment N by 1):
   ```bash
   gh release create v3.0-alpha.N --title "Mateu v3.0-alpha.N" --notes "- summary of changes"
   ```

GitHub Actions handle the rest (build, publish to Maven Central, etc.) automatically once the tag is pushed.

---

## Build & Run Commands

### Java Backend (from repo root or any Maven module)

```bash
# Build entire backend (from backend/)
cd backend && mvn clean install -DskipTests

# Build a single module
cd backend/shared/core && mvn clean install

# Run a demo app
cd demo/demo-vaadin-mvc && mvn spring-boot:run

# Run tests for a module
cd backend/shared/core && mvn test

# Run a single test class
cd backend/shared/core && mvn test -Dtest=YamlUidlLoaderTest
```

Use the settings.xml at repo root when you need to point to a custom Maven repo:
```bash
mvn -s settings.xml clean install
```

### Frontend (from `frontend/web/monorepo/`)

```bash
# Install dependencies (first time or after package.json changes)
npm install   # or yarn

# Dev server for a renderer
cd apps/vaadin && yarn dev       # http://localhost:5173
cd apps/sapui5 && yarn dev

# Build a renderer and copy assets into backend
cd apps/vaadin && yarn copy      # builds + copies to backend/shared/frontend/vaadin-lit/...
cd apps/sapui5 && yarn copy
```

### E2E Tests (from `e2e/`)

```bash
# 1. Build UI module
cd e2e/sut/modules/sample1 && mvn clean install

# 2. Start the test app (keep running)
cd e2e/sut/apps/mvc-app1 && mvn spring-boot:run

# 3. Run Playwright tests
cd e2e && npm test
npm run test:headed   # with browser visible
npm run test:ui       # interactive UI mode
npm run report        # open last HTML report
```

## Generating Documentation Screenshots

Screenshots for the documentation in `doc/src/content/docs/` are generated programmatically:

1. **Write** the example Java class in the appropriate SUT module (usually `e2e/sut/modules/sample1/` for pure UI classes, or `e2e/sut/apps/mvc-app1/src/.../app/` for CRUD classes that need `AutoCrud`).
2. **Build** the changed modules:
   ```bash
   cd e2e/sut/modules/sample1 && mvn clean install
   cd e2e/sut/apps/mvc-app1 && mvn clean install -DskipTests
   ```
3. **Start** the MVC app (keep running in background):
   ```bash
   cd e2e/sut/apps/mvc-app1 && mvn spring-boot:run
   ```
4. **Take screenshots** using the Playwright one-shot script (from `e2e/`):
   ```bash
   # Full-page screenshot of a route
   node screenshot.mjs --url http://localhost:8080/<route> --output ../doc/public/images/docs/<topic>/<name>.png

   # Screenshot of a specific element only
   node screenshot.mjs --url http://localhost:8080/<route> --output ../doc/public/images/docs/<topic>/<name>.png --element vaadin-form-layout

   # Custom viewport
   node screenshot.mjs --url http://localhost:8080/<route> --output ../doc/public/images/docs/<topic>/<name>.png --width 1440 --height 900
   ```
5. **Reference** the images in the doc Markdown as `/images/docs/<topic>/<name>.png`.

The script waits for `mateu-page` to appear, then adds a 1.5 s settle delay so web components finish rendering before the screenshot is taken. Options: `--wait-for`, `--element`, `--width`, `--height`, `--full-page`, `--settle`, `--timeout`.

> This approach also **validates** the documentation code examples — if a class does not compile or does not produce the expected UI, the screenshot will be blank or missing.

---

## API Quick Reference

Every Mateu app exposes the same REST contract regardless of framework:

```
POST /{baseUrl}/mateu/v3/components/_/action
Body: { "route": "...", "actionId": "__load__" | "<methodName>", "componentState": {...} }
```

Response is `UIIncrementDto` (see `backend/shared/dtos`).

## Important Conventions

- `@UI("/path")` on a class registers it as a routed view; no path means root.
- `AutoCrud<T>` / `AutoCrudOrchestrator<T>` give full CRUD with minimal code.
- `CrudRepository<T>` is the port; implement it inline or as a Spring `@Service` and return it from `repository()` in your `AutoCrud<T>` subclass.
- **`CrudRepository.find(String searchText, T filters, Pageable pageable)` → `Page<T>`**: the single search+filter+sort+paginate entry point `AutoCrud` uses to fill the listing. It is a **`default`** method (so no existing implementer breaks): the default filters `findAll()` by `searchText` (via `Searchable.searchableText()`/`toString()`), sorts by `pageable.sort()` (read reflectively via getter/record-accessor/field by three tiny `private static` helpers in `CrudRepository` — `uidl` has no property reader), then paginates in memory. Override it to push everything to the database. `Page<T>` already carries `totalElements`, so there is **no separate `count` method** — a DB impl runs the count + page queries inside `find`. Wired in `FilteredAutoCrud.fetchRows` (core), which now delegates to `repository().find(searchText, (T) filters, pageable)` instead of doing the in-memory `findAll().stream().filter().subList()` itself; override `fetchRows(...)` on the `AutoCrud` subclass only when you need the `HttpRequest`. Types live in `io.mateu.uidl.data`: `Page`, `Pageable(page,size,List<Sort>)`, `Sort(field,Direction)`, `Direction{ascending,descending}`.
- **CRUD button labels**: override any of `newLabel()`, `saveLabel()`, `cancelLabel()`, `deleteLabel()`, `editLabel()`, `addAnotherLabel()`, `backToListLabel()`, `importLabel()`, `historyLabel()` in an `AutoCrud` subclass to replace the corresponding built-in English label. The default values are the method names in plain English (e.g. `newLabel()` → `"New"`). Implemented in `Crud.java`; consumed by `ListRouteResolver`, `CrudFormComponentBuilder`, and `ViewToolbarBuilder`.
- Bean validation annotations (`@NotNull`, `@NotEmpty`, `@Min`, `@Max`) drive client-side and server-side validation automatically.
- `Identifiable` interface on record/entity marks the ID field for CRUD.
- `HttpRequest` can be added to any method signature; Mateu injects it automatically.
- i18n: implement `Translator` or rely on the default `DefaultTranslator`.
- The `uidl` module is the **only** dependency needed for writing `@UI` classes in a framework-agnostic module.
- **Multi-column zone layouts (`@Zones` / `@Zone`)**: annotate a form class with `@Zones({@Zone(name="left", width="64%"), @Zone(name="right", width="36%")})` to lay sections out side by side. Each `@Section(zone="left")` is assigned to the matching zone column; sections with an unrecognised zone fall into a trailing flexible column. `SectionFormRenderer` handles the rendering. Zones are incompatible with `@FoldedLayout` (zones take precedence).
- **Sticky sections index (`@Toc`) + pinned sections (`@Section(sticky=true)`)**: for long "docs-style" pages with many sections stacked vertically, annotate the page class with `@Toc` to show a **sticky right-hand index** (table of contents) listing every section title; clicking an entry smooth-scrolls to that section and the active entry highlights as the user scrolls (scrollspy). `@Toc` is **tri-state**: absent → *auto* (the frontend shows the index only when there are **> 4** section cards stacked vertically and the form is **not** a `@Zones`/`@FoldedLayout` horizontal layout), `@Toc`/`@Toc(true)` → force on, `@Toc(false)` → suppress. Independently, mark any `@Section(sticky=true)` so its card is **pinned** (`position: sticky`) and never leaves the viewport while the rest scrolls (e.g. a guests list on a check-in screen). In docs mode the **page header is also pinned** (the `mateu-content-header` gets a `sticky-header` class, `top:0`), and **multiple sticky sections stack** directly under it without overlapping: `mateu-page._layoutStickyTops()` measures the header height (published as the `--mateu-header-h` CSS var, also used for the index's `top`) and sets each sticky card's `top` to the header height plus the cumulative height of the sticky cards declared before it, with a small gap between each so stacked pinned cards never touch (recomputed on resize). Pipeline: `@Toc` → `PageMetadataExtractor.getToc` (a nullable `Boolean`, read via `MetaAnnotations`) → `PageView.toc` → `PageMapper` → `PageDto.toc` → frontend `Form.toc`; `@Section.sticky()` → `SectionFormRenderer` adds the `mateu-section` marker class to **every** section card (plus `mateu-section--sticky` + `position: sticky` style when sticky) — note the reflective `@Section` path emits section cards as fluent `Card`s (→ `CardMapper` → `cardRenderer.ts`), **not** `formSectionRenderer.ts`, and `CardMapper` hardcodes the card id, so the index anchors by DOM element reference + the marker class, not by a server id. Frontend lives entirely in `mateu-page.ts`: it enumerates `vaadin-card.mateu-section` across the slotted subtree, reads each card's title (`[slot="title"]` or the first `h1..h6` heading), lays the body out as a 2-column grid (content + sticky `<aside class="page-toc">`), and runs a scroll-listener scrollspy on the nearest scrollable ancestor (the app's `vaadin-scroller`). The active entry is the section occupying the **reading line just below the pinned region** — the scrollspy measures the pinned region bottom straight from the rendered rects (pinned header + whichever sticky cards are butted up against it) so a section hidden *behind* a pinned sticky is never marked active, and a pinned sticky section itself is highlighted while it's the one in view. Clicking an index entry scrolls with an offset (via `scrollBy`, not `scrollIntoView`) so the target lands **just below the pinned region** (header + any sticky section above it), not hidden behind it; the scrollspy uses the same pinned-region bottom (plus the same landing gap) so the highlighted entry stays consistent with click-to-scroll. After a click the scrollspy is **locked** to the clicked entry until the next manual scroll gesture (`wheel`/`touchstart`/`keydown`), so a section near the bottom that can't scroll all the way up to the reading line still stays highlighted. **Keyboard shortcuts**: while the index is shown, `Ctrl+Alt+1..9` jump to the first nine sections (same as clicking the entry, and it locks the highlight the same way); the shortcut number is shown as a faint badge on each index entry (matched via `e.code` — both `Digit1..9` and the numeric keypad `Numpad1..9` — so it's layout- and NumLock-independent). This is on by default — no annotation attribute needed. Demo: `demo-admin-panel/.../checkin/CheckInFormV2.java` (`/checkin/:id/v2`) — every section stacked vertically with the Huéspedes section pinned; the client-info tabs are split into their own top-level sections (`CardexSection`, `CompanyDataSection`, `CardDataSection`, `ClientHistorySection`, `PreferencesSection`) so all of it is visible and indexed instead of hidden behind tabs (note: `@Tab`→`@Section` only works at the top level — a nested `@Inline` type's fields are grouped into tabs, not sub-sections). Contrast with v1/v3 which stay `@Zones` master-detail with the shared tabbed `ClientInfoSection`.
- **`ListingBackend.gridLayout()`**: override this default method to force a specific grid layout instead of letting the renderer auto-select. Values: `GridLayout.auto` (default), `table`, `list`, `cards`, `masterDetail`.
- **Grid column widths (`@ColumnWidth`)**: annotate a grid row field with `@ColumnWidth("9rem")` for a fixed-width column (rendered with `flex-grow:0`), or **`@ColumnWidth("auto")`** to have the column **size to its content** (header + widest cell) so nothing truncates — this adapts to the current density, which is why it's the right choice for a grid shown in both compact and non-compact screens (a fixed `3rem` truncates to `"A."`/`"H."` once non-compact padding eats the width). No `@ColumnWidth` → the column keeps the default `flex-grow` and shares the remaining space. Handled in `GridColumnBuilder` (`auto` → `GridColumn.autoWidth(true)` + null width + `flex-grow:0`); the `autoWidth`/`width`/`flexGrow` fields flow through `GridColumnMapper` to the `vaadin-grid-column` in `renderColumn.ts`. Cells always ellipsis-truncate (`renderColumn.ts` `columnRenderer`), so column width is the only lever against truncation.
- **Wizards**: extend `Wizard` and declare fields implementing `WizardStep` for each step. The **penultimate** step shows the `@WizardCompletionAction` button; the **last** step is a read-only result screen shown after the action executes. The last step is instantiated automatically if null (preserving field defaults), or the wizard can set it explicitly inside the completion method. The progress bar starts at 0 and shows 100% on the result step. No navigation buttons are shown on the result step. The wizard title is derived via `getTitle()` (respects `@Title`, `TitleSupplier`, or falls back to the class name).
- **AI chat**: when `sseUrl` is set in the app metadata, a floating round button (`.ai-fab`, `position: fixed`, bottom-right) toggles a `mateu-chat` side panel. The button and chat are rendered once outside all variant-specific layouts in `appRenderer.ts`. Do **not** add an IA button to variant headers — the FAB is the only entry point.
- **Dark/light mode toggle**: add `themeToggle = true` to `@App` to show a moon/sun icon button in the header of all app variants. The theme system works in layers: (1) `index.html` inline script applies `localStorage['mateu-theme']` first, then falls back to the OS `prefers-color-scheme` media query — the OS change listener only fires if no user choice is stored; (2) `MateuApp.toggleTheme()` sets `document.documentElement.setAttribute('theme', 'dark'|'light')` and saves to `localStorage`; (3) `MateuApp.connectedCallback` reads the already-set attribute. Always use `setAttribute('theme', 'light'|'dark')` — never `removeAttribute` — to stay consistent with Vaadin's convention. The toggle button and the theme-change listener for `HAMBURGUER_MENU` are rendered in the right-side widgets container (the `margin-left:auto` `<div>` that also holds the widgets slot), so they stay right-aligned without affecting the hamburger button on the left.
- **FABs (`@Fab`)**: annotate methods with `@Fab(icon="vaadin:plus", label="...", order=0)` to create floating action buttons. At **app level** (`@UI` class), FABs appear globally stacked above the AI FAB at `right: 1.5rem`. At **page level** (any page class), FABs appear stacked at `right: 5.5rem` and are scoped to that page. FAB actions are dispatched via the standard `action-requested` event mechanism. `FabDto` is the wire type; `Fab.ts` is the frontend TS interface.
- **Page banners (`@Banner` / `BannerSupplier`)**: show messages below the page header and above the first form section, rendered as `vaadin-card`. Two approaches — declarative: annotate methods with `@Banner(theme=BannerTheme.INFO, title="...")` (method may return `String` for a dynamic description); programmatic: implement `BannerSupplier.banners()` returning `List<PageBanner>` (takes precedence over annotations, same pattern as `ToolbarSupplier`/`ButtonsSupplier`). Themes: `INFO` (blue), `SUCCESS` (green), `WARNING` (amber), `DANGER` (red). Wire type: `BannerDto` via existing `PageDto.banners` field; frontend rendering in `mateu-page.ts`. **Dark mode**: banner backgrounds are always light pastels so text and title slot must use `color: #1a1a1a` explicitly — CSS shadow rules don't reach the `slot="title"` light DOM child, so the color is applied inline on the span. **Extra options on `@Banner`**: `closeable = true` adds a dismiss button; `timeoutSeconds = N` auto-dismisses after N seconds. Both also work on `PageBanner` constructor fields.
- **Action-returned banners**: action methods (e.g. `@Toolbar`) can return `PageBanner`, `List<PageBanner>`, or `PageBanners` to show banners on the current page dynamically. They are carried in `UIIncrementDto.banners`, dispatched via `page-banners-received` DOM event, and shown alongside the static `@Banner` banners in `mateu-page.ts`. **Replace vs append**: returning a bare `PageBanner` / `List<PageBanner>` replaces all existing action banners (default). Use `PageBanners.replace(banner…)` for explicit replace or `PageBanners.append(banner…)` to accumulate banners across multiple action calls. Action banners are automatically cleared when the user navigates to a different page (i.e. when `mateu-page.component` changes). **Implementation note**: `PageBanner` and `PageBanners` are excluded from `FragmentListMapper` — returning them from an action produces only banner DTOs, never a spurious UI fragment.
- **Expression interpolation in labels**: any string attribute that accepts a label or title supports `${...}` template expressions evaluated against the current `state` and `data` context. Supported locations: tab labels, section titles (`@Section`), subsection titles, field labels, accordion panel labels, button labels, toolbar button labels, CRUD titles/subtitles, column header labels (including group headers), filter bar active-filter badges, banner title/description, and KPI titles. Page titles/subtitles/KPI text already used `possiblyHtml()` which supports the same syntax. Example: `@Tab("${state.nombre} — Details")` or `@Section("Customer: ${state.customerName}")`.
- **CRUD URL pagination**: navigating directly to a URL with `?page=N`, `?sort=field:asc`, or filter query params now correctly loads that page/sort/filters instead of always showing page 0. The frontend reads the URL params after component init and triggers a new search if any param differs from the default.
- **Page-level badges (`@BadgeInHeader` / `BadgeSupplier`)**: show small status chips in the page header strip (rendered by `mateu-content-header.ts` via `FormDto.badges`). **Important**: `@Badge` is NOT the header badge — it is a shorthand for `@Stereotype(FieldStereotype.badge)` which renders a boolean chip **inside the form body**. The header-strip annotation is `@BadgeInHeader`, placed on **fields** (not methods). Two approaches — declarative: annotate a boolean or String field with `@BadgeInHeader(label="...", color="success")`. For boolean fields the badge is shown when the value is `true`, text = `label` (or field name if empty). For String fields the field value is used as badge text; `null`/blank hides the badge. Fields annotated with `@BadgeInHeader` are automatically excluded from the form body by `FormFieldFilter`. Programmatic: implement `BadgeSupplier.badges()` returning `List<Badge>` (takes precedence over `@BadgeInHeader` fields, same pattern as `BannerSupplier`). Colors follow Vaadin Lumo badge themes (`normal`, `success`, `error`, `warning`, `contrast`). Pipeline: `PageMetadataExtractor.getBadges()` → `ReflectionPageMapper` → `PageView.badges` → `PageMapper` → `FormDto.badges` → frontend. **Important timing note**: badges are part of the component metadata (built once on initial render), so they must be based on data available at that time.
- **`@Inline` fields with actions (`@Toolbar` / `@Button` on nested types)**: annotating a field with `@Inline` expands the nested type's fields directly into the parent `@Section` card without adding a `Card` wrapper. If the nested class has methods annotated with `@Toolbar`, those buttons appear **on the same row as the section title** (title left, buttons right, rendered via `SectionFormRenderer.buildTitleRow`). Methods annotated with `@Button` appear **below the section content** as a right-aligned button row. Action dispatch follows the `"nested-form-action-<fieldName>-<methodName>"` prefix, handled by `RunMethodActionRunner`. Button labels respect `@Label` (via `FieldMetadataExtractor.getLabel(method)`). The nested class must carry its own class-level annotations (`@PlainText`, `@Compact`, etc.) since they are not inherited from the parent form. Use `@Inline` on dense, multi-section screens (`@Compact` + `@Zones`) where the extra card chrome of a non-inline subform would add visual noise.
- **`@Inline` on embedded orchestrator fields (`MultiView` subclasses, e.g. `AutoEditableView`)**: when the host field is annotated `@Inline`, the embedded mediator drops its badges/kpis, demotes its title from `h2` to `h3` (so it nests visually under the host `@Section`/`@Tab`), and, when the inner form has a single section, drops the outlined Card wrapper around it. The parent `@Section` that hosts an `@Inline` embedded mediator also drops its own title row so the two don't visually compete — the embedded `h3` title + toolbar buttons render as a single coherent row, with the parent card providing the framing. Use this when the embedded view lives inside a host tab or section that should own the framing (e.g. an editable `PersonalDataView` inside a "Datos personales" section, or a read-only `CardexView` inside an "Info Cardex" tab). Mechanism: `EmbeddedOrchestratorFieldBuilder` appends `_inline=1` next to `_embeddedMediator=1` on the marked route and seeds it into `initialData`; `EditableView` calls `isInline(httpRequest)` to set `PageView.level=1` and drop badges/kpis; `SectionFormRenderer.render()` skips the `Card outlined` wrap on the single-section path when `EmbeddedOrchestratorFieldBuilder.isInlineRequest(httpRequest)` is true; `SectionFormRenderer.renderSections()` hides the parent section title via `hostsInlineEmbeddedMediator()`. For tabs (which don't carry their own title row), the embedded `h3` becomes the only visible title — remove `@Title` from the inner model to suppress it entirely.
- **High-density mode (`@Compact`)**: annotate a page class with `@Compact` to render it in condensed mode — smaller control heights, tighter spacing, and smaller field labels — so information-dense screens fit without scrolling. Implemented by injecting the `StyleConstants.COMPACT` CSS custom-property overrides onto the page container; because CSS custom properties cascade through shadow DOM, every Vaadin/Lumo component inside is automatically condensed. Font size is intentionally left at the normal Lumo value so text stays legible. The annotation also shrinks the auto-responsive form-layout minimum column width to `7em` (vs the standard default), allowing more columns to fit at the same viewport width. Additionally, `@Compact` pages emit a `compact-changed` event from `mateu-page` on render; `mateu-app` listens and adds a `no-padding` CSS class to the `app-content` element, removing the standard content area padding so the form fills edge-to-edge. Combine with `@Zones` / `@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)` for data-heavy operational screens (e.g. hotel check-in forms). On grids/tables the flag also applies Vaadin's built-in `compact` row theme. `StyleConstants.COMPACT` includes a `--mateu-compact:1` CSS custom property marker used by frontend components to detect compact mode. Opt-in and non-breaking — pages without `@Compact` are unaffected. Alternatively, compose `StyleConstants.COMPACT` directly via `@Style` when you need compact mode on only a part of the page, or want to blend it with other style constants.
- **`@PlainText` at class level**: `@PlainText` can be applied at the class level (in addition to field level) to make **all** fields in that class render as plain read-only text. This is particularly useful on inline nested types (`@Inline`) or wizard result steps where every field should be display-only without input chrome.
- **`@Multiline`**: annotate a `@PlainText` field (or a class) with `@Multiline` to allow the plain-text content to wrap across multiple lines instead of truncating with an ellipsis. Has no effect on non-plain-text fields.
- **`AppVariant.AUTO` heuristic**: `@App(AppVariant.AUTO)` (which is now the default since `value()` defaults to `AUTO`) auto-selects the app shell variant. Currently the rule in `AppMetadataExtractor` is: if the total number of top-level menu items exceeds 7, it selects `HAMBURGUER_MENU`; otherwise it falls back to `MENU_ON_LEFT`. This threshold and the selection logic live in `AppMetadataExtractor.inferVariant()` and can be adjusted there.
- **`AppLayout` on `@App`**: the `@App` annotation has a second attribute `layout` of type `AppLayout` (default `SINGLE_SLOT`). `AppLayout.SPLIT` renders the content area as a two-pane split layout. This is distinct from `AppVariant` (which controls navigation chrome) — `layout` controls how the page content area itself is arranged.
- **`@AutoSave`**: annotate a page class with `@AutoSave(debounceMillis=800, action="save")` to automatically invoke the named action method whenever the user changes a field value. The call is debounced: the framework waits until the user has been idle for `debounceMillis` ms before dispatching. Default action name is `"save"`. Useful for settings screens and draft editors where explicit save buttons are unwanted.
- **Keyboard shortcuts**: any action method can be bound to a keyboard shortcut via `@Action(shortcut="ctrl+s")` (works alongside `@Toolbar`/`@Button` on the same method). The shortcut string is `+`-separated modifiers and key (`ctrl`, `alt`, `shift`, `meta`). Shortcuts work inside subforms (nested types): the action is collected into the component's `actions` list with the nested id (`nested-form-action-<field>-<method>`) by `ActionMapper.addNestedFormsActions` → `FieldActionCollector` (which preserves the `@Action` shortcut), and `mateu-component._keydownListener` scans that list. `@Action(runOnEnter=true)` is equivalent to `shortcut="enter"`. The matcher `mateu-component._shortcutMatchesEvent` matches by `e.key` **or** `e.code` (`KeyX`/`DigitX`/`NumpadX`), so modifier+letter/digit shortcuts are keyboard-layout independent (important on e.g. Spanish layouts where `Ctrl+Alt+<letter>`/AltGr remaps `e.key` to a symbol) and the numeric keypad works. The button's shortcut also shows as a `title` tooltip (`buttonRenderer.ts`) — for which `ButtonMapper` propagates `Button.shortcut` to `ButtonDto`. Demo: every action on `CheckInFormV2` (`/checkin/:id/v2`) is bound to a `Ctrl+Alt+<letter>` shortcut across its (shared and V2-specific) section classes.
- **Tab keyboard shortcuts (`@Tab(shortcut="alt+1")`)**: select a tab by keyboard, same shortcut syntax as `@Action`. Pipeline: `Tab.shortcut()` (uidl annotation) → `FormLayoutBuilder` sets `io.mateu.uidl.data.Tab.shortcut` (fluent record, new field) → `TabMapper` → `TabDto.shortcut` → frontend `Tab.ts.shortcut`. The frontend emits it as a `data-shortcut` attribute on each `<vaadin-tab>` (`renderLayouts.ts renderTabLayout`); `mateu-component._handleTabShortcut` (called first in `_keydownListener`) does a pure DOM lookup (`this.renderRoot.querySelectorAll('vaadin-tab[data-shortcut]')`), matches via the shared `_shortcutMatchesEvent`, and sets the enclosing `vaadin-tabs.selected` to the tab's index — in-place, no server round-trip. **Gotcha**: tabs are grouped by consecutive fields sharing the same `@Tab` name *within a section*; putting a `@Section` on each tab's fields splits the form into several separate one-tab strips (each its own `vaadin-tabsheet`), so for one tab strip don't mix per-tab `@Section`. Demo: `demo-admin-panel/.../tabs/TabsShortcutDemo.java` (`/tabs-shortcuts`). User docs: `doc/.../ux-patterns/keyboard-shortcuts.md`.
- **Unsaved-changes navigation guard (`@ConfirmOnNavigationIfDirty`)**: annotate a form class to warn the user before they leave it with unsaved changes. The confirmation covers **every** way of leaving: in-app menu navigation, browser back/forward (`popstate`, with URL restore on cancel), and reloading/closing the tab (`beforeunload`). CRUD create/edit views opt in automatically. Control the state programmatically by returning `UICommand.markAsDirty()` / `UICommand.markAsClean()` from any action (typically `markAsClean()` after a successful save; a backend-driven `NavigateTo` marks clean instead of prompting). **Frontend architecture** (centralized in commit "centralize unsaved-changes navigation guard"): `dirtyGuard.ts` is the single source of truth — it owns the dirty flag, wires the document-level dirty/clean listeners once, installs the `beforeunload` guard, and exposes `confirmLeave()`. `mateu-app` (route selection) and `mateu-ui` (browser back/forward) both delegate to it; `mateu-component` resets the dirty flag when a tracked form (re)loads, tied to the lifecycle that rebuilds `formerState` (so reset no longer depends on the backend sending `MarkAsClean`). Annotation lives in `uidl` (`ConfirmOnNavigationIfDirty.java`), surfaced via `ServerSideComponentDto`. Documented for users in `doc/.../reference/key-annotations.md`, `ux-patterns/partial-forms.md`, and `fluent-components/fluent-commands.md`. **`EditableView.navigate` auto-cleans on `/view`**: when an `EditableView`'s `save` or `cancel-edit` lands on `/view`, `navigate(...)` automatically appends `UICommand.markAsClean()` to the response. Required because the unmount of the edit-mode `mateu-component` does NOT fire `clean` (that lifecycle hook fires only when the new component is tracked, and view mode is not tracked); without the explicit command the global dirty flag would stay set after save/cancel and the host page would keep prompting on every navigation. Same pattern AutoCrud uses after a persist.
- **Money formatting on read-only fields (`@Stereotype(FieldStereotype.money)`)**: mark a numeric field (`BigDecimal`, `double`, etc.) with `@Stereotype(FieldStereotype.money)` so it renders as a formatted currency amount. In a **plain-text context** (the field or its declaring class is `@PlainText`) the field keeps the dense plain-text rendering but is tagged `FieldDataType.money` so the front-end formats the value (thousands separator + 2 decimals via `Intl.NumberFormat`, `de-DE` by default; `Amount` values use their own `locale`/`currency`). Logic in `FieldTypeMapper` (`getDataType` / `getStereotype`, helpers `isMoneyStereotype` / `isPlainTextContext`): the money stereotype yields `plainText` for layout while `dataType=money` carries the formatting intent. Front-end formatting is in the `plainText` branch of `mateu-field.ts`. `Amount`-typed fields already get `dataType=money` automatically. Used in the check-in demo (`FoliosSection`: límite crédito, entrega a cuenta, saldo pendiente).
- **Inter-component communication (`@SubscribeTo` / `@Emits` + `UICommand.dispatchEvent`)**: components talk to each other by emitting named custom events and subscribing to them. **Emit**: return `UICommand.dispatchEvent(eventName)` or `dispatchEvent(eventName, payload)` from any action; the frontend (`ConnectedElement.applyCommand`, `DispatchEvent` branch) dispatches a real `bubbles+composed` DOM `CustomEvent` from the emitting component element, stamping `detail.__source` with the emitter's logical name (`@Emits(name=...)`, falling back to `serverSideType`) — only on object payloads, so legacy events keep their shape. **Subscribe**: annotate a class with `@SubscribeTo(event=..., action=..., source=..., from=..., condition=...)` (repeatable via `@SubscribesTo`); when the event fires Mateu runs `action` server-side on that component passing `event.detail` as parameters. **Scope** = `SubscriptionSource`: `DOCUMENT` (default — global bus, the listener is attached to `document` so it reaches sibling/unrelated components), `COMPONENT` (listens on `document` but filters by `detail.__source === from`), `SELF` (legacy: listens on the component's own element, only catches events bubbling up from descendants). A raw `@Trigger(type=OnCustomEvent)` maps to `SELF` (backward compatible). Pipeline: `@SubscribeTo`/`@Emits` → `TriggerMapper` / `EmitsMapper` → `OnCustomEventTriggerDto(source,from)` + `ServerSideComponentDto.emitsName` → frontend `ComponentElement.registerCustomEventListeners()` (attaches to `document` or `this` per scope; removed in `disconnectedCallback`) + `customEventManager` (filters by `__source`, only `stopPropagation` for SELF). `@Emits` is mostly declarative; its only runtime effect is supplying the `name` stamped as `__source`. Used in the check-in demo: `GuestsSection` (`@Emits(name="guests-section")`) emits `checkin-confirmed`; `CheckInForm` (`@SubscribeTo(event="checkin-confirmed", action="load", source=DOCUMENT)`) refreshes itself in place instead of navigating away.
- **Grid row selection (`@OnRowSelected`)**: annotate a grid list field (`@Stereotype(FieldStereotype.grid)`) with `@OnRowSelected("methodName")` to run a developer method when the user selects (clicks) a row. The clicked row is auto-injected into a method parameter typed as the row class (`HttpRequest.getClickedRow(...)`, injected by `RunMethodActionRunner.createParameters`). **Works on read-only grids** (unlike the default `<fieldId>_selected` CRUD detail-edit path, which is also broken for nested grids), so it's the way to build master/detail. Pipeline: `GridColumnBuilder.getOnItemSelectionActionId()` sets `FormField.onItemSelectionActionId` to the routed action id — bare method name at page level, or `nested-form-action-<prefix><method>` when the grid is inside a nested `@Inline` section (e.g. `nested-form-action-guestList-onGuestSelected`); the frontend `mateu-grid.ts` `active-item-changed` handler (fires on row click regardless of the selection column / read-only) dispatches `action-requested` with `parameters: { _clickedRow: item }`. **The action is auto-registered** in the component's `actions` list by `FieldActionCollector` (for each `@OnRowSelected` field) — required because `mateu-component.manageActionRequestedEvent` only sends an action to the server if it is in `actions`; otherwise it bubbles unclaimed and is dropped. Commonly combined with `@Emits`/`UICommand.dispatchEvent` + a `@SubscribeTo` to update another panel. **Keyboard row selection**: `@OnRowSelected(value=…, shortcut="ctrl+shift")` lets the user select a row by position — the base combo plus a digit selects that row (`ctrl+shift+1` → first row … ninth; top-row or numeric keypad, matched via `e.code`). Pipeline: `@OnRowSelected.shortcut()` → `GridColumnBuilder.getRowSelectionShortcut` → `FormField.rowSelectionShortcut` → `FormFieldDto` → `mateu-grid.ts`, whose document `keydown` handler resolves the row and calls the shared `selectRow(item)` (same path as a click: sets `selectedItems` + dispatches `action-requested` with `_clickedRow`). Demo: `GuestsSection.guests` is `@OnRowSelected(value="onGuestSelected", shortcut="ctrl+shift")` → emits `pax-selected` (Ctrl+Shift+N reloads the cardex with the N-th guest).
- **Self-reloading embedded component (master/detail via events)**: to make a panel reload *itself* (not the whole page) when an event fires, extract it into its own class and embed it as an independent `ServerSideComponent` by making it a `MultiView` (e.g. a read-only `AutoEditableView<T>` — see the embedded-orchestrator field mechanism). Three rules make the self-reload work: (1) put `@SubscribeTo` on the **loaded entity** (the model view), not the orchestrator — `MultiView.wrapView` maps the embedded component's triggers from the loaded entity; (2) **advertise the reload action** by overriding `actions(HttpRequest)` to add it (so the embedded component claims it and routes it to `handleAction`); (3) in `handleAction`, after updating the (static, demo) holder, **alternate the always-view route** (`setRouteTo(flip ? "/view" : "/")`) and `return new State(this)` — the embedded mediator only re-renders on a route change, so a fixed route updates on the first reload only. Demo: `Cardex` (`@SubscribeTo("pax-selected", action="reloadPax")`) + `CardexView extends AutoEditableView<Cardex>` (`@UI`, `@ReadOnly`) embedded in `CheckInForm`; selecting a guest row reloads only the cardex with that pax's full data. Documented in `doc/.../ux-patterns/component-communication.md`. (A cleaner long-term fix would force the embedded mediator to re-render on every action regardless of route change, removing the route-flip workaround.)
- **Semantic (composed) annotations**: any Mateu **field, method or class** annotation can be used as a meta-annotation to build a single domain annotation that bundles configuration — e.g. `@Lookup(search=…, label=…) @interface ProveedorId {}` then `@ProveedorId String proveedorId;`, or `@Stereotype(money) @Label(…) @Help(…) @interface ImporteTotal {}`, or method `@Toolbar @Label("Guardar") @interface AccionGuardar {}`, or class `@Compact @interface PantallaCompacta {}`. Resolved by `io.mateu.core.infra.reflection.MetaAnnotations.find/isPresent(element, X.class)` (like Spring's `findMergedAnnotation`, minimal — first match, no `@AliasFor`). Every framework annotation read in core goes through `MetaAnnotations` and every field/method/class uidl annotation carries `ElementType.ANNOTATION_TYPE` in its `@Target`. **Exception**: routing annotations (`@UI`/`@Route`/`@Routes`/`@HomeRoute`) are NOT composable — they're resolved by the annotation processor at compile time (not meta-aware), so their reads stay `aClass.getAnnotation(...)` directly. To make a NEW annotation composable: add `ANNOTATION_TYPE` to its `@Target` and read it via `MetaAnnotations`. Demo: `demo-admin-panel/.../proveedores/` (`/proveedor-demo`). User docs: `doc/.../java-ui-definition/annotations/semantic-annotations.md`.
- **Component adapters (`ComponentAdapter<T>` SPI)**: lets a developer render an arbitrary domain object that is NOT a Mateu component and carries no Mateu form annotations, and round-trip it back from state. Interface in `uidl/.../interfaces/ComponentAdapter.java`: `type()`, `adapt(T, HttpRequest) → AdaptedView`, `deserialize(Map state, HttpRequest) → T`. `AdaptedView` (`uidl/.../data/AdaptedView.java`) bundles `components` + `state` + `data` + `actions` (action ids the view exposes). Register the adapter as a bean (`@Service`); discovered via `MateuBeanProvider.getBeans(ComponentAdapter.class)`. **Pipeline**: `AdapterRegistry` (core `infra/adapters/`) finds the adapter by type; `ReflectionUiIncrementMapper.map` substitutes the instance with an `AdaptedComponentTree` bridge (implements `ComponentTreeSupplier`+`StateSupplier`+`DataSupplier`+`ActionSupplier`) so the adapter's components/state/data/actions flow through the normal mappers unchanged; the bridge advertises the **model's** type name as `serverSideType` (via the new `ComponentTreeSupplier.serverSideType()` default) so state routes back. `AdapterInstanceFactory` (`InstanceFactory`, priority 100) wins for adapted types and calls `deserialize` to rebuild the model from the incoming state — **this also builds the initial route instance from an empty state**, so `deserialize` must guard each assignment with `state.containsKey(...)` to preserve the model's field initializers. **Top-level**: give the model `@UI("/route")` (routing only — the adapter owns the whole UI) + field initializers to seed the initial view. **Nested**: an adapted-type field of a normal form is rendered as an independent island — `ReflectionFormFieldMapper` wraps `new AdaptedComponentTree(value, adapter)` in a `CustomField`, which `ComponentToFragmentDtoMapper` maps to its own `ServerSideComponentDto` (own serverSideType+state+actions), so its buttons round-trip through the adapter on their own (a real second `mateu-component` boundary). Demo: `demo-admin-panel/.../adapters/` — `Pedido` (`@UI("/adapter-demo")`, plain POJO) + `PedidoAdapter` + `AdapterNestedDemo` (`/adapter-nested-demo`). User docs: `doc/.../java-ui-definition/interfaces/component-adapter.md`.
- **Uploadable image field (`@UploadableImage`)**: shorthand for `@Stereotype(FieldStereotype.uploadableImage)` (new enum value) on a `String` field — renders the image preview + Upload/Replace + Delete actions. **Self-contained, no upload endpoint**: the picked file is read client-side into a **data URI** (base64) and stored as the field value, so the image travels in the string and round-trips like any other field; the value may also be a plain URL. Pipeline: `@UploadableImage` (uidl, mirrors `@Badge`) → `FieldTypeMapper.getStereotype` (via `MetaAnnotations`) → `FieldStereotype.uploadableImage` → frontend `mateu-field.ts`: editable branch renders `<img>` + a hidden `<input type=file>` + `vaadin-button`s; `imageUpload` uses `FileReader.readAsDataURL` → `value-changed`, `imageDelete` sets value `''`, `triggerImageUpload` clicks the hidden input; the read-only `image` branch also handles `uploadableImage` (shows just the `<img>`). `stereotype` is a plain string on the wire, so no DTO change. Demo: `demo-admin-panel/.../images/ImageFieldDemo.java` (`/image-field`). User docs: `doc/.../java-ui-definition/annotations/field-types.md` (`@UploadableImage`).
- **Permission-driven field/button state (`@EyesOnly` on fields, `@ReadOnlyUnless`, `@DisabledUnless`)**: the same identity dimensions as `@EyesOnly` (`roles`/`groups`/`scopes`/`permissions`, resolved from the JWT Bearer token by `Authorizer`) now drive three field states, not just menu visibility. **Hide**: `@EyesOnly` on a form field hides it when unauthorized — evaluated in `FormFieldFilter.filterField` (so it also applies to inline subforms and listing columns; previously `@EyesOnly` only gated menus in `AppMenuBuilder`/`MenuEntryMapper`). **Read-only**: `@ReadOnlyUnless(...)` (field or class level) makes the field/view read-only unless authorized — evaluated in `PageFormBuilder.readOnlyByPermission`, called from both `PageFormBuilder.isReadOnly` and `ReflectionFormFieldMapper.isReadOnly` (static `readOnly` bool on `FormFieldDto`). **Disabled**: `@DisabledUnless(...)` (field or `@Button`/`@Toolbar` method) disables unless authorized — for fields it emits a client-side `disabled` Rule in `RuleMapper.createRules` (mirrors `@Disabled`); for buttons it's OR-ed into the disabled flag in `PageButtonsBuilder` via `disabledByPermission(...)`. All three reuse `Authorizer.isAuthorized(...)` (refactored to a shared private `matches(roles,groups,scopes,permissions,httpRequest)` core with overloads per annotation). Matching is AND across declared dimensions, OR within each; no dimension declared → unrestricted; no request/token → unauthorized. They **compose** for layered access, e.g. `@EyesOnly(roles="staff") @ReadOnlyUnless(roles="manager")` → hidden to non-staff, read-only to staff, editable to managers. **Caveat**: `MetaAnnotations` has no `@AliasFor`, so a composed (semantic) annotation wrapping these cannot override their dimension attributes. Annotations in `uidl` (`ReadOnlyUnless`, `DisabledUnless`). Demo: `demo-admin-panel/.../security/FieldAccessDemo.java`. User docs: `doc/.../reference/key-annotations.md`.
