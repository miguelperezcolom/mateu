# Data-driven mounts, UIs and app shells — replan

Status: DONE (2026-08-15) — all three phases implemented, tested and verified live. Supersedes the
`app:`-block-in-`routes.yaml` design shipped in PR #399. Driven by user design feedback while testing
the IntelliJ visual editor.

**Implemented**: Phase A (core: `MountRegistry` scans `type: UI`; `RouteRegistry` per-mount, flattened
to absolute routes, last-wins; `YamlAppLoader` reads a `type: AppShell` definition; `AppShell`
registered in the YAML mapper; `ActionInstanceCreator` sources the shell from the route's root
definition). Phase B (mvc-core `YamlMountAutoConfiguration` serves each mount at its `basePath` via a
`RouterFunction`, gated by `type: UI` presence; `demo-app-definition` restructured to `back-office.ui.yaml`
+ pure `routes.yaml` + `app.yaml` + pages). Editor (discriminator modes in `mateu-visual-editor`:
`type: UI`→`mount-editor` (new, `mountModel`), `type: AppShell`→`app-editor` (`appModel` repointed to a
top-level definition), route file→`routes-editor` (pure table), else page/partial; `[App|Routes]` tabs
removed). Tests: core `MountRegistryTest`/`YamlAppLoaderTest` (+ full suite green bar a stale-dtos-jar
local artefact); editor 65 vitest + `mountModel.test`. Verified live: demo :8099 renders the shell from
`app.yaml`; the browser editor shows the four modes.

## Why

PR #399 put the app shell as an `app:` block **inside** `routes.yaml`. That mixed two concepts. The
route registry's job is to **decouple/connect** a route with a view definition and a backend; the app
is **just another view** that also has to be bound to a route. And there was no data-driven way to
declare a **mount** (what `@UI("/path")` does) — a project can host several UIs at once.

## The model (everything discriminated by an explicit `type:`)

Four file kinds under `specs/ui/**`:

1. **Mount** — the data-driven `@UI`. One file per mount; several coexist. Discovered by SCANNING for
   `type: UI` (by content, not by filename).
   ```yaml
   # back-office.ui.yaml   ≡  @UI("/back-office")
   type: UI
   basePath: /back-office
   routes:                 # a LIST of route files, merged; on a route collision the LAST wins
     - orders-routes.yaml
     - shared-routes.yaml
   ```
2. **Route file** — a PURE routing table (no app, no chrome). Each entry binds a route to a
   `definition` (layout), a `viewModel` (optional backing class — EVERY screen may have one) and
   `fixedParams`/`defaultParams`, all independently.
   ```yaml
   routes:
     - route: ""            # the mount root → the app shell view
       definition: app.yaml
       viewModel: com.acme.BackOfficeApp
     - route: orders
       definition: orders.yaml
       viewModel: com.acme.Orders
   ```
3. **App shell** — the app is a VIEW/definition of its own, discriminated.
   ```yaml
   # app.yaml
   type: AppShell
   title: Back office
   variant: MENU_ON_TOP
   menu: [ ... ]            # split with Partials if it grows large
   ```
4. **Page / partial definitions** — as today. A definition is LAYOUT; its view model binding lives on
   the route entry.

**Fragmentation** (avoid huge files): Partials (`type: Partial, ref:`) for UI reuse + multiple route
files per mount. NO generic YAML `!include` (YAML has no native cross-file import; not worth a new
mechanism when Partials + multi-route cover the real cases).

## What changes vs PR #399

| Area | #399 (to undo) | New |
|------|----------------|-----|
| App | `app:` block inside `routes.yaml` | own `type: AppShell` definition, bound to a route |
| Routes | one fixed `routes.yaml` carrying `app:` | pure route file(s), listed by the `type: UI` |
| Mount | implicit (deployment root) | `type: UI` file with `basePath`, scanned |
| Editor | `[App\|Routes]` tabs on one file | one editor per file kind (by discriminator) |

Clean cut — NO back-compat with the `app:`-in-`routes.yaml` shape (alpha, shipped same day).

## Backend

### Phase A — model
1. Register `AppShell` as a `type: AppShell` subtype in `YamlUidlMapperFactory` (not there today).
2. `YamlAppLoader`: load a `type: AppShell` definition file by path → `AppShell`. Drop the `app:`
   block reading and the `homeRoute`-from-first-menu default lives on/near the shell definition.
3. `MountRegistry` (new): scan classpath `specs/ui/**` for `type: UI` → mounts (`basePath` + ordered
   route-file list).
4. `RouteRegistry`: becomes PER-MOUNT — merge a mount's route files (**last wins**); resolve by
   `basePath` + relative route. (Today it loads one fixed `specs/ui/routes.yaml`.)
5. Resolution: a route whose `definition` is a `type: AppShell` renders the shell (reuse the shipped
   wiring — `resolveMenuIfApp` already accepts an `AppShell`; `loadYamlPage` for in-app content). The
   app is loaded like any definition bound to a route; its `viewModel` (if any) comes from the entry.
6. Tests: `YamlAppLoaderTest` (type: AppShell), `MountRegistryTest`, multi-file + last-wins resolution.

### Phase B — mvc-core auto-bootstrap
1. `YamlMountCondition` → gate on the presence of `type: UI` descriptors (not on an `app:` block).
2. Serve EACH mount at its `basePath` (SPA + sync), via one `RouterFunction` dispatching by base path.
3. Restructure `demo-app-definition` to the new model (`type: UI` + route file(s) + `app.yaml` +
   page definitions).

## Editor

1. Discriminator-based mode detection in `mateu-visual-editor.load()`:
   - `type: UI` → **Mount editor** (new)
   - `type: AppShell` → **App editor** (existing `app-editor`, repointed to a standalone file)
   - route file (`routes:`/list, no `type`) → **Routes editor** (pure table)
   - `type: Partial` / `content:` / component → **Page/Partial editor** (canvas)
2. Remove the `[App | Routes]` tab toggle.
3. Mount editor (new, `type: UI`): a small form — `basePath` + an ordered list of route-file refs
   (add/remove/reorder).
4. Routes editor: pure table (drop the `app:` preamble special-casing; keep generic preamble
   preservation for unknown keys).
5. App editor: parse/serialize a top-level `type: AppShell` file (not the `app:` sub-block).
6. Tests: `mountModel` + adapt the existing model tests.

## Open decisions (defaults chosen)

1. `type: UI` discovery: scan any `*.yaml` under `specs/ui/**` with `type: UI` (by content, not name).
2. Mount root: the app binds to `route: ""` by convention, but it is just another route entry (no magic).
3. Back-compat with `app:`-in-`routes.yaml`: cut cleanly.
4. Multiple mounts in mvc-core: one `RouterFunction` routing all discovered mounts by `basePath`.

## Nested composition — the app wraps any route-bound view (added 2026-08-15)

User insight: a mediator (app, CRUD, wizard) is an ORCHESTRATOR (sub-routes → views + shared state);
the route registry is that same thing in declarative form. So the route registry GENERALISES the
mediator — a "CRUD" can be expressed as routes+views, skipping the mediator; and a route may still
bind a mediator CLASS as its `viewModel`. Either way the app shell must wrap it.

Two fixes (core), full suite green (903):
1. **Uniform app-shell wrapping** — `ActionInstanceCreator.wrapsInAppShell`: a FRESH deep-link
   (`consumedRoute == "_empty"`) to any route under a mount whose root definition is a `type:
   AppShell` returns the SHELL (chrome); the client loads the content inside. Wraps a class mediator
   (CRUD/wizard), a plain class view, or a definition page uniformly. Before, a class-`viewModel`
   route resolved straight to the class and rendered WITHOUT chrome (the shell is a definition, not
   an `@App` class, so `resolveAsApp`'s class-prefix lookup never found it). The annotation world is
   untouched (`rootDefinitionFor` is null there).
2. **Mediator base route** — `DirectClassResolver` now also `setResolvedPath(route)` in the two
   class-match branches (not the sub-route branch). A data-driven route bound to a mediator had no
   `resolvedPath`, so `MultiView.handleRoute` read the mediator's OWN absolute route as its INNER
   route (a CRUD tried to load entity id="tasks" → `NoSuchElementException` → "Not found"). Now the
   inner route resolves to "" (the listing). A pre-existing gap in data-driven CRUD routing that the
   shell-wrapping surfaced.

Verified live: `demo-app-definition` route `tasks` → `viewModel: TaskCrud` (a class CRUD, NO `@UI`,
bound by `routes.yaml`) renders the listing INSIDE the "Back office" shell.

## Authoring contract — uniform `type`, schemas, `$schema` (added 2026-08-15)

Feedback while testing the plugin: the discriminator wasn't uniform (mount/app had `type`, routes/pages
didn't), there was no schema for the new file kinds, and no version reference. Done (1+2+3 of a 5-point
list; 4 = register a JSON Schema in the plugin for the TEXT editor, 5 = how page templates map — both
pending):

1. **Uniform `type`** — route files carry `type: Routes` (backend ignores it; `isRoutesYaml` detects it
   and now rejects `type: UI`/`AppShell`; `serializeRoutes` always emits the `type: Routes` envelope, so
   a bare list is normalised). Page definitions are bare component trees typed at the ROOT (`type:
   VerticalLayout …`), with NO `modelView` (that lives on the route). Every specs/ui file is now told
   apart by `type`: `UI` / `AppShell` / `Routes` / a component.
2. **Schemas** — `UidlSchemaGenerator.generateMount()` → new `mount-schema.json` (`type: UI`); the routes
   schema gained the optional `type: Routes` const. Pinned by `UidlSchemaTest`. (AppShell + pages are
   already in `uidl-schema.json`.) Regenerate: `mvn -pl shared/uidl test -Dtest=UidlSchemaTest -Duidl.schema.write=true`.
3. **`$schema:`** — the demo files reference their schema by raw-master URL (identity + version + IDE
   IntelliSense where the URL is fetchable). `YamlUidlMapperFactory` now sets `FAIL_ON_UNKNOWN_PROPERTIES=false`
   so a `$schema` (or a future key) on a bare-component page doesn't break deserialization; the route/mount/app
   loaders already read only their known keys.

Editor: `routesModel` emits/detects `type: Routes` and preserves `$schema` in the preamble; 65 vitest green.
Verified live: demo :8099 renders with `$schema` + `type: Routes` + bare typed pages; the CRUD still wraps.

**4 — plugin applies the schema to the TEXT editor — DONE.** `UidlSchemaGenerator.generateSpecs()` →
new **unified `specs-schema.json`** (pinned by `UidlSchemaTest`): a `oneOf` of the four file kinds
(UI mount / Routes envelope / bare route list / a Component — which covers AppShell + pages), carrying
every `$def` (RouteEntry + the component catalog); the `type` field selects the branch. The plugin
bundles it (`resources/schema/specs-schema.json`) and registers `MateuSchemaProviderFactory` (a
`JsonSchemaProviderFactory`, `com.intellij.json.jsonSchemaProviderFactory` EP; `bundledModule("intellij.json.backend")`
+ `<depends>com.intellij.modules.json</depends>`) mapping any YAML whose path contains `specs/ui` to it —
so the raw text editor validates/completes with NO `$schema:` line needed. Compiles; GUI validation is
the user's to confirm. (KDoc gotcha: `specs/ui/**` in a Kotlin doc comment is an unclosed-comment error —
the `*/` embeds.)

**5 — page templates data-driven — DONE (no new `type` needed).** A template is either an ORCHESTRATOR
archetype (Dashboard, CollectionDetail, SmartSearchPage…) — a class view bound via `viewModel`, wrapped
in the shell exactly like a CRUD mediator — or a COMPOSITION archetype (Welcome, HeroSection) — just a
component tree. Both already work through the existing machinery. Demonstrated live: `demo-app-definition`
route `dashboard` → `viewModel: SalesDashboard` (a `Dashboard` subclass, NO `@UI`) renders the scoreboard
+ panels INSIDE the "Back office" shell. The only thing without a data-driven home is the coarse
`@PageTemplate`/`pageType` hint (page-width family); a small follow-up (a field on the route entry or a
page envelope) if wanted.

## Execution order

Backend Phase A → Phase B → Editor → nested composition. Compile + test each before the next; verify
live with the restructured demo + the IntelliJ plugin at the end.
