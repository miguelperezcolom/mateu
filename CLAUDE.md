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

frontend/web/monorepo/    ← TypeScript/Lit/Vite monorepo
  libs/mateu/             ← Shared lib: API client, domain state, base web-components
  apps/vaadin/            ← Vaadin-themed renderer (builds → backend/shared/frontend/vaadin-lit)
  apps/sapui5/            ← SAP UI5 renderer
  apps/redwood/           ← Redwood renderer
  apps/redhat/            ← PatternFly renderer

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
- **CRUD button labels**: override any of `newLabel()`, `saveLabel()`, `cancelLabel()`, `deleteLabel()`, `editLabel()`, `addAnotherLabel()`, `backToListLabel()`, `importLabel()`, `historyLabel()` in an `AutoCrud` subclass to replace the corresponding built-in English label. The default values are the method names in plain English (e.g. `newLabel()` → `"New"`). Implemented in `Crud.java`; consumed by `ListRouteResolver`, `CrudFormComponentBuilder`, and `ViewToolbarBuilder`.
- Bean validation annotations (`@NotNull`, `@NotEmpty`, `@Min`, `@Max`) drive client-side and server-side validation automatically.
- `Identifiable` interface on record/entity marks the ID field for CRUD.
- `HttpRequest` can be added to any method signature; Mateu injects it automatically.
- i18n: implement `Translator` or rely on the default `DefaultTranslator`.
- The `uidl` module is the **only** dependency needed for writing `@UI` classes in a framework-agnostic module.
- **Multi-column zone layouts (`@Zones` / `@Zone`)**: annotate a form class with `@Zones({@Zone(name="left", width="64%"), @Zone(name="right", width="36%")})` to lay sections out side by side. Each `@Section(zone="left")` is assigned to the matching zone column; sections with an unrecognised zone fall into a trailing flexible column. `SectionFormRenderer` handles the rendering. Zones are incompatible with `@FoldedLayout` (zones take precedence).
- **`ListingBackend.gridLayout()`**: override this default method to force a specific grid layout instead of letting the renderer auto-select. Values: `GridLayout.auto` (default), `table`, `list`, `cards`, `masterDetail`.
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
- **High-density mode (`@Compact`)**: annotate a page class with `@Compact` to render it in condensed mode — smaller control heights, tighter spacing, and smaller field labels — so information-dense screens fit without scrolling. Implemented by injecting the `StyleConstants.COMPACT` CSS custom-property overrides onto the page container; because CSS custom properties cascade through shadow DOM, every Vaadin/Lumo component inside is automatically condensed. Font size is intentionally left at the normal Lumo value so text stays legible. The annotation also shrinks the auto-responsive form-layout minimum column width to `7em` (vs the standard default), allowing more columns to fit at the same viewport width. Additionally, `@Compact` pages emit a `compact-changed` event from `mateu-page` on render; `mateu-app` listens and adds a `no-padding` CSS class to the `app-content` element, removing the standard content area padding so the form fills edge-to-edge. Combine with `@Zones` / `@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)` for data-heavy operational screens (e.g. hotel check-in forms). On grids/tables the flag also applies Vaadin's built-in `compact` row theme. `StyleConstants.COMPACT` includes a `--mateu-compact:1` CSS custom property marker used by frontend components to detect compact mode. Opt-in and non-breaking — pages without `@Compact` are unaffected. Alternatively, compose `StyleConstants.COMPACT` directly via `@Style` when you need compact mode on only a part of the page, or want to blend it with other style constants.
- **`@PlainText` at class level**: `@PlainText` can be applied at the class level (in addition to field level) to make **all** fields in that class render as plain read-only text. This is particularly useful on inline nested types (`@Inline`) or wizard result steps where every field should be display-only without input chrome.
- **`@Multiline`**: annotate a `@PlainText` field (or a class) with `@Multiline` to allow the plain-text content to wrap across multiple lines instead of truncating with an ellipsis. Has no effect on non-plain-text fields.
- **`AppVariant.AUTO` heuristic**: `@App(AppVariant.AUTO)` (which is now the default since `value()` defaults to `AUTO`) auto-selects the app shell variant. Currently the rule in `AppMetadataExtractor` is: if the total number of top-level menu items exceeds 7, it selects `HAMBURGUER_MENU`; otherwise it falls back to `MENU_ON_LEFT`. This threshold and the selection logic live in `AppMetadataExtractor.inferVariant()` and can be adjusted there.
- **`AppLayout` on `@App`**: the `@App` annotation has a second attribute `layout` of type `AppLayout` (default `SINGLE_SLOT`). `AppLayout.SPLIT` renders the content area as a two-pane split layout. This is distinct from `AppVariant` (which controls navigation chrome) — `layout` controls how the page content area itself is arranged.
- **`@AutoSave`**: annotate a page class with `@AutoSave(debounceMillis=800, action="save")` to automatically invoke the named action method whenever the user changes a field value. The call is debounced: the framework waits until the user has been idle for `debounceMillis` ms before dispatching. Default action name is `"save"`. Useful for settings screens and draft editors where explicit save buttons are unwanted.
- **Keyboard shortcuts**: any action method can be bound to a keyboard shortcut via `@Action(shortcut="ctrl+s")`. The shortcut string is `+`-separated modifiers and key (`ctrl`, `alt`, `shift`, `meta`). Shortcuts work inside subforms (nested types) — Mateu propagates the shortcut through `ButtonDto` and the parent component scans the tree. `@Action(runOnEnter=true)` is equivalent to `shortcut="enter"`. Both mechanisms use the same client-side keyboard listener.
- **Unsaved-changes navigation guard (`@ConfirmOnNavigationIfDirty`)**: annotate a form class to warn the user before they leave it with unsaved changes. The confirmation covers **every** way of leaving: in-app menu navigation, browser back/forward (`popstate`, with URL restore on cancel), and reloading/closing the tab (`beforeunload`). CRUD create/edit views opt in automatically. Control the state programmatically by returning `UICommand.markAsDirty()` / `UICommand.markAsClean()` from any action (typically `markAsClean()` after a successful save; a backend-driven `NavigateTo` marks clean instead of prompting). **Frontend architecture** (centralized in commit "centralize unsaved-changes navigation guard"): `dirtyGuard.ts` is the single source of truth — it owns the dirty flag, wires the document-level dirty/clean listeners once, installs the `beforeunload` guard, and exposes `confirmLeave()`. `mateu-app` (route selection) and `mateu-ui` (browser back/forward) both delegate to it; `mateu-component` resets the dirty flag when a tracked form (re)loads, tied to the lifecycle that rebuilds `formerState` (so reset no longer depends on the backend sending `MarkAsClean`). Annotation lives in `uidl` (`ConfirmOnNavigationIfDirty.java`), surfaced via `ServerSideComponentDto`. Documented for users in `doc/.../reference/key-annotations.md`, `ux-patterns/partial-forms.md`, and `fluent-components/fluent-commands.md`.
- **Money formatting on read-only fields (`@Stereotype(FieldStereotype.money)`)**: mark a numeric field (`BigDecimal`, `double`, etc.) with `@Stereotype(FieldStereotype.money)` so it renders as a formatted currency amount. In a **plain-text context** (the field or its declaring class is `@PlainText`) the field keeps the dense plain-text rendering but is tagged `FieldDataType.money` so the front-end formats the value (thousands separator + 2 decimals via `Intl.NumberFormat`, `de-DE` by default; `Amount` values use their own `locale`/`currency`). Logic in `FieldTypeMapper` (`getDataType` / `getStereotype`, helpers `isMoneyStereotype` / `isPlainTextContext`): the money stereotype yields `plainText` for layout while `dataType=money` carries the formatting intent. Front-end formatting is in the `plainText` branch of `mateu-field.ts`. `Amount`-typed fields already get `dataType=money` automatically. Used in the check-in demo (`FoliosSection`: límite crédito, entrega a cuenta, saldo pendiente).
