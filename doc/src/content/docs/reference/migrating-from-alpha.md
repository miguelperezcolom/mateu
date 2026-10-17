---
title: "Migrating from alpha"
description: "Every rename, removal and default change between the 3.0 alphas and the beta, with the one-line fix for each."
---

The 3.0 alphas changed the API in place while it was being shaped. This page collects **every
change that can break an app written against an earlier alpha** — renames, removals, and defaults
that now behave differently — so you can upgrade in one pass. From the beta on, changes follow the
[stability policy](/reference/stability-and-versioning/) instead: deprecated for one minor first,
never removed silently.

Work through the sections that apply; the compiler finds most of them for you (the Java renames
and removals are compile errors), the [default changes](#defaults-that-changed) are the ones to read.

## Maven artifacts

Every published artifact now carries the `mateu-` prefix (the group stays `io.mateu`). The old
coordinates still resolve — each one is published as a **relocation pom** pointing at the new id, so
an old build keeps working and Maven prints a warning naming the replacement — but they are
deprecated: update your poms (or import `io.mateu:mateu-bom` and drop the versions altogether).

| Before (`io.mateu:…`) | Now (`io.mateu:…`) |
|---|---|
| `uidl` | `mateu-uidl` |
| `dtos` | `mateu-dtos` |
| `core` | `mateu-core` |
| `mvc-core` | `mateu-mvc` |
| `webflux-core` | `mateu-webflux` |
| `micronaut-core` | `mateu-micronaut` |
| `quarkus-core` | `mateu-quarkus` |
| `helidon-mp-core` | `mateu-helidon-mp` |
| `vaadin-lit` | `mateu-vaadin` |
| `redwood` | `mateu-redwood` |
| `annotation-processor-indexer` | `mateu-annotation-processor-indexer` |
| `annotation-processor-core` | `mateu-annotation-processor-core` |
| `annotation-processor-mvc` | `mateu-annotation-processor-mvc` |
| `annotation-processor-webflux` | `mateu-annotation-processor-webflux` |
| `annotation-processor-micronaut` | `mateu-annotation-processor-micronaut` |
| `annotation-processor-quarkus` | `mateu-annotation-processor-quarkus` |
| `annotation-processor-helidon-mp` | `mateu-annotation-processor-helidon-mp` |
| `mateu-bom`, `mateu-bundle-maven-plugin` | unchanged |

An old id in `<annotationProcessorPaths>` is followed too, but **silently** (Maven only warns for
dependencies) — so search your poms for the old processor ids rather than waiting for a warning. The
renderer switch of the demos follows suit: `-Dmateu.renderer=mateu-vaadin|mateu-redwood`.

The parent poms (`backend`, `shared`, `mvc`, `webflux`… → `mateu-parent`, `mateu-shared-parent`,
`mateu-mvc-parent`…) were renamed too; nothing outside Mateu should reference them, so they have no
relocation.

## Renames

| Before | Now | What to do |
|---|---|---|
| `CrudRepository<T>` / `CompositionCrudRepository<T>` | `CrudStore<T>` / `CompositionCrudStore<T>` | Rename the type. Same methods. |
| `AutoCrud.repository()` | `AutoCrud.store()` | Rename the override. |
| `ListingBackend<Row>` | `Listing<Row>` | Rename. `search(SearchRequest, HttpRequest)` is the single entry point; read typed filters with `Filterable.filters(request)`. |
| `ReactiveListingBackend<Row>` | `ReactiveListing<Row>` | Rename. |
| `io.mateu.core.infra.declarative.Listing` (base class) | `io.mateu.uidl.interfaces.Listing` (interface) | Implement the interface; `@Toolbar` actions, selectors and row-method invocation moved into it. |
| `Searchable` (entity interface: "search me by this text") | `SearchableText` | Rename on your entities. The name `Searchable` now means the **listing capability** (show a search box) — see below. |
| `Crud.saveNew(...)` | `Crud.create(...)` | Rename; `save(...)` now returns the id. |

## Removed

| Removed | Replacement |
|---|---|
| `@Route`, `@Routes`, `@HomeRoute` | `@UI` is the only routing annotation and declares a **mount**. Screens inside a mount are declared in [`routes.yaml`](/concepts/routes-and-mounts/) or supplied in code by a `RouteEntrySupplier` bean. The home route is the app's first menu item, or what `HomeRouteSupplier` returns. See [Route annotations](/java-ui-definition/annotations/route/) for the step-by-step. |
| The `Deleteable` view-class marker | Custom `Crud`s show **Delete** by default; subtract it with `@NotDeletable`. |
| The `AutoCrud.store()` fallback | `store()` is **abstract**: every `AutoCrud` / `FilteredAutoCrud` subclass must override it. |
| The `route-registrations` index file | Nothing to do — the annotation processors write `ui-registrations` only. Rebuild modules compiled by an old processor. |
| `@Tabs` (class) | Nothing — consecutive fields sharing a `@Tab` name already form one tab strip. Delete the annotation. |
| `@Accordion`, `@AccordionPanel` | `@FoldedLayout` on the class: each `@Section` becomes a collapsible panel. (`@Accordion` never had runtime retention.) |
| `@HorizontalLayout`, `@VerticalLayout`, `@SplitLayout`, `@Scroller` (annotations) | `@Zones`/`@Zone` for side-by-side sections, `@MasterDetail`, or the fluent `HorizontalLayout`/`VerticalLayout`/`SplitLayout`/`Scroller` records (unchanged) in a `ComponentTreeSupplier`. |
| `@H1` … `@H5` | `@Text(container = TextContainer.h1)` … `h6`. |
| `@Option` (on enum constants) | `@Label` on the constant — or nothing: an unlabelled constant is humanized (`OUT_OF_STOCK` → "Out of stock"). |
| `@State` | Nothing — every field already travels in the component state; rules read it as `state.<field>`. |
| `@RowAction` | A `ColumnActionGroup` field on the row (`new ColumnAction("approve", "Approve")`) runs the listing method `approve(Row row)`. |
| `@BaseRoute` | `basePath:` in the route file (`type: Routes`). |
| `io.mateu.uidl.fluent.ActionType` (an empty enum) | Nothing — it had no constants and nothing used it. |
| The `mateu-export-excel` and `mateu-export-pdf` modules (and their old ids `export-excel` / `export-pdf`) | Mateu ships UI only: the Export buttons, columns, rows and the download stay, but the **file engine** is yours. Implement `io.mateu.uidl.interfaces.ListingExporter` (one bean per format, with Apache POI, PDFBox, OpenPDF… as your own dependency) — two implementations to copy are in [Export engines](/java-ui-definition/interfaces/listing/#export-engines). Without one, the Excel / PDF buttons are simply not shown. CSV still works out of the box. |
| `ExcelExporter`, `PdfExporter`, `CsvExporter` (`io.mateu.uidl.interfaces`) | `ListingExporter`: `ExportFormat format()` + `ExportedFile export(ListingExport, HttpRequest)` — it receives the format, title, columns, ALL filtered rows and the search, and returns the bytes plus an optional media type and filename. |
| .NET `IExcelExporter` / `IPdfExporter` / `ICsvExporter` and the built-in Excel / PDF writers | `IListingExporter` (`Format` + `Export(ListingExport)` → `ExportedFile`), registered as a service; see the [C# manual](/csharp-user-manual/#listing-exports). CSV stays built in. |
| Python `mateu-ui[export]` extra (openpyxl / reportlab) and the built-in Excel / PDF writers | a `ListingExporter` subclass of yours in a module you register (`add_mateu(app, my_module)`), discovered like the other suppliers; see the [Python manual](/python-user-manual/#exports). CSV stays built in. |
| The `mateu-agent-cli` / `agent-cli-companion` modules (never published; the CLI bridge for the AI chat) and the chat's probe of a local companion on `127.0.0.1:8776` | Point `@AI(sse = …)` at your own agent endpoint — the chat panel and its SSE contract are unchanged ([AI assistant](/ai/)). |
| Renderers: SAP UI5, Oracle JET (`redwood-oj`), PatternFly (`redhat`), Salesforce Lightning (`slds`); the JavaFX and Compose native renderers | Web: `mateu-vaadin` or `mateu-redwood` (Oracle Visual Builder). Native: React Native and the IntelliJ plugin. Your UI code does not change — swap the renderer dependency. |

All the annotations in the rows above had **no effect** in any alpha — nothing read them — so
removing one changes no screen; it only makes the compiler point at it.

## Deprecated in 3.0-alpha.410 (still working)

The pre-beta API freeze review deprecated these instead of removing them: they keep compiling and
working, the compiler warns, and they will be removed after the deprecation period. Each Javadoc
names its replacement.

| Deprecated | Use instead |
|---|---|
| `AppVariant.HAMBURGUER_MENU` (misspelled; also in YAML `variant:`) | `AppVariant.HAMBURGER_MENU` — renders the same. .NET: `AppVariant.HamburgerMenu`; Python: `AppVariant.HAMBURGER_MENU` (the old string warns). Since 3.0-alpha.412 it is also the wire value — see [Wire and renderers](#wire-and-renderers) |
| `@GenericClass` | nothing — it was never read; declare the field with its type argument (`List<MyDto>`) |
| `io.mateu.uidl.annotations.ActionType` | `@Toolbar` / `@Button` / `@Hidden` on the method |
| `ActionPosition`, `ActionStereotype`, `ActionThemeVariant` (empty enums in `io.mateu.uidl.fluent`) | nothing — they had no constants; style buttons with `ButtonStyle` / `ButtonColor` / `ButtonVariant` |
| `Binding`, `BindingSource` | nothing — components bind by convention (`FormField` id ↔ property, `Button` actionId ↔ method); expressions read `state.*` / `appState.*` |
| `ClientSideEvent` | `UICommand.dispatchEvent(name, payload)` + `@SubscribeTo` |
| `Destination` | `UICommand.navigateTo(route)`, or return a `URI` from the action |
| `ListAdapter<Filters, Row>` | `Listing<Row>` (`search(SearchRequest, HttpRequest)`) |
| `io.mateu.uidl.layout.ColumnLayoutSelector` | declare `gridLayout()` — `GridLayout.auto` is a table |
| 28 unreachable wire DTOs in `io.mateu.dtos` (`JourneyDto`, `ViewDto`, `BadgeColorDto`, `SortCriteriaDto`, …) | nothing — no live DTO references them; the wire is unchanged |
| .NET `DashboardLayout` / `ContentLayout` (now `[Obsolete]`, like Java's `@Deprecated`); Python ones warn | `ResponsiveGrid` |

## Deprecated in 3.0-alpha.412 (still working)

The owner's pre-beta API decisions. Every item is an addition plus a deprecation: the old name keeps
compiling and working (Java `@Deprecated(forRemoval = true)`, .NET `[Obsolete]`, Python
`DeprecationWarning`) until it is removed after the deprecation period.

| Deprecated | Use instead |
|---|---|
| `BadgeSupplier` (`List<Badge> badges()`) | `HeaderBadgesSupplier` (`List<Badge> headerBadges()`) — named after `@BadgeInHeader`. Both are read; the new one wins if a page implements both |
| `Button.getActionId()` | `Button.resolvedActionId()` — same value: the declared id, else derived from the label. `actionId()` is the declared id only. Nothing changes on the wire |
| `@KeycloakSecured` | your framework's authentication (an OIDC login / resource server for Keycloak) — Mateu reads the principal it authenticates, or a `PrincipalResolver` bean. See [Security](/java-user-manual/advanced/security/) |
| `AppVariantDto.HAMBURGUER_MENU` (wire DTO) | `AppVariantDto.HAMBURGER_MENU` |
| The settings `mateu.layout.inference` and `mateu.page.inference.disabled` (they warn once) | `mateu.layout.inference.enabled` and `mateu.page.inference.enabled` — mind the polarity: `disabled=true` is `enabled=false`. .NET: the AppContext switches `Mateu.LayoutInference` / `Mateu.PageInference.Disabled` → `Mateu.LayoutInference.Enabled` / `Mateu.PageInference.Enabled`. See [Global switches](/ux-patterns/layout-inference/#global-switches) |
| Python `Size(min=, max=)` (the length constraint) | `Length(min=, max=)` — same fields; in Java and .NET `Size` is a component's sizing intent |
| .NET `[Secured("x")]`, Python `@secured("x")` | `[EyesOnly(Permissions = new[] { "x" })]` / `@eyes_only(permissions=["x"])` on the class. **`[Secured]`/`@secured` are now enforced (they were silently ignored before)**: exactly like `EyesOnly(permissions = "x")`, the view and its actions are refused (403) to a caller without the permission or with no principal, and the menu entries leading to it are hidden. A view that carried it was open to everyone until 3.0-alpha.412 — check that the callers who need it hold the permission (and that your framework's security is configured, or nobody does) |

**Moved, nothing to change**: the .NET code-authoring types (`IRouteEntrySupplier`, `IAppSupplier`,
`IMenuSupplier`, `AppShell`, `RouteEntry`) now live in the `Mateu.Uidl` package with the same full
names (`Mateu.Core.*`); `Mateu.Core` forwards them, so existing code and binaries keep working, and a
UI-only module no longer needs `Mateu.Core` to use them.

## Defaults that changed

These compile unchanged and **behave differently**. Check each against your screens.

| Area | Before | Now | To get the old behaviour |
|---|---|---|---|
| Enum labels | the raw constant (`OUT_OF_STOCK`) | the name humanized ("Out of stock") | label each constant explicitly (`@Label`) |
| Rich text (`@Stereotype(richText)`) | the value was Quill Delta JSON | the value is **HTML** | values stored by the old editor still open and are saved as HTML on the next edit — migrate stored data if other systems read it |
| `GridLayout.auto` | chose table / list / cards / master-detail from the available width | always a **table** | declare `gridLayout()` explicitly (`cards`, `list`, `masterDetail`) |
| Clicking a listing row (a navigable listing: a view per row, or `rowRoute`) | only the id link opened the record | a click **anywhere on the row** opens it (and Enter on a focused row); the selection checkbox, inline editors and display columns — buttons, links, menus, action groups, components, columns with their own action — keep their own behaviour | — (put a per-row action in a column with its own `actionId` if a click there must not open the record) |
| Listing search box | always shown | shown only if the listing implements `Searchable` | add `Searchable` to the listing (`AutoCrud` and `Crud` already have it) |
| Listings without interaction capabilities | opened empty | **search on opening** (`Listing.searchesOnOpening()` defaults to `true`) | override `searchesOnOpening()` to return `false` |
| `@Section(columns = …)` | default `1`, and an explicit `1` was ignored | default `0` = inherit from `@FormLayout`; an explicit `columns = 1` is honoured | remove an explicit `columns = 1` you did not mean |
| CORS | the generated controllers carried `@CrossOrigin` (any origin; Micronaut also with credentials) | **off**: same-origin only | set `mateu.cors.allowed-origins` (comma-separated; optionally `mateu.cors.allow-credentials=true`, never with `*`) — Python: `add_mateu(app, cors_origins=[...])` |
| Roles for `@EyesOnly` / `@ReadOnlyUnless` / `@DisabledUnless` / YAML `access:` | read from the Bearer token's payload **without verifying it** — anyone could forge them | **Mateu does not authenticate**: roles come only from the principal your framework authenticated (Spring Security, Quarkus/Micronaut/Helidon security, ASP.NET Core authentication, Python's `request.state.mateu_identity` / `AuthenticationMiddleware`) or a `PrincipalResolver` bean. A token on its own grants nothing; with no security configured, restricted UI is hidden for everyone and a WARN at startup says so | configure your framework's security (see [Security](/java-user-manual/advanced/security/#how-authorization-works)) — there is no opt-out. Python: `jwt_identity_provider` and the `jwt` extra are gone; verify the token in your app and set `request.state.mateu_identity = identity_from_claims(claims)` |
| .NET `[Secured("x")]` / Python `@secured("x")` on a view | silently ignored: the view was open to everyone | **enforced** like `EyesOnly(permissions = "x")`: 403 for the view and its actions without the permission (or with no principal), menu entries to it hidden | — (it was always meant to restrict; grant the permission to the callers who need the view) |
| `@EyesOnly` fields in the state | hidden in the form but their value travelled in the component state | left out of the state for callers who may not see them | — |
| Spring component scan | the generated `…Config` scanned **all of `io.mateu`**, sweeping in the beans of any library under `io.mateu.*`; the docs asked for `scanBasePackages = "io.mateu"` | Mateu's beans come from its adapter's auto-configuration (`io.mateu.MateuAutoConfiguration`), which scans only Mateu's own packages | drop `"io.mateu"` from `scanBasePackages`; if your OWN code lives under `io.mateu.*` (outside the main class's package), name that package there; a third-party UI module you used to get for free (e.g. EventConductor's console) is mounted with `mateu.ui.modules=<its package>` — see [Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/) |
| Which methods an `actionId` can run (Java) | every public method of a view model | **strict action mode**: a method marked as an action (`@Action`, `@Button`, `@Toolbar`…) or one whose id the view advertises (a fluent button, a trigger, `@OnRowSelected`, a menu rule…); an unadvertised public method answers 403 — as the .NET and Python backends always did | mark the handler `@Action` (undo targets, row actions, methods only a test or another backend dispatches); or `mateu.actions.strict=false` while you migrate |
| CRUD save of read-only / hidden fields | the posted state wrote every field, an edit could even change the id (a new row next to the edited one) | an edit keeps the loaded record's id and its read-only / hidden-in-editor values; a create takes read-only / hidden-in-create fields from a fresh creation form | a value a `buildCreationForm` override pre-fills into a read-only field: set it in `create()` (or the store) instead |
| MCP endpoint (`POST /mateu/mcp`) | on | **off** | `mateu.mcp.enabled=true` |
| `${secret.X}` in proxied REST sources | fell back to ANY environment variable named `X` | a `SecretsProvider` bean first, then only the env var `MATEU_SECRET_X` | rename the variable to `MATEU_SECRET_X` |
| Unexpected exceptions in actions | the exception class and message in the toast | "Something went wrong — An unexpected error occurred. Reference: …", the details in the server log under that reference | throw `io.mateu.uidl.UserFacingException(title, message)` for messages meant for the user; `MATEU_ERRORS_DETAILED=true` restores the raw text in development |
| Client-side JavaScript (`RunJS` rules, RunJS menu leaves, an action's `js`) | always on | **off** — expressions (`${…}`, rules, `@Hidden(…)`) run in Mateu's own evaluator and need no `'unsafe-eval'` | `<meta name="mateu-allow-run-js" content="true">` (or `configureRunJs(true)`), and `'unsafe-eval'` in that page's CSP |
| Quarkus | `quarkus-spring-di` came with the adapter | not brought in | declare `quarkus-rest-jackson` (and `quarkus-spring-di` only if your own beans need it) |
| Spring `ObjectMapper` bean | Mateu registered one named `objectMapper` | named `mateuObjectMapper`, not injected into your beans | declare your own `ObjectMapper` bean if you relied on Mateu's |

## Wire and renderers

- Every response now carries `wireVersion` (`3.0`). The first-party renderers check it and show a
  clear message when the server speaks another wire major; a custom renderer should do the same and
  ignore unknown fields and component types — see the [wire specification](/reference/wire-specification/).
- **Servers now send `HAMBURGER_MENU`** (3.0-alpha.412) where they used to send the misspelled
  `HAMBURGUER_MENU` — Java, .NET and Python alike, whichever spelling you declared. Every
  first-party renderer accepts both spellings (web and Redwood since 3.0-alpha.387; React Native and
  IntelliJ treat every menu variant the same), so this only matters with a **renderer that predates
  the change or a custom one**: an old renderer plus a new server is a mismatch — upgrade the
  renderer together with the server (they ship together), and make a custom renderer accept both.
- The **Java wire DTOs** (`mateu-dtos`) are outside the Java binary-compatibility promise: the
  contract is the JSON. A new optional wire field replaces a DTO record's canonical constructor, so
  build DTOs through their builders. See [Stability & versioning](/reference/stability-and-versioning/#the-wire-dtos-json-not-java-binaries).
- The Redwood renderer serves Mateu routes **by path** (`/products`), not by hash (`#/products`).
  Bookmarks with a hash keep working in the statically served VB app only.

## A quick upgrade checklist

1. Rename the Mateu artifacts in your poms (`mvc-core` → `mateu-mvc`…, table above), bump
   `mateu.version` to the latest release and rebuild — fix the compile errors with the tables above
   (most are a rename).
2. Move any `@Route`-annotated inner screen into `routes.yaml` (or a `RouteEntrySupplier`).
3. Click through each listing: search box present where you want it, layout as expected, Delete
   where it should be.
4. Check forms with enums (labels) and rich text (stored format).
5. Read the beta release notes for the security defaults (CORS, MCP) — and if any screen uses
   `@EyesOnly` / `@ReadOnlyUnless` / `@DisabledUnless` / `access:`, configure your framework's
   security (Mateu reads the principal it authenticates), or that UI is hidden for everyone.

## Related

- [Stability & versioning](/reference/stability-and-versioning/) — what is public API from the beta on.
- [CHANGELOG](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md)
