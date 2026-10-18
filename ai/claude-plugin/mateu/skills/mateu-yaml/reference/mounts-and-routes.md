# Mounts and routes

## The mount (`type: UI`) — the data twin of `@UI`

```yaml
# specs/ui/app.ui.yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: UI
basePath: /          # where the app is served
home: home           # optional: the route the mount opens on (relative, as in routes.yaml)
routes:              # the route files of this mount (merged, last wins)
  - routes.yaml
```

- Mounts are discovered by scanning `specs/ui/**` for `type: UI` **by content**, so several mounts
  can coexist (each with its own `basePath` and route files).
- No `type: UI` file at all → the conventional single mount: `specs/ui/routes.yaml` at `""`.
- `home:` — without an app shell, the mount root renders that route (unless a `route: ""` is
  authored, which always wins); with a shell bound to `""`, it becomes the shell's default
  `homeRoute`. An unknown home is warned about at startup and ignored.
- Spring MVC (`mateu-mvc`) serves a `type: UI` mount with no annotation processor and no Java
  class; mounts are served next to any `@UI` classes on every Java adapter. The .NET/Python servers
  read the same files from `specs/ui/` under the working directory (`MATEU_SPECS_DIR`).

## The route file (`type: Routes`)

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Routes
routes:
  - route: ""                    # mount root → the app shell
    layout: app.yaml
  - route: orders
    layout: orders.yaml
  - route: orders/new            # BEFORE orders/:id, or "new" is read as an id
    layout: order-new.yaml
  - route: orders/:id            # :name = path parameter → state.id
    layout: order.yaml
    data: order                  # a sources.yaml name: fetched on load, merged into the page state
  - route: orders/pending        # one screen, two routes, told apart by a PINNED parameter
    layout: orders.yaml
    fixedParams: {status: pending}
  - route: archive
    layout: orders.yaml
    defaultParams: {status: archived, page: 1}   # seeded; the request may override
```

| Key | Meaning |
|---|---|
| `route` | path relative to the mount; `:name` segments are path params; `""` = mount root |
| `layout` | definition file, relative to `specs/ui/` (leading `/` = classpath root). `definition:` is a deprecated alias |
| `viewModel` | server class that supplies state + actions (Java FQCN, .NET full type name, Python `module.Class`). Optional |
| `fixedParams` | pinned, re-applied server-side over everything the client sends |
| `defaultParams` | seeded at the lowest precedence |
| `children` | sub-routes rendered in this screen's slot (`route` relative to the parent); `defaultChild`, `show` (feature flag) |
| `state` / `appState` | literal seeds of the component / app state |
| `data` / `appData` | a source **name** (or inline source) fetched on load; `appData` once per app |
| `access` | `{roles, groups, scopes, permissions}` — anybody else gets 403 here and below; menu links hidden |

- Parameter precedence (server, browser and static bundle alike): `fixed > client state > path >
  query > defaults`.
- **Convention without an entry**: a request for route `a/b` with no entry and no class loads
  `specs/ui/a/b.yaml` if it exists. An explicit entry is clearer and lets one layout serve many
  routes — prefer entries.
- A route file for a class-declared mount (`@UI("/shop")`) carries `basePath: /shop` and its routes
  are relative to it.
- Malformed `routes.yaml` → logged and ignored; an entry naming a missing class → logged, falls
  through.
- A `fixedParam` is a routing constraint, not authorisation; use `access:` (enforced server-side).

## Link targets

Menu entries, `RouteLink` actionables, `rowRoute`, `successRoute` and `Navigate` steps all take
**mount-relative** routes (`orders/${row.id}`), the same spelling as `routes.yaml`.
