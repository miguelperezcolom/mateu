---
title: "App shell as data (app:)"
description: "Declare a mount's chrome — title, menu, variant, widgets — in the app: block of routes.yaml, the data-driven counterpart of an @App class."
---

**Status:** ✅ Implemented (Java server; Spring MVC auto-configures the HTTP surface)

A **mount** is a UI application served at a base path. `@UI("/back-office")` declares one, and the
annotated class carries the chrome around it: title, logo, menu, variant.

The `app:` block of [`specs/ui/routes.yaml`](/java-ui-definition/route-registry/) declares that same
chrome **as data**. The chrome lives in the same file as the routes it wraps because both are
properties of the same mount — `routes:` says what is inside, `app:` says what surrounds it.

```yaml
app:
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

routes:
  - route: orders
    definition: orders.yaml
  - route: users
    definition: users.yaml
```

With those two blocks and the page definitions they point at, the mount needs **no Mateu Java at
all** — see `demo/demo-app-definition` (port 8099), whose only Java file is the Spring Boot entry
point.

## What the block accepts

| Key | Meaning |
|---|---|
| `title`, `subtitle`, `pageTitle` | header texts |
| `logo`, `favicon` | assets |
| `variant` | `AppVariant` — `AUTO`, `MENU_ON_TOP`, `HAMBURGUER_MENU`, `TABS`, `TILES` |
| `layout` | `AppLayout` — `SINGLE_SLOT` (default) or `SPLIT` |
| `drawerClosed` | start with the drawer collapsed |
| `style`, `cssClasses` | styling hooks |
| `route` | the mount's own route |
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

## Serving it

For **Spring MVC**, `mvc-core` auto-configures the HTTP surface (the SPA at `/` and sync at
`/mateu/v3/**`) when the classpath has a `specs/ui/routes.yaml` **with an `app:` block** — the work
the annotation processor normally does per `@UI` class, which cannot happen when there is no class.
It stands down as soon as a generated controller exists, so adding an `@UI` class later changes
nothing.

Your application is then a Spring Boot entry point plus resources:

```text
src/main/
├── java/…/AppDefinitionDemoApplication.java   ← @SpringBootApplication, nothing else
└── resources/specs/ui/
    ├── routes.yaml        ← app: + routes:
    ├── orders.yaml
    └── users.yaml
```

## The visual editor edits this

Open `routes.yaml` in the visual editor and it presents the mount as two tabs: **Routes**, a table
over the route registry, and **App**, a form over this block with a link/group/separator menu tree.
Each tab preserves the other's block verbatim, so editing one never rewrites the other.

## Limits

Not carried by the block yet — these are read reflectively off an `@App` class and still need one:
theme toggle, command center / chromeless, SSE / MCP / upload URLs, `@AppContext` selectors,
notifications, global search and FABs.

A broken or unparseable descriptor never takes the application down: it is treated as "no app
block", exactly like the route registry.

## Next

- [Route registry](/java-ui-definition/route-registry/) — the `routes:` half of the same file
- [YAML UI definition](/java-ui-definition/yaml-ui-definition/) — the page definitions it points at
- [The model](/mateu-about/the-model/) — how this fits with the annotated half
