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
- **Wizards**: extend `Wizard` and declare fields implementing `WizardStep` for each step. The **penultimate** step shows the `@WizardCompletionAction` button; the **last** step is a read-only result screen shown after the action executes. The last step is instantiated automatically if null (preserving field defaults), or the wizard can set it explicitly inside the completion method. The progress bar starts at 0 and shows 100% on the result step. No navigation buttons are shown on the result step.
