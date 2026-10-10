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
| `@Route`, `@Routes`, `@HomeRoute` | `@UI` is the only routing annotation and declares a **mount**. Screens inside a mount are declared in [`routes.yaml`](/java-ui-definition/route-registry/) or supplied in code by a `RouteEntrySupplier` bean. The home route is the app's first menu item, or what `HomeRouteSupplier` returns. See [Route annotations](/java-ui-definition/annotations/route/) for the step-by-step. |
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
| Renderers: SAP UI5, Oracle JET (`redwood-oj`), PatternFly (`redhat`), Salesforce Lightning (`slds`); the JavaFX and Compose native renderers | Web: `vaadin-lit` or `redwood` (Oracle Visual Builder). Native: React Native and the IntelliJ plugin. Your UI code does not change — swap the renderer dependency. |

All the annotations in the rows above had **no effect** in any alpha — nothing read them — so
removing one changes no screen; it only makes the compiler point at it.

## Defaults that changed

These compile unchanged and **behave differently**. Check each against your screens.

| Area | Before | Now | To get the old behaviour |
|---|---|---|---|
| Enum labels | the raw constant (`OUT_OF_STOCK`) | the name humanized ("Out of stock") | label each constant explicitly (`@Label`) |
| Rich text (`@Stereotype(richText)`) | the value was Quill Delta JSON | the value is **HTML** | values stored by the old editor still open and are saved as HTML on the next edit — migrate stored data if other systems read it |
| `GridLayout.auto` | chose table / list / cards / master-detail from the available width | always a **table** | declare `gridLayout()` explicitly (`cards`, `list`, `masterDetail`) |
| Listing search box | always shown | shown only if the listing implements `Searchable` | add `Searchable` to the listing (`AutoCrud` and `Crud` already have it) |
| Listings without interaction capabilities | opened empty | **search on opening** (`Listing.searchesOnOpening()` defaults to `true`) | override `searchesOnOpening()` to return `false` |
| `@Section(columns = …)` | default `1`, and an explicit `1` was ignored | default `0` = inherit from `@FormLayout`; an explicit `columns = 1` is honoured | remove an explicit `columns = 1` you did not mean |
| CORS | the generated controllers carried `@CrossOrigin` (any origin; Micronaut also with credentials) | **off**: same-origin only | set `mateu.cors.allowed-origins` (comma-separated; optionally `mateu.cors.allow-credentials=true`, never with `*`) — Python: `add_mateu(app, cors_origins=[...])` |
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
- The Redwood renderer serves Mateu routes **by path** (`/products`), not by hash (`#/products`).
  Bookmarks with a hash keep working in the statically served VB app only.

## A quick upgrade checklist

1. Bump `mateu.version` to the latest release and rebuild — fix the compile errors with the tables
   above (most are a rename).
2. Move any `@Route`-annotated inner screen into `routes.yaml` (or a `RouteEntrySupplier`).
3. Click through each listing: search box present where you want it, layout as expected, Delete
   where it should be.
4. Check forms with enums (labels) and rich text (stored format).
5. Read the beta release notes for the security defaults (CORS, MCP).

## Related

- [Stability & versioning](/reference/stability-and-versioning/) — what is public API from the beta on.
- [CHANGELOG](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md)
