---
title: "App shell as data (type: AppShell)"
description: "Declare a mount's chrome — title, menu, variant, widgets — as a type: AppShell definition bound to a route, the data-driven counterpart of an @App class."
---

**Status:** ✅ Implemented (Java server; Spring MVC auto-configures the HTTP surface)

A **mount** is a UI application served at a base path. `@UI("/back-office")` declares one, and the
annotated class carries the chrome around it: title, logo, menu, variant.

A data-driven mount declares that same chrome **as data**, in its own file discriminated by
`type: AppShell`. The app shell is a **view like any other** — a definition bound to a route in the
mount's [route registry](/concepts/routes-and-mounts/), typically the root route `""`. There
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
| `variant` | `AppVariant` — `AUTO`, `MENU_ON_TOP`, `HAMBURGER_MENU`, `HAMBURGER_SECTIONS`, `MENU_ON_LEFT`, `RAIL`, `TABS`, `TILES` (see [shell variants](/ux/app-structure/#the-app-shell-and-its-variants)) |
| `layout` | `AppLayout` — `SINGLE_SLOT` (default) or `SPLIT` |
| `drawerClosed` | start with the drawer collapsed |
| `accentColor` | the brand accent, a CSS colour (`"#D2232A"`): the Section dash under section titles, the hero background and the console name — the twin of `@App(accentColor)` |
| `backLink` | `PARENT` draws a single «← Parent» link instead of breadcrumbs (a record master whose tabs are pages) — the twin of `@App(backLink)` |
| `style`, `cssClasses` | styling hooks |
| `menu` | a list of navigation items |
| `widgets` | a list of components rendered in the header |
| `homeRoute` | what the mount loads at its root |
| `actions` | the shell's **flows**: actions with `steps:`, run by a menu leaf — see [Flows on the shell](#flows-on-the-shell) |
| `themeToggle`, `commandCenter`, `chromeless`, `accessKeys` | the header switches — the twins of the same `@App(...)` attributes. Absent: the `@App` class decides (no class: off). `chromeless` implies the command center |
| `contextSelectors` | app context pickers on the header — the twin of `@AppContext` fields: see [Header extras](#header-extras-pickers-actions-inbox-and-search) |
| `headerActions` | header buttons and dropdowns — the twin of `AppActionsSupplier` |
| `notifications` | the notification inbox fed by REST sources — the twin of `NotificationsSupplier` |
| `globalSearch` | the palette's entity search fed by a REST source — the twin of `GlobalSearchSupplier` |
| `mobileQr` | the "Open on mobile" header button (experimental) — the twin of `@App(mobileQr)`; see [Mobile app](/ux-patterns/mobile-app/). Absent: the `@App` class decides (no class: off) |

`menu:` and `widgets:` deserialize through the **same `type:` discriminator as page layouts**, so
every navigation type (`RouteLink`, `Menu`, `RemoteMenu`, …) and every component of the catalog is
available with no extra wiring, and the same [JSON Schema IntelliSense](/define/yaml/pages/#intellisense-setup)
applies while you edit.

## Card menus

A `Menu` group with `presentation: {display: cards}` opens as a panel of **cards** instead of a
plain dropdown. Each entry is a card: its `label` is the title, `description` the text and
`presentation: {icon: …}` or `presentation: {image: …}` the visual. An entry that is itself a `Menu`
is not a destination — its entries become the card's actions:

```yaml
menu:
  - type: Menu
    label: Quick access
    presentation: {display: cards}
    submenu:
      - type: RouteLink
        label: Check-in
        route: check-in
        description: Sign the registration card and scan the ID
        presentation: {icon: "vaadin:clipboard"}
      - type: RouteLink
        label: Floor plan
        route: floor-plan
        description: Rooms coloured by housekeeping status
        presentation: {image: /img/floor.png}
      - type: Menu
        label: Billing
        description: Folios, charges and payments
        presentation: {icon: "vaadin:invoice"}
        submenu:          # the card's actions
          - {type: RouteLink, label: Folio, route: billing}
          - {type: RouteLink, label: New booking, route: bookings/new}
```

The routes of the entries are mount-relative as written: a group adds nothing to them. It works
served and in a `specsOnly` static bundle alike. Where it shows (top bars on Vaadin and Redwood, the
React Native drawer, IntelliJ) and the Java/.NET/Python equivalents:
[Card menus](/ux-patterns/navigation/#card-menus-a-group-that-opens-as-cards).

## Flows on the shell

A menu entry does not have to navigate somewhere: it can **run a flow**. The shell declares its
flows under `actions:` — exactly the shape a [page definition's `actions:`](/define/yaml/pages/)
already has: an `id` plus a list of `steps` (`Navigate`, `Emit`, `CloseOverlay`, `RunAction`,
`MarkClean`, `MarkDirty`). A menu leaf runs one with the existing **rule leaf**: a `RuleLink` whose
single rule is `RunAction` naming the action's id.

```yaml
type: AppShell
title: App
homeRoute: home
actions:
  - id: newOrder
    steps:
      - type: MarkClean
      - type: Navigate
        route: orders/new      # relative to the mount, like every routes.yaml route
menu:
  - type: RouteLink
    label: Home
    route: home
  - type: RuleLink
    label: New order
    rules:
      - action: RunAction
        actionId: newOrder
```

The server lowers each flow to the wire commands it produces and ships them on the App
(`AppDto.actions`); clicking **New order** applies them **in the browser, with no server round-trip**.
That is what makes it work with no backend at all: in a [static bundle](/deploy/static-ui/)
and in the visual editor's **▶ Play** the browser expander emits the same lowered actions. A
`Navigate` to a route of the app stays inside the shell (the same in-app navigation a menu link does);
a full URL (`https://…`) leaves the page.

A `RunAction` rule naming an id the shell does **not** declare is looked up in the
[action catalogue](/concepts/action-catalogue/) — named flows and REST calls declared once
in `specs/ui/actions.yaml` and runnable from the menu and any page. An id the shell declares wins over
the catalogue's, even one without steps. Anything else keeps its old meaning: an app-level action
dispatched to the server (an `@Action` on the app class).

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Built in code, the shell carries flows the same way:

```java
AppShell.builder()
    .title("App")
    .menuItem(new RuleLink("New order",
        List.of(Rule.builder().action(RuleAction.RunAction).actionId("newOrder").build())))
    .action(Action.builder()
        .id("newOrder")
        .steps(List.of(new Step.MarkClean(), new Step.Navigate("orders/new")))
        .build())
    .themeToggle(true)
    .build();
```

## Header extras: pickers, actions, inbox and search

What an `@App` class gets from `@AppContext` fields, `AppActionsSupplier`, `NotificationsSupplier`
and `GlobalSearchSupplier` is authorable on the shell too. Dynamic data comes from the
[REST source catalogue](/concepts/data-sources/) (`sources.yaml`), by reference:

```yaml
type: AppShell
title: Front office
actions:
  - id: newBooking
    steps:
      - {type: Navigate, route: bookings/new}
contextSelectors:
  - fieldName: hotel                 # the app-state key every request carries
    label: Hotel
    options:
      - {value: H1, label: Palma}
      - {value: H2, label: Ibiza}
  - fieldName: company
    optionsSource: {ref: companies}  # itemsPath / valuePath / labelPath of the source
headerActions:
  - {label: New booking, icon: "vaadin:plus", actionId: newBooking}   # a shell flow / catalogue action
  - {label: Reports, route: reports}                                  # navigates in the app
  - label: More
    children:
      - {label: Help, route: help}
notifications:
  source: {ref: inbox}               # GET the inbox
  markRead: {ref: inbox-read}        # optional; ${state.ids}, ${state.id}, ${state.all}
globalSearch:
  source: {ref: search}              # ${state.searchText} in its url/body
```

- **`contextSelectors`** — `fieldName`, `label` (default: the field name, humanized) and either
  static `options` or an `optionsSource`. The picked value is kept by the browser and sent in the
  app state of every request, exactly like an `@AppContext` picker (a Java server reads it with
  `HttpRequest.appContext(fieldName)`). A source is called with `${state.searchText}` (what the user
  typed in the picker), so a large list can be searched server-side.
- **`headerActions`** — `label`, `icon`, and either `route` (in-app navigation, relative to the
  mount like the menu's routes) or `actionId`: one of the shell's `actions:` flows or an
  [action-catalogue](/concepts/action-catalogue/) entry runs **in the browser**, like a menu
  `RuleLink`; any other id is an app-level action dispatched to the server (an `@App` class
  method). `children` makes a dropdown.
- **`notifications`** — `source` lists the inbox; each item (at the source's `itemsPath`, else the
  response itself) is read as `id`, `title`, `text`, `route`, `unread` (absent = unread) and `when`,
  through the catalogue entry's `fields:` map when the endpoint names them differently.
  `markRead` (optional) is called when entries are read, with `${state.ids}` (comma-joined),
  `${state.id}` and `${state.all}`; without it entries are marked read on screen only.
- **`globalSearch`** — `source` is called with `${state.searchText}`; each hit is read as
  `label`, `description`, `route`, `category` (field map honoured). Hits without a route are
  dropped.
- **Where the call runs**: a direct source is fetched by the **browser** — served and in a
  [static bundle](/deploy/static-ui/) alike. A `proxy: true` source is called by the **server**,
  through the reserved app-level action `_appsource`, which only calls a source the shell itself
  declares for that role (the browser names the role, never a url) and injects `${secret.X}`
  server-side. A static bundle has no server, so the bundle's static-safety check reports a proxied
  shell source — and a header action naming neither a route nor a shell/catalogue action — as
  needing one.
- A shell built in code (`AppShell.builder().contextSelector(…).headerAction(…).notifications(…)
  .globalSearch(…)`) carries the same. When the mount also has an `@App` class, its pickers and
  supplier actions are added after the shell's; its `NotificationsSupplier` /
  `GlobalSearchSupplier` keep answering when the shell declares no source of its own.
- **Renderers**: Vaadin and Redwood draw all four. On Redwood the pickers take static options or a
  source (direct or proxied), the header actions navigate on `route`, the bell lists
  `notifications.source` (opening an entry, or *Mark all read*, marks it read on screen at once and
  then through `markRead`) and the Ask palette searches `globalSearch.source` — a direct source
  fetched by the browser, a proxied one through `_appsource`, exactly as on Vaadin. Without a
  source, the inbox and search of an `@App` class (`_notifications-list` / `_globalsearch`) answer
  as before.
- **Ports**: the .NET and Python servers have no `type: AppShell`, so these keys are Java-only
  (their app classes keep `[AppContext]` / `IAppActionsSupplier` / … and `@app_context` / …).

## Header widgets

`widgets:` is a list of components drawn in the shell header — a version tag, a status badge, a
button. Each one is an ordinary component of the catalog (same `type:` discriminator as page
layouts) and travels as a child of the App in the `widgets` slot; on `MENU_ON_TOP` they sit in the
top band, with the menu in the band below next to the title.

```yaml
widgets:
  - type: Text
    text: "v1.0"
```

The server and the browser expander (static bundles, the visual editor's Play) render them alike.

### `homeRoute` matters

A YAML mount has no class to carry `@HomeRoute`, so the home defaults to the **mount's `home:`**
(see [below](#the-mount-that-ties-it-together)) and, when the mount declares none, to the **first
navigable menu item**. Declare `homeRoute:` on the shell to point somewhere else — the shell's own
value always wins. Do not leave a mount with none of them: the shell would load its own root route,
which is the shell again.

:::note[App ≠ its Home Screen]
An **App is a shell** — a menu, title, subtitle, logo and widgets — **plus a reference to a Home
(a Route)**. The App is **not** a Screen. Its content area *mounts the current Route's Screen* (the
Home when the URL is the base path); the App itself only renders the chrome around that content
slot. So the Home is a normal Screen at a route like any other — the App just points at it as the
default. Keeping the two distinct is why the home defaulting is uniform whether the mount is a class
or a YAML file (part of the 5-noun vocabulary — see the [route registry](/concepts/routes-and-mounts/)).

**How it resolves:** when the home route points at a **distinct routed Screen** (a `homeRoute:` or a
first menu item that has its own `@UI`/definition), the App's home fragment is typed with *that
Screen's* class — the content slot loads the home Screen, and the App renders only the chrome. When
the home has no separate Screen (a single-screen app, or a bare menu link with no backing route), the
App remains its own content, unchanged.
:::

## The mount that ties it together

The app shell, the routes and the pages are files of one **mount**, declared by a `type: UI` file —
the data-driven `@UI`. It carries the base path, optionally names its home page, and lists the route
files that make up the mount:

```yaml
# specs/ui/back-office.ui.yaml
type: UI
basePath: /
home: dashboard        # optional: a route of this mount (relative, as in routes.yaml)
routes:
  - routes.yaml
```

`home:` says which page the mount opens on:

- **With an app shell** bound to `""`, the shell's `homeRoute` defaults to it (a `homeRoute:` on the
  shell still wins).
- **Without a shell**, requesting the mount root renders the `home` route — the same definition,
  view model and parameters as if that route were requested — unless a `route: ""` is authored,
  which always wins (explicit beats derived).
- A `home` naming a route the mount does not have is logged as a warning at startup and ignored.

It only applies to `type: UI` mounts; a class-declared `@UI` mount is unaffected. Java, .NET and
Python resolve the root the same way (the ports have no `type: AppShell` definitions, so the shell
default is Java-only).

Mounts are found by scanning the classpath under `specs/ui/**` for `type: UI` files (by content, not
by filename), so several UIs can coexist. When there is **no** `type: UI` file at all, the
conventional single mount is used: `specs/ui/routes.yaml` loaded at base path `""`.

## Serving it

For **Spring MVC**, `mateu-mvc` auto-configures the HTTP surface (the SPA at the mount's base path and
sync under it) when the classpath declares at least one `type: UI` mount — the work the annotation
processor normally does per `@UI` class, which cannot happen when there is no class. Adding an `@UI`
class later changes nothing: the `type: UI` mounts keep being served next to it, on every Java adapter —
only a base path the class itself is mounted at is left to the class.

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

Open any of these files in the [visual editor](/define/yaml/visual-editor/) and it picks the
mode from the file's `type:`: `app.yaml` opens the **app** form (title, chrome and a
link/group/separator/action menu tree — a group's **Display** is *List* or *Cards*, and the entries
of a cards group get a description, an image and, for a card with actions, an icon —, an
**Actions** panel for the shell's flows and a **Widgets** section), `routes.yaml` opens the **routes** table, and the `type: UI` file
opens the **mount** form. Each file is authored on its own — editing the shell never rewrites the
routes.

## Limits

Not carried by the definition yet — these are read reflectively off an `@App` class and still need
one: SSE / MCP / upload URLs and app-level FABs. (The theme toggle, command center, chromeless and
access-keys switches, the context pickers, header actions, inbox and palette search are authorable
on the shell; page-level FABs are authorable on a page's `type: Form` — see
[YAML pages](/define/yaml/pages/#page-header--type-form).)

The .NET and Python servers have no `type: AppShell` definitions, so shell flows do not apply there
(they do carry the [action catalogue](/concepts/action-catalogue/), which a menu leaf of
their app class can run).

Before shell flows landed, a `RuleLink` in a YAML menu did not parse on the server (the schema
advertised it, the YAML mapper did not know it), and the whole shell answered "Not found." — it is
registered now.

A broken or unparseable definition never takes the application down: a route pointing at a file that
is not a `type: AppShell` definition simply resolves to no shell, exactly like the route registry
ignoring a malformed entry.

## Next

- [Route registry](/concepts/routes-and-mounts/) — the `routes:` file that binds the shell to a route
- [Authoring with the visual editor](/define/yaml/visual-editor/) — building all of this by hand
- [YAML UI definition](/define/yaml/pages/) — the page definitions it points at
- [The model](/mateu-about/the-model/) — how this fits with the annotated half
