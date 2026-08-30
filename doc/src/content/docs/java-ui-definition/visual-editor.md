---
title: "Authoring a UI with the visual editor"
description: "Build a data-driven Mateu UI by hand — mounts, app shells, routes, pages and partials — in the cross-IDE visual editor, wiring the files to each other as you go."
---

The **visual editor** is a web-based authoring tool for a **data-driven mount**: a whole Mateu UI
defined as YAML files, with no `@UI` Java class. It runs as the same web bundle in three hosts — a
standalone browser, an **IntelliJ** tab (embedded via JCEF), and a **VSCode** custom editor — so the
experience is identical wherever you author. Behaviour and data stay in Java view models; the editor
edits the **shape** of the UI: its files and how they reference each other.

:::note[Reference pickers]
When the editor can see the whole mount (the IntelliJ and VSCode hosts enumerate `specs/ui/**`
automatically), every cross-file reference is a **picker** — chosen from a list of what exists, while
still accepting a typed value: the route a menu links to, the page a route serves, the partial a page
inlines, and a page field or action bound to its data source's members. Each step below also shows the
exact string, so you can always author by hand.
:::

## The four kinds of file

A mount is a folder of YAML files under `src/main/resources/specs/ui/`. Each file is discriminated by
an explicit `type:` at its root, and the editor opens it in the matching mode:

| File | `type:` | What it declares | Editor mode |
| --- | --- | --- | --- |
| **Mount** | `UI` | A base path and the route files it serves — the data-driven `@UI`. | `mount` (form) |
| **App shell** | `AppShell` | The chrome around the mount: title, variant, logo, **menu**. | `app` (form) |
| **Routes** | `Routes` | Pure routing: each URL bound to a **definition** and an optional **view model**. | `routes` (table) |
| **Page** | any component (e.g. `VerticalLayout`) | A component tree — the layout of one screen. | `page` (WYSIWYG canvas) |
| **Partial** | a bare `content:` list | A reusable, rootless fragment inlined wherever a page names it. | `page` (canvas, "partial" chip) |

The editor picks the mode automatically from the file's `type:` — there are no tabs to switch. A
`type: UI` file opens the mount form; `type: AppShell` opens the app form; a routes file opens the
route table; anything else is a page (or partial) on the canvas.

## The reference graph, and why it matters

The four kinds of file are not independent — they **point at each other**, and that graph is the
whole authoring model:

```
   app ──references routes──►  routes
    ▲   (menu: each link          │
    │    names a route)           ├──references pages──►  page ──► partial   (Partial ref)
    └──root route: AppShell───────┘   (definition)          │
                                                            └──► data source (view model / REST source)
```

- **App → routes.** Each menu item links to a **route** by name.
- **Routes → pages.** Each route's `definition` names a **page** file; its optional `viewModel` names
  the **data source** behind that page. The mount's root route (`""`) names the **app shell**.
- **Pages → partials and data sources.** A page inlines a **partial** by `ref`, and its fields bind
  (by convention: `FormField id` ↔ property) to the **data source** the route paired it with.

Because these references form a closed graph, the ideal editor lets you **pick** each one from what
already exists in the project: add a menu link and choose the route from a dropdown; add a route and
choose its page from the pages you have; drop a `Partial` and pick which partial; bind a field and
pick it from the data source's contract. That "pick, don't type" experience is what
[project awareness](#project-awareness-the-roadmap) delivers.

## Set up

The editor needs a running Mateu backend — any Mateu app exposes the reserved `__preview__` (live
render) and `__contract__` (data-source shape) actions the editor calls. The reference mount is
`demo/demo-app-definition` on port **8099**; run it with `mvn -o spring-boot:run` from that module.

Then open the editor in your host of choice:

- **IntelliJ** — open the project, open a `specs/ui/*.yaml` file, and switch to the **Visual Editor**
  tab. Set the backend URL for the run.
- **VSCode** — open the folder, open a `specs/ui/*.yaml` file, and choose **Reopen Editor With… →
  Mateu Visual Editor**. Configure `mateu.baseUrl` (default `http://localhost:8594`).
- **Browser (dev)** — from `frontend/web/monorepo/apps/visual-editor`, run
  `MATEU_BACKEND=http://localhost:8099 npx vite` and open `http://localhost:5199`.

## The authoring journey

Below is the end-to-end flow for the reference mount. The files all live in `specs/ui/`.

### 1. The mount — `back-office.ui.yaml`

The mount is the entry point: a base path and the list of route files it serves.

```yaml
type: UI
basePath: /
routes:
  - routes.yaml
```

In the **mount** editor you set the base path and manage the list of route files (add, reorder,
remove). On a route collision across several files, the last file wins.

### 2. The app shell — `app.yaml`

The app shell is the chrome around every screen: title, variant, and the navigation **menu**.

```yaml
type: AppShell
title: Back office
subtitle: Authored entirely in YAML
variant: MENU_ON_TOP
menu:
  - type: RouteLink
    label: Orders
    route: orders      # ← references a route
    icon: vaadin:cart
  - type: RouteLink
    label: Users
    route: users       # ← references a route
    icon: vaadin:users
```

The **app** editor is a form: title/subtitle/logo/home-route text, the `variant`/`layout` dropdowns,
and a menu tree where you add links, groups and separators.

Each `RouteLink` names a **route** in the `route` field. *Target:* choose the route from a dropdown of
the routes declared in this mount. *Today:* type the route name (e.g. `orders`) — it must match a
`route:` in the routes file.

### 3. The routes — `routes.yaml`

The route registry is pure routing: each URL is bound to a page **definition** and, optionally, a
**view model** (its data source). The root route names the app shell.

```yaml
type: Routes
routes:
  - route: ""              # the mount root → the app shell view
    definition: app.yaml   # ← references the app shell
  - route: orders
    definition: orders.yaml   # ← references a page
  - route: users
    definition: users.yaml    # ← references a page
  - route: tasks
    viewModel: io.mateu.demo.appdefinition.TaskCrud   # ← references a data source (no page: the model brings its own UI)
  - route: dashboard
    viewModel: io.mateu.demo.appdefinition.SalesDashboard
```

The **routes** editor is a table — one row per route, with columns Route / Definition / View model /
Fixed params / Default params, plus add and delete.

- **Definition** names a **page** file (or the app shell for the root). *Target:* pick from the pages
  in the mount. *Today:* type the file name (e.g. `orders.yaml`).
- **View model** names the **data source** — a Java view model FQN. *Target:* pick from the project's
  view models (and, later, REST sources). *Today:* type the fully-qualified class name.
- A route may bind a definition, a view model, or **both** — a shared page layout served for several
  view models, or a view model with no layout of its own. Fixed and default params pin values into the
  screen (`k=v, k2=v2`).

### 4. A page — `orders.yaml`

A page is a component tree — the layout of one screen, typed at its root. It carries **no** data
source; that lives on the route.

```yaml
type: VerticalLayout
content:
  - type: Text
    text: Orders
    size: xl
  - type: Text
    text: This page is a bare, typed component tree — no Java class behind it.
```

The **page** editor is the WYSIWYG canvas: a searchable **palette** of ~120 components on the left,
the live render in the middle (rendered by the real Mateu renderer via `__preview__`), and a **typed
properties** panel on the right. Drag a component from the palette onto the canvas, click to select,
and edit its props on the right.

Two references start on a page:

- **Partials.** Drop a `Partial` component and set its `ref` to a partial's name. *Target:* pick from
  the partials in the mount. *Today:* type the `ref` (e.g. `address-block`). The backend inlines it,
  so the canvas shows the resolved content.
- **Data sources.** A page's `FormField`s bind by convention (`id` ↔ property) to the **view model**
  the route paired the page with (or a page-level `modelView:`, which wins). With that binding
  resolved, the properties panel offers the model's fields for a `FormField`'s `id` and its actions
  for a `Button`'s `actionId`, both fetched from the model's `__contract__` — so you pick a member
  instead of matching names by hand.

### 5. A partial — `specs/ui/partials/address-block.yaml`

A partial is a reusable fragment: a rootless `content:` list, inlined wherever a page's `Partial ref`
names it.

```yaml
content:
  - type: FormField
    id: street
    label: Street
  - type: FormField
    id: city
    label: City
```

The editor opens a partial on the canvas exactly like a page (it wraps the list in a temporary root
for editing) and marks it with a **"partial"** chip; on save it unwraps back to the bare `content:`
list so the authored shape is preserved. Partials compose — a partial may use another.

## Preview and save

The canvas renders continuously: every edit re-runs `__preview__` and repaints, so what you see is the
real UI, not an approximation. Saving writes the file through the host (IntelliJ/VSCode integrate
their own undo and save; the standalone browser keeps a localStorage draft). For a page bound to a
view model, the editor saves the smallest thing that expresses your change — a **layout delta** when
your edits are a re-ordering/relabelling of the model's fields, a full **snapshot** only when the tree
holds something a delta cannot.

## Project awareness — the roadmap

Everything above works today; what is still landing is the **"pick, don't type"** half of each
reference. The editors are currently **single-file** — each one edits the file it was opened on and
does not yet know what sibling files the mount contains — so a reference is authored as a string. The
project-awareness work gives the editor a view of the whole mount so it can offer the pickers this
manual describes and validate that a reference resolves. The full design, the per-reference gap list
and the host contract it needs live in the design note
`design/visual-editor-project-awareness.md`.

## See also

- [Route registry](/java-ui-definition/route-registry/) — the routing model the routes file authors.
- [App shell as data](/java-ui-definition/yaml-app-shell/) — the chrome the app file authors.
- [Partials](/java-ui-definition/partials/) — reusable fragments.
- [YAML UI definition](/java-ui-definition/yaml-ui-definition/) — the component-tree YAML a page is.
