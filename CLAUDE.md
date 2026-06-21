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
- `CrudRepository<T>` is the port; `AutoCrudAdapter<T>` is the default in-memory implementation for demos.
- Bean validation annotations (`@NotNull`, `@NotEmpty`, `@Min`, `@Max`) drive client-side and server-side validation automatically.
- `Identifiable` interface on record/entity marks the ID field for CRUD.
- `HttpRequest` can be added to any method signature; Mateu injects it automatically.
- i18n: implement `Translator` or rely on the default `DefaultTranslator`.
- The `uidl` module is the **only** dependency needed for writing `@UI` classes in a framework-agnostic module.
- **Multi-column zone layouts (`@Zones` / `@Zone`)**: annotate a form class with `@Zones({@Zone(name="left", width="64%"), @Zone(name="right", width="36%")})` to lay sections out side by side. Each `@Section(zone="left")` is assigned to the matching zone column; sections with an unrecognised zone fall into a trailing flexible column. `SectionFormRenderer` handles the rendering. Zones are incompatible with `@FoldedLayout` (zones take precedence).
- **`ListingBackend.gridLayout()`**: override this default method to force a specific grid layout instead of letting the renderer auto-select. Values: `GridLayout.auto` (default), `table`, `list`, `cards`, `masterDetail`.
- **Wizards**: extend `Wizard` and declare fields implementing `WizardStep` for each step. The **penultimate** step shows the `@WizardCompletionAction` button; the **last** step is a read-only result screen shown after the action executes. The last step is instantiated automatically if null (preserving field defaults), or the wizard can set it explicitly inside the completion method. The progress bar starts at 0 and shows 100% on the result step. No navigation buttons are shown on the result step. The wizard title is derived via `getTitle()` (respects `@Title`, `TitleSupplier`, or falls back to the class name).
- **AI chat**: when `sseUrl` is set in the app metadata, a floating round button (`.ai-fab`, `position: fixed`, bottom-right) toggles a `mateu-chat` side panel. The button and chat are rendered once outside all variant-specific layouts in `appRenderer.ts`. Do **not** add an IA button to variant headers — the FAB is the only entry point.
- **Dark/light mode toggle**: add `themeToggle = true` to `@App` to show a moon/sun icon button in the header of all app variants. The theme system works in layers: (1) `index.html` inline script applies `localStorage['mateu-theme']` first, then falls back to the OS `prefers-color-scheme` media query — the OS change listener only fires if no user choice is stored; (2) `MateuApp.toggleTheme()` sets `document.documentElement.setAttribute('theme', 'dark'|'light')` and saves to `localStorage`; (3) `MateuApp.connectedCallback` reads the already-set attribute. Always use `setAttribute('theme', 'light'|'dark')` — never `removeAttribute` — to stay consistent with Vaadin's convention.
- **FABs (`@Fab`)**: annotate methods with `@Fab(icon="vaadin:plus", label="...", order=0)` to create floating action buttons. At **app level** (`@UI` class), FABs appear globally stacked above the AI FAB at `right: 1.5rem`. At **page level** (any page class), FABs appear stacked at `right: 5.5rem` and are scoped to that page. FAB actions are dispatched via the standard `action-requested` event mechanism. `FabDto` is the wire type; `Fab.ts` is the frontend TS interface.
- **Page banners (`@Banner` / `BannerSupplier`)**: show messages below the page header and above the first form section, rendered as `vaadin-card`. Two approaches — declarative: annotate methods with `@Banner(theme=BannerTheme.INFO, title="...")` (method may return `String` for a dynamic description); programmatic: implement `BannerSupplier.banners()` returning `List<PageBanner>` (takes precedence over annotations, same pattern as `ToolbarSupplier`/`ButtonsSupplier`). Themes: `INFO` (blue), `SUCCESS` (green), `WARNING` (amber), `DANGER` (red). Wire type: `BannerDto` via existing `PageDto.banners` field; frontend rendering in `mateu-page.ts`. **Dark mode**: banner backgrounds are always light pastels so text and title slot must use `color: #1a1a1a` explicitly — CSS shadow rules don't reach the `slot="title"` light DOM child, so the color is applied inline on the span. **Extra options on `@Banner`**: `closeable = true` adds a dismiss button; `timeoutSeconds = N` auto-dismisses after N seconds. Both also work on `PageBanner` constructor fields.
- **Action-returned banners**: action methods (e.g. `@Toolbar`) can return `PageBanner`, `List<PageBanner>`, or `PageBanners` to show banners on the current page dynamically. They are carried in `UIIncrementDto.banners`, dispatched via `page-banners-received` DOM event, and shown alongside the static `@Banner` banners in `mateu-page.ts`. **Replace vs append**: returning a bare `PageBanner` / `List<PageBanner>` replaces all existing action banners (default). Use `PageBanners.replace(banner…)` for explicit replace or `PageBanners.append(banner…)` to accumulate banners across multiple action calls. Action banners are automatically cleared when the user navigates to a different page (i.e. when `mateu-page.component` changes). **Implementation note**: `PageBanner` and `PageBanners` are excluded from `FragmentListMapper` — returning them from an action produces only banner DTOs, never a spurious UI fragment.
- **Expression interpolation in labels**: any string attribute that accepts a label or title supports `${...}` template expressions evaluated against the current `state` and `data` context. Supported locations: tab labels, section titles (`@Section`), subsection titles, field labels, accordion panel labels, button labels, toolbar button labels, CRUD titles/subtitles, column header labels (including group headers), filter bar active-filter badges, banner title/description, and KPI titles. Page titles/subtitles/KPI text already used `possiblyHtml()` which supports the same syntax. Example: `@Tab("${state.nombre} — Details")` or `@Section("Customer: ${state.customerName}")`.
- **CRUD URL pagination**: navigating directly to a URL with `?page=N`, `?sort=field:asc`, or filter query params now correctly loads that page/sort/filters instead of always showing page 0. The frontend reads the URL params after component init and triggers a new search if any param differs from the default.
- **Page-level badges (`@Badge` / `BadgeSupplier`)**: show small status chips in the page header strip (rendered by `mateu-content-header.ts` via `FormDto.badges`). Two approaches — declarative: annotate methods with `@Badge(label="...", color="success")`. The method may return `boolean` (badge shown when `true`, text from `label` or method name) or `String` (returned string is the badge text; `null`/blank hides it). Programmatic: implement `BadgeSupplier.badges()` returning `List<Badge>` (takes precedence, same pattern as `BannerSupplier`). Colors follow Vaadin Lumo badge themes (`normal`, `success`, `error`, `warning`, `contrast`). Pipeline: `PageMetadataExtractor.getBadges()` → `ReflectionPageMapper` → `PageView.badges` → `PageMapper` → `FormDto.badges` → frontend. **Important timing note**: badges are part of the component metadata (built once on initial render), so they must be based on data available at that time. If the page uses `@Trigger(OnLoad)` to populate fields, call `populate()` from `header()` or a `@PostConstruct` equivalent before badges are evaluated, or use the `BadgeSupplier` interface which is called during metadata construction.
- **`@Inline` fields with actions (`@Toolbar` / `@Button` on nested types)**: annotating a field with `@Inline` expands the nested type's fields directly into the parent `@Section` card without adding a `Card` wrapper. If the nested class has methods annotated with `@Toolbar`, those buttons appear **on the same row as the section title** (title left, buttons right, rendered via `SectionFormRenderer.buildTitleRow`). Methods annotated with `@Button` appear **below the section content** as a right-aligned button row. Action dispatch follows the `"nested-form-action-<fieldName>-<methodName>"` prefix, handled by `RunMethodActionRunner`. Button labels respect `@Label` (via `FieldMetadataExtractor.getLabel(method)`). The nested class must carry its own class-level annotations (`@PlainText`, `@Compact`, etc.) since they are not inherited from the parent form. Use `@Inline` on dense, multi-section screens (`@Compact` + `@Zones`) where the extra card chrome of a non-inline subform would add visual noise.
- **High-density mode (`@Compact`)**: annotate a page class with `@Compact` to render it in condensed mode — smaller control heights, tighter spacing, and smaller field labels — so information-dense screens fit without scrolling. Implemented by injecting the `StyleConstants.COMPACT` CSS custom-property overrides onto the page container; because CSS custom properties cascade through shadow DOM, every Vaadin/Lumo component inside is automatically condensed. Font size is intentionally left at the normal Lumo value so text stays legible. The annotation also shrinks the auto-responsive form-layout minimum column width to `7em` (vs the standard default), allowing more columns to fit at the same viewport width. Combine with `@Zones` / `@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)` for data-heavy operational screens (e.g. hotel check-in forms). On grids/tables the flag also applies Vaadin's built-in `compact` row theme. Opt-in and non-breaking — pages without `@Compact` are unaffected. Alternatively, compose `StyleConstants.COMPACT` directly via `@Style` when you need compact mode on only a part of the page, or want to blend it with other style constants.
