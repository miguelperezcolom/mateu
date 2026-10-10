---
title: "Route registry (routes.yaml)"
description: Bind a URL to a definition, a view model and its parameters — instead of letting the annotation and the file name decide.
---

**Status:** ✅ Implemented (Java server + static bundle)

A **mount** is a UI application served at a base path — that is what `@UI("/back-office")` declares,
and the annotated class is the mount's root view. Everything inside the mount can be resolved
through its **route registry**: a `routes.yaml` sitting next to the definitions it routes to.

```
src/main/resources/specs/ui/
├── routes.yaml          ← the registry
├── shared-list.yaml     ← definitions
└── about.yaml
```

A fully data-driven mount needs no `@UI` class at all: it is declared by a
[`type: UI`](/java-ui-definition/yaml-app-shell/#the-mount-that-ties-it-together) file (base path +
the route files it serves), and its chrome is a [`type: AppShell`](/java-ui-definition/yaml-app-shell/)
definition bound to the root route. The route registry below is the same either way — it is what binds
URLs to definitions and view models, whether the mount is a class or a file.

## Why a registry and not just annotations

An annotation says "this class lives at this path". That is the one-to-one case, and it is what
`@UI` still does for a **mount**. The inner-route annotations (`@Route`/`@Routes`/`@HomeRoute`) were
removed, so every screen *inside* a mount is a registry entry — even a plain one-to-one route.

A registry entry binds **three independent things**, so each becomes reusable on its own:

| | |
|---|---|
| **definition** | the layout |
| **view model** | the behaviour and data |
| **route entry** | the URL, plus the parameters it seeds or pins |

That unlocks the cases an annotation cannot express:

- **One screen, several routes.** `orders/pending` and `orders/archived` over the same view model,
  told apart by a pinned parameter — instead of two classes or an artificial `:param` in the path.
- **One definition, several view models.** A shared list layout serving books and films.
- **A route with no server class at all** — which is what a
  [statically deployed](/java-user-manual/build/static-bundle/) mount is.

## Which one do I use?

There is **one route table**. `@UI` and `routes.yaml` are two producers that feed it —
they are not two competing routing systems. `@UI` declares the **mount** (the app at its base path,
and the compile-time signal the annotation processor uses to generate the framework controllers);
`routes.yaml` declares the screens **inside** it.

> **An app at a base path → `@UI` (or a `type: UI` file). A screen inside it → `routes.yaml`.**

The registry also expresses what a one-class-one-path annotation never could:

| You want to… | Use | Why the annotation can't |
|---|---|---|
| Publish an app at a base path (`/back-office`) | `@UI` | — (this *is* the one-to-one case) |
| Serve a screen inside the app at a fixed path (`products`) | `routes.yaml` (`route` + `viewModel`) | The inner-route annotation was removed |
| One screen at several URLs, told apart by a pinned parameter (`orders/pending`, `orders/archived`) | `routes.yaml` (`fixedParams`) | An annotation carries one path and no pinned params |
| Seed a screen with overridable defaults (`?status=open&page=1`) | `routes.yaml` (`defaultParams`) | An annotation has nowhere to put seed values |
| One layout serving several view models (books and films over one list) | `routes.yaml` (`definition` + `viewModel`) | An annotation binds a class to a path, not a layout to many classes |
| A route with **no** view model — a bare layout | `routes.yaml` (`definition`, no `viewModel`) | An annotation needs a class to hang off |
| A [data-driven mount](/java-ui-definition/yaml-app-shell/#the-mount-that-ties-it-together) with no `@UI` class | `type: UI` + `routes.yaml` | There is no class to annotate |
| A [statically deployed](/java-user-manual/build/static-bundle/) route (no backend) | `routes.yaml` | Only the authored table ships in the bundle; a class is useless without a server |
| Re-point or rename a route without touching Java | `routes.yaml` (authored wins) | Editing an annotation means recompiling |

### They also compose

Because the authored entry **replaces** the derived one outright, a `routes.yaml` entry for the
mount's root route (`""`) can even re-point what the `@UI` class answers — for instance to bind an
[app shell](/java-ui-definition/yaml-app-shell/) definition.

### Rules of thumb

- **One route file per mount.** For a class-declared `@UI("/shop")` mount, tag the file with
  `basePath: /shop` and author the routes relative to it; a `specs/ui/routes.yaml` with no
  `basePath` serves the root mount.
- **A shared `definition` must not declare `modelView:`** — see
  [The definition is layout only](#the-definition-is-layout-only). Otherwise it can only ever serve
  the class it names, defeating the "one layout, several view models" case.

## The file

```yaml
type: Routes
routes:
  # The root route binds the app shell (a type: AppShell definition).
  - route: ""
    definition: app.yaml

  # Two routes over ONE screen, told apart by a pinned parameter.
  - route: orders/pending
    viewModel: com.acme.Orders
    fixedParams:
      status: pending

  - route: orders/archived
    viewModel: com.acme.Orders
    fixedParams:
      status: archived

  # Seeded, not pinned: the user may change these.
  - route: orders
    viewModel: com.acme.Orders
    defaultParams:
      status: open
      page: 1

  # One definition, two view models. The definition declares NO modelView (see below).
  - route: catalog/books
    definition: shared-list.yaml
    viewModel: com.acme.Books
  - route: catalog/films
    definition: shared-list.yaml
    viewModel: com.acme.Films

  # No view model: a definition plus client-side data. Valid and complete — this is the
  # statically served case, not a degraded one.
  - route: about
    definition: about.yaml
```

| Field | Meaning |
|---|---|
| `route` | Path **relative to the mount**, with `:name` segments for path parameters. `""` is the mount's root view, which typically binds the [app shell](/java-ui-definition/yaml-app-shell/). |
| `layout` | The layout file, relative to `specs/ui/` (a leading `/` addresses the classpath root). Optional — omit it and the view model supplies its own tree. This is the **canonical** key (part of the 5-noun vocabulary); **`definition`** is a deprecated alias kept for backward compatibility (`layout` wins if both are given). |
| `viewModel` | Fully qualified name of the server class. **Optional**: a statically deployed route has no server behind it. |
| `fixedParams` | Pinned. **Not overridable by the request.** |
| `defaultParams` | Seeded. The request may override them. |
| `children` | Sub-routes nested under this one, authored **relative** to it. Each fills this screen's slot — see [Nested routes](#nested-routes-a-sub-route-in-a-parents-slot). |
| `parent` | Set automatically when `children` is flattened: the absolute route of the screen whose slot a sub-route fills. You normally author `children`, not `parent`. |
| `state` | Literal values that seed the **component/route** state on entry — see [What a route carries](#what-a-route-carries). |
| `appState` | Literal values that seed the **app** state on entry (merged under the persisted `@AppContext`). |
| `data` | The route's **component** data, as a **reference** to a named [source](/java-ui-definition/rest-source-catalogue/). Fetched when the route loads. |
| `appData` | The route's **app-scope** data, a reference to a named source, fetched **once** on app boot and shared across routes. |

### What a route carries

Beyond where it goes, a route can carry the four data scopes it will populate on entry — the same
four a menu leaf brings when it navigates here. They split by nature:

- **`state` / `appState` are literals** (there is an inbound channel for state): the route seeds them
  at the *defaults* level, so anything the client sent — including the persisted `@AppContext` in
  `appState` — still wins. `state` is component-scoped and replaced on navigation; `appState` is
  app-scoped and persists.
- **`data` / `appData` are references** into the [REST source catalogue](/java-ui-definition/rest-source-catalogue/)
  — there is no literal data channel, so data is always *sourced*. `data: countries` is shorthand
  for `{ref: countries}`. `data` is fetched at route load (it reuses the `@RestData` load path);
  `appData` is fetched once at app scope.

```yaml
- route: reports
  viewModel: com.acme.Reports
  state:                 # literal, component scope
    tab: summary
  appState:             # literal, app scope (merged under @AppContext)
    theme: dark
  data: report-rows      # a source ref → the route's component data
  appData: kpi-totals    # a source ref → app-scope data, fetched once
```

### Routes are relative to the mount

An entry `orders/:id` under a mount at `/back-office` answers `/back-office/orders/42`. Two
federated domains can therefore each have their own `orders` screen without colliding: uniqueness
only has to hold *within* a mount, and between mount base paths (two `@UI` classes claiming the same
base path already fail at startup).

### The mount's home

A `type: UI` mount can name its home page with `home:` — a route of the mount, relative to it like
every other route (a leading `/` is tolerated):

```yaml
type: UI
basePath: /
home: dashboard
routes:
  - routes.yaml
```

When the mount authors no `route: ""`, its root resolves to the `home` entry — same definition, view
model and pinned/default parameters — so `/` renders the dashboard. An authored `route: ""` always
wins (explicit beats derived); when that root is an [app shell](/java-ui-definition/yaml-app-shell/),
the shell's `homeRoute` defaults to `home` instead (its own `homeRoute:` still wins). A `home` that
names no route of the mount is warned about at startup and ignored. A static bundle ships the same
behaviour: the root alias travels in the route table, and a shell definition shipped raw carries
the home as its `homeRoute`.

### Nested routes (a sub-route in a parent's slot)

Some screens are a *shell with a slot* — a record master with tabs, or a mediator app — where a
sub-route does not replace the page but renders **inside** the parent. Author that with `children`:
each child's `route` is relative to its parent, and it fills the parent's slot instead of taking
over the screen.

```yaml
- route: use-cases/rra
  viewModel: com.acme.RRA          # the shell (its own tabs / slot)
  children:
    - route: orders                # → use-cases/rra/orders, rendered in RRA's slot
      viewModel: com.acme.OrdersPage
    - route: orders/create
      viewModel: com.acme.CreateOrderPage
    - route: inventory/:id         # a detail, still inside the slot
      viewModel: com.acme.ProductDetailPage
```

On load, the loader flattens the tree to absolute routes, and each child carries its parent's route
as `parent`. Children nest to any depth. At runtime a request is resolved as a **route chain**: the
entry answering the path, preceded by its `parent`s. The outermost level not yet on screen renders
first — when it is an app (`@App`, a `@Menu`, an `AppSupplier`) it draws its chrome and renders the
rest of the path in its slot — so a reload, a pasted link or back/forward to a child lands on the
parent with the child inside it, never on the bare child.

| Key | Meaning |
|---|---|
| `defaultChild` | On a route with `children`: the child (relative, e.g. `orders`) that opens when the parent is reached on its own. Default: the first (visible) child. |
| `show` | On a child: a feature flag (`audit`, or `!legacy`) that must be on for it to be offered as a tab. Answered by `FeatureFlags` beans; unknown flags are on. A hidden child keeps answering its URL. |

## Recipe: a record master whose tabs are pages

The pattern of a cloud console's resource page: `/customers/7` is the customer, and its tabs —
`/customers/7/orders`, `/customers/7/addresses`… — are pages with a URL of their own. Each one gets
the customer's id, loads when opened, has its own actions and paging, and survives a reload, a pasted
link and back/forward. Runnable in `demo/demo-vb` (package `mastertabs`, renderer chosen with
`-Dmateu.renderer=vaadin-lit|redwood`).

**1. The routes** — the master with its tabs as `children`:

```yaml
type: Routes
routes:
  - route: customers
    viewModel: com.acme.Customers
  - route: customers/:customerId
    viewModel: com.acme.CustomerMaster
    defaultChild: orders               # /customers/7 opens /customers/7/orders
    children:
      - route: orders
        viewModel: com.acme.CustomerOrders
      - route: addresses
        viewModel: com.acme.CustomerAddresses
      - route: audit
        viewModel: com.acme.CustomerAudit
        show: audit                    # a tab behind a feature flag
```

**2. The master** — an `@App(TABS)` with **no menu of its own**: its tabs are its children,
labelled with each child's `@Title`. `backLink = PARENT` draws «← Customers» (the title of the
nearest screen above) instead of breadcrumbs.

```java
@App(value = AppVariant.TABS, backLink = BackLink.PARENT)
public class CustomerMaster implements TitleSupplier {
  String customerId;                   // from :customerId

  @Override public String title() { return repo.name(customerId); }
}
```

**3. A tab** — any page or crud. It receives the master's path parameters on every request, by
name:

```java
@Title("Orders")
public class CustomerOrders extends AutoCrud<Order> {
  String customerId;                   // from :customerId, on every request
  // store() lists the orders of customerId
}
```

Inside a tab the parent's parameters are the listing's **scope**: a filter named like one of them is
shown as a fixed chip and never written into the query string. The crud's `/new` and `/{id}` are
relative to the tab (`/customers/7/orders/new`), and a new record's field named like a parameter
starts filled in (`customerId = 7`). The tab's own page does not repeat its label as a title.

**4. The way in** — a row of the listing opens the master:

```java
@Title("Customers")
@RowRoute("/customers/${row.id}")
public class Customers extends AutoCrud<Customer> { … }
```

**One page instead of many** — when the tabs are small, keep them on one page: `@Tab(key = …)`
makes an in-page tab a URL (`/customer-overview/7/billing` opens Billing), and `@Subresource`
places sub-listings in the tabs, several stacked in one, with the record as their context:

```java
public class CustomerOverview {
  String customerId;

  @Tab(value = "Details", key = "details") String name;

  @Subresource(tab = "orders", load = Subresource.Load.EAGER)   // fetched with the page, counted on the tab
  OrdersOfCustomer orders;

  @Subresource(tab = "billing", order = 1, help = "Invoices issued to this customer")  // lazy: fetched when opened
  InvoicesOfCustomer invoices;

  @Subresource(tab = "billing", order = 2)
  PaymentsOfCustomer payments;
}
```

A tab bar with a single visible tab is not drawn (the tab keeps its key and URL), and a
sub-resource's title is dropped when it only repeats its tab or the page.

In Redwood a sub-listing is fetched when its tab is on screen (so `EAGER` only changes the count on
the tab) and is drawn as a read-only table with its first page: no paging, toolbar or row actions
yet. Vaadin draws the full listing.

## IntelliSense

The registry ships its own JSON Schema, generated from the `RouteEntry` record so it cannot drift
from what the loader accepts:

```
https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/routes-schema.json
```

Point your editor at it for completion, field validation and tooltips while editing `routes.yaml`.
In VS Code, add to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/routes-schema.json": "**/specs/ui/routes.yaml"
  }
}
```

Or per file, as the first line:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/routes-schema.json
```

The definitions themselves have their own schema — see
[YAML UI Definition](/java-ui-definition/yaml-ui-definition/#intellisense-setup).

## Precedence

Two producers feed one table: the annotation processors emit an entry for every `@UI` class
they index, and `routes.yaml` is merged on top. **The authored entry wins** — the same
*explicit beats derived* rule the layout and page inference already follow. An authored entry
replaces the derived one outright rather than being combined field by field.

Parameters resolve in this order, and it is the same on the server and in a static deployment:

```
fixed  >  client state  >  path  >  query  >  defaults
```

The two ends carry the meaning. **Defaults** only fill what nothing else supplied, so a route can
seed a screen without taking the choice away from the user. **Fixed** parameters are re-applied on
the server over everything, *including the component state the client sends back* — because route
resolution also runs in the browser, and a parameter pinned only there would be a suggestion rather
than a constraint: a query string or a doctored state could widen the scope the route was pinned to.

:::caution
A `fixedParam` is a routing constraint, not an authorisation check. It stops a request from
*silently* landing on a wider scope; it does not decide who may see that scope. Keep your
authorisation where it already lives.
:::

## The definition is layout only

When an entry names a `definition`, that file is loaded instead of the
[`specs/ui/<route>.yaml` convention](/java-ui-definition/yaml-ui-definition/) — which ties a
screen's layout to its URL and is exactly why one definition could not serve two routes.

A definition shared by several routes must **not** declare `modelView:`, or it can only ever serve
the class it names. Leave it out and each entry binds its own:

```yaml
# specs/ui/shared-list.yaml — layout, nothing else
layout:
  type: VerticalLayout
  content:
    - type: Text
      text: "A shared list"
```

A definition that *does* declare `modelView:` keeps it, and it wins over the entry's — so every YAML
page that works today is unaffected.

## Authoring routes in code

The authored half has two producers of its own: the YAML (`routes.yaml` and the `type: UI` mounts),
and **code** — a `RouteEntrySupplier` bean returning `List<RouteEntry>`. It is the programmatic twin
of the [REST source catalogue supplier](/java-ui-definition/rest-source-catalogue/), for routes that
come from configuration, a database, or that differ per environment. A supplied entry expresses the
full model the YAML can — a route binding a definition, a view model and pinned parameters
independently, one definition serving several routes, and a route with **no view model at all**.

```java
@Service
public class TenantRoutes implements RouteEntrySupplier {
  @Override public List<RouteEntry> routes() {
    return List.of(
        RouteEntry.of("orders", "com.acme.Orders"),
        // The case an annotation cannot express: two routes over one screen, each pinning a scope.
        new RouteEntry("orders/pending", null, "com.acme.Orders", Map.of("status", "pending"), Map.of()),
        // A viewModel-less route: a definition plus client-side data.
        new RouteEntry("about", "about.yaml", null, Map.of(), Map.of()));
  }
}
```

**Precedence: `routes.yaml` > code supplier > annotation-derived.** An entry in `routes.yaml` for the
same route still wins — the last-mile override that re-points a deployment without a rebuild — and a
supplied entry replaces an annotation-derived one for the same route outright. Like every server-side
supplier, it builds its entries from what the *server* holds, never from the request.

**Parity.** `RouteEntrySupplier` (Java, a bean), `IRouteEntrySupplier` (.NET) and `RouteEntrySupplier`
(Python) all feed the authored table with the same precedence; the ports discover implementers by
scanning the assemblies/modules rather than a bean container. (Python's `RouteEntry` carries no nested
`children`, so a Python supplier authors flat entries with `parent` set — the same shape the YAML
flattens to.) App shells and their menus are likewise code-authorable — see
[App shells in code](/java-user-manual/build/navigation-and-menus/#app-shells-and-menus-in-code).

## Static deployments

The authored table travels in the [static bundle](/java-user-manual/build/static-bundle/)'s
`manifest.json`, and the renderer resolves routes from it — a statically deployed mount has no server
left to ask what a URL means. Only the authored half is shipped: the derived half is route→class,
and a class is what a bundle with no backend cannot use.

Routes that exist only in `routes.yaml` are exported too — **including entries with no view model**.
There is no client-side YAML renderer and none is needed: a definition that declares no `modelView`
renders as a bare layout through the ordinary sync path, so the exporter pre-renders it like any
other route and a static host serves it with no backend.

## Failure behaviour

- A **missing** `routes.yaml` is the normal case: the registry is empty and everything resolves as
  it did before.
- A **malformed** `routes.yaml` is logged and ignored, leaving the annotation-derived routes intact.
  Losing every route in an app because of a syntax error in an optional file would be worse than the
  problem the file solves.
- An entry naming a **class that is not on the classpath** is logged and falls through to the
  annotation-derived resolution, rather than failing the request.
