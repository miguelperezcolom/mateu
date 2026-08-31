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

An annotation says "this class lives at this path". That is the one-to-one case, and it is all most
screens need — `@UI`/`@Route` keep working untouched, and without a `routes.yaml` nothing changes.

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
| `definition` | The layout file, relative to `specs/ui/` (a leading `/` addresses the classpath root). Optional — omit it and the view model supplies its own tree. |
| `viewModel` | Fully qualified name of the server class. **Optional**: a statically deployed route has no server behind it. |
| `fixedParams` | Pinned. **Not overridable by the request.** |
| `defaultParams` | Seeded. The request may override them. |

### Routes are relative to the mount

An entry `orders/:id` under a mount at `/back-office` answers `/back-office/orders/42`. Two
federated domains can therefore each have their own `orders` screen without colliding: uniqueness
only has to hold *within* a mount, and between mount base paths (two `@UI` classes claiming the same
base path already fail at startup).

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

Two producers feed one table: the annotation processors emit an entry for every `@UI`/`@Route` class
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
