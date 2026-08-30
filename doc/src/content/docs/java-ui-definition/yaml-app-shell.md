---
title: "App shell as data (type: AppShell)"
description: "Declare a mount's chrome — title, menu, variant, widgets — as a type: AppShell definition bound to a route, the data-driven counterpart of an @App class."
---

**Status:** ✅ Implemented (Java server; Spring MVC auto-configures the HTTP surface)

A **mount** is a UI application served at a base path. `@UI("/back-office")` declares one, and the
annotated class carries the chrome around it: title, logo, menu, variant.

A data-driven mount declares that same chrome **as data**, in its own file discriminated by
`type: AppShell`. The app shell is a **view like any other** — a definition bound to a route in the
mount's [route registry](/java-ui-definition/route-registry/), typically the root route `""`. There
is no longer an `app:` block inside `routes.yaml`: `routes:` says what is inside the mount, the app
shell says what surrounds it, and each is its own file.

```yaml
# specs/ui/app.yaml
type: AppShell
title: Back office
subtitle: Authored entirely in YAML
variant: MENU_ON_TOP
menu:
  - type: RouteLink
    label: Orders
    route: orders
    icon: vaadin:cart
  - type: RouteLink
    label: Users
    route: users
    icon: vaadin:users
```

The route registry binds that definition to the mount's root:

```yaml
# specs/ui/routes.yaml
type: Routes
routes:
  - route: ""              # the mount root → the app shell view
    definition: app.yaml
  - route: orders
    definition: orders.yaml
  - route: users
    definition: users.yaml
```

With the shell, the routes and the page definitions they point at, the mount needs **no Mateu Java at
all** — see `demo/demo-app-definition` (port 8099), whose only Java file is the Spring Boot entry
point.

## What the definition accepts

| Key | Meaning |
|---|---|
| `type` | `AppShell` — the discriminator that makes this file an app shell |
| `title`, `subtitle`, `pageTitle` | header texts |
| `logo`, `favicon` | assets |
| `variant` | `AppVariant` — `AUTO`, `MENU_ON_TOP`, `HAMBURGUER_MENU`, `TABS`, `TILES` |
| `layout` | `AppLayout` — `SINGLE_SLOT` (default) or `SPLIT` |
| `drawerClosed` | start with the drawer collapsed |
| `style`, `cssClasses` | styling hooks |
| `menu` | a list of navigation items |
| `widgets` | a list of components rendered in the header |
| `homeRoute` | what the mount loads at its root |

`menu:` and `widgets:` deserialize through the **same `type:` discriminator as page layouts**, so
every navigation type (`RouteLink`, `Menu`, `RemoteMenu`, …) and every component of the catalog is
available with no extra wiring, and the same [JSON Schema IntelliSense](/java-ui-definition/yaml-ui-definition/#intellisense-setup)
applies while you edit.

### `homeRoute` matters

A YAML mount has no class to carry `@HomeRoute`, so the home defaults to the **first navigable menu
item**. Declare `homeRoute:` explicitly to point somewhere else. Do not leave a mount with neither:
the shell would load its own root route, which is the shell again.

## The mount that ties it together

The app shell, the routes and the pages are files of one **mount**, declared by a `type: UI` file —
the data-driven `@UI`. It carries the base path and lists the route files that make up the mount:

```yaml
# specs/ui/back-office.ui.yaml
type: UI
basePath: /
routes:
  - routes.yaml
```

Mounts are found by scanning the classpath under `specs/ui/**` for `type: UI` files (by content, not
by filename), so several UIs can coexist. When there is **no** `type: UI` file at all, the
conventional single mount is used: `specs/ui/routes.yaml` loaded at base path `""`.

## Serving it

For **Spring MVC**, `mvc-core` auto-configures the HTTP surface (the SPA at the mount's base path and
sync under it) when the classpath declares at least one `type: UI` mount — the work the annotation
processor normally does per `@UI` class, which cannot happen when there is no class. It stands down as
soon as a generated controller exists, so adding an `@UI` class later changes nothing.

Your application is then a Spring Boot entry point plus resources:

```text
src/main/
├── java/…/AppDefinitionDemoApplication.java   ← @SpringBootApplication, nothing else
└── resources/specs/ui/
    ├── back-office.ui.yaml   ← the mount (type: UI): base path + route files
    ├── app.yaml              ← the app shell (type: AppShell)
    ├── routes.yaml           ← the route registry (type: Routes)
    ├── orders.yaml           ← page definitions
    └── users.yaml
```

## The visual editor edits this

Open any of these files in the [visual editor](/java-ui-definition/visual-editor/) and it picks the
mode from the file's `type:`: `app.yaml` opens the **app** form (title, chrome and a
link/group/separator menu tree), `routes.yaml` opens the **routes** table, and the `type: UI` file
opens the **mount** form. Each file is authored on its own — editing the shell never rewrites the
routes.

## Limits

Not carried by the definition yet — these are read reflectively off an `@App` class and still need
one: theme toggle, command center / chromeless, SSE / MCP / upload URLs, `@AppContext` selectors,
notifications, global search and FABs.

A broken or unparseable definition never takes the application down: a route pointing at a file that
is not a `type: AppShell` definition simply resolves to no shell, exactly like the route registry
ignoring a malformed entry.

## Next

- [Route registry](/java-ui-definition/route-registry/) — the `routes:` file that binds the shell to a route
- [Authoring with the visual editor](/java-ui-definition/visual-editor/) — building all of this by hand
- [YAML UI definition](/java-ui-definition/yaml-ui-definition/) — the page definitions it points at
- [The model](/mateu-about/the-model/) — how this fits with the annotated half
