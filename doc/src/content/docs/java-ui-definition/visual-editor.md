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
| **Project** | `Project` | The project's settings — the renderer, chosen once ([project settings](/java-ui-definition/project-settings)). | `project` (form) |

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
the header switches (theme toggle, command center, chromeless, access keys), and a menu tree where
you add links, groups, separators and **actions**.

- **Actions** — the shell's [flows](/java-ui-definition/yaml-app-shell/#flows-on-the-shell): add an
  action, give it an id and build its steps (Navigate, Emit, Close overlay, Run action, Mark
  clean/dirty) with the same flow editor a page's actions use. They are written to the shell's
  `actions:` and round-trip losslessly.
- **Action menu items** — a menu entry that runs an action instead of navigating (a `RuleLink` with a
  `RunAction` rule). Its action id is picked from the actions the shell declares; you can still type
  any other id, which then runs an `@Action` on the server.
- **Widgets** — the components drawn in the shell header (`widgets:`): add, remove and reorder them.
  Widgets the editor does not know how to edit are kept untouched.

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

#### Selecting components

The canvas, **Layers** and **Properties** always show the same selection.

- **Click anything painted on the canvas** and the innermost component under the pointer is
  selected: a hero, a button inside the hero, a dashboard panel, the text inside that panel, a
  metric card, a card's title, a tab, a foldout panel. **Layers** opens the groups above it,
  highlights its row and scrolls it into view. **Properties** shows it.
- **The canvas is a design surface.** A click on a button, a link, a checkbox or an input selects
  it. It does not run the action, follow the link, toggle the box or focus the field. One control
  still works: a tab header shows its tab, so the other tab's contents can be seen and selected.
- **Click a row in Layers** to outline the component on the canvas and scroll it into view. A
  component inside a tab that is not showing brings its tab forward. A component inside a folded
  foldout panel unfolds it.
- **`Esc`** selects the parent. On the page root, `Esc` clears the selection. A click on the canvas
  around the page selects the page root.
- **The outline stays on its component.** It moves with the component after you edit a property,
  undo, change the canvas width, scroll, switch between the Vaadin and Redwood canvases, or when the
  file changes on disk. If the component no longer exists, the selection is cleared.

Grid columns and listing filters are selected from **Layers**. Their `id` is the field they bind,
so the canvas cannot mark them. A layout whose children fill it completely, such as a dashboard
grid, has no spot of its own to click. Click one of its children, then press `Esc`.

#### Images

A property that holds an image has an image picker in **Properties**: a hero's `image`, an
`Image`'s `src`, an avatar, an offer card's picture, the app shell's `logo` and `favicon`. The rule
is the property name (`image`, `src`, `avatar`, `logo`, `favicon`, or any name ending in `Image` or
`ImageUrl`) or an image media type in the schema. Only text properties count, so a form's `avatar`
component is not one.

- **Type anything.** A URL, a path or a data URI is kept as you write it.
- **▦ opens the project's images** as a grid of thumbnails, with a filter when there are many. Click
  one to set the property to the URL the app serves it at: `src/main/resources/static/img/hero.jpg`
  becomes `/img/hero.jpg`.
- **Add image to project…** opens a file chooser, copies the file into the project and selects it.
  The file goes to `images/` under the project's existing web folder. With none, it goes to
  `src/main/resources/static/images/` (Java), `wwwroot/images/` (.NET) or `static/images/`
  (Python). The folder is created if needed, and an existing file is never overwritten.

The images come from the folders the app serves: `src/main/resources/static`, `public` and
`META-INF/resources`, a `public/` folder, `wwwroot` and `static`, in the module of the file you are
editing. Build output (`target`, `build`, `node_modules`, `dist`…) is skipped. The list follows the
project: an image added, changed or deleted shows up in the picker without reopening the editor.

The canvas, the Redwood canvas and **Play** show a project image even when no backend serves it.
The IDE serves the file to the editor, and the page keeps the URL you picked. In a browser with no
IDE, the field is plain text.

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

## The project's renderer

The canvas paints with the **project's renderer**, the one `specs/ui/project.yaml` names
(`renderer: vaadin | redwood`; Vaadin when the project has no descriptor, see
[project settings](/java-ui-definition/project-settings)). The renderer selector in the toolbar
marks the project's choice with **· project**. Picking another renderer there is a **peek** for this
session: the toolbar shows **preview — project: …** next to it, and **↺** goes back. A peek never
changes the file, and Play and Export keep using the project's renderer. To change the project's
renderer, open `project.yaml`. The editor shows it as a small settings form, and choosing a renderer
there rewrites only its `renderer:` line, so comments are kept. You can also use the IDE settings
([IDE tooling](/native/ide-tooling#the-projects-renderer-projectyaml)).

## The Redwood canvas

With `renderer: redwood`, or with the toolbar switched to **Redwood (Oracle)**, the canvas paints
the page with the real Redwood renderer: the
Oracle Visual Builder app that the `io.mateu:redwood` jar ships, running inside the canvas. You see
what a Redwood app shows, at the canvas's width, and the page is still editable:

- **Click** a component in the Redwood canvas to select it. **Layers**, **Properties**, the
  breadcrumb, `⌘Z`, `Delete` and the arrow keys work as they do on the Vaadin canvas.
- **Every edit** repaints the page, like the Vaadin canvas does.
- The canvas is inert. A click selects a button and does not run it, and a field takes no typing.
- Selection and hover are outlined inside the Redwood canvas.

The page comes from the same place as on the Vaadin canvas: your backend's `__preview__` when you
have one, otherwise the expansion in the browser. A YAML-only project with no backend running
therefore previews in Redwood too. The canvas sends the result to the Redwood app, and the app
renders it without asking a server for anything. Its renderer marks each element it paints with the
component it came from, and that is how a click selects the right node. The marks exist only in the
editor; an app in production never carries them.

**Requirements.** Redwood loads Oracle JET, the Spectra components and the Visual Builder runtime from
**Oracle's CDN** (`static.oracle.com`) every time it starts. They are never bundled, see the
renderer's `NOTICE.md`. The Redwood canvas therefore needs that CDN. When a script cannot load, because
you are offline or a proxy or content security policy blocks it, or when the app has not started
after 45 seconds, the canvas shows a notice explaining the problem. **Try again** retries, and you
can switch back to Vaadin and keep working offline. The canvas retries by itself when the browser
comes back online.

**Where it is served from.** The editor's build bundles the Redwood app under `redwood/` next to the
editor, so every host can serve it without a backend:

| Host | The Redwood canvas |
|---|---|
| Browser (`npx vite` in `apps/visual-editor`) | the dev server serves `redwood/` from the `io.mateu:redwood` resources (`MATEU_REDWOOD_STATIC` points it elsewhere) |
| IntelliJ | the plugin's loopback server serves it from the bundled editor |
| VS Code | the extension's loopback server serves it from the bundled editor, and the webview frames it from there |

If the build does not include the Redwood app, the hosts ask the configured backend for it instead.
A backend that depends on `io.mateu:redwood` serves it at its root (`/_index.html`, `/_redwood/`).

**What it does not do yet.** You can drag a component from the palette onto the Redwood canvas, but
it lands at the end of the page. Use the Vaadin canvas or **Layers** to place it exactly. Layout
containers that Redwood does not paint as a box of their own, such as a `FormLayout` shown as the
page's form or the dashboard grid of a dashboard page, are selected from **Layers** or with `Esc`
(parent). A click on the page's empty background selects the page root. Tabs are not switched
inside the Redwood canvas, so a component in another tab is selected from **Layers**. The board's
miniatures stay Vaadin.

## Tidy

While you build a page, its structure drifts. Fields get dropped loose instead of into a form layout,
buttons end up one per line, a move leaves a wrapper around a single component, a layout stays
empty. The **Tidy** tab in the bottom dock lists what it finds, with a count on the tab:

| Rule | What it does |
|---|---|
| Put loose fields in a form layout | 2+ `FormField`s in a row, outside a `FormLayout`, go into one |
| Put stacked buttons in a row | 2+ `Button`s in a row go into a `HorizontalLayout` |
| Remove wrappers around a single component | a layout holding one component is replaced by it |
| Merge a layout into its same-direction parent | a `VerticalLayout` directly in a `VerticalLayout` gives up its children |
| Remove empty layouts | layouts with nothing in them |
| Label fields that have none, from their id | `birthYear` is labelled “Birth year” |
| Fields sharing an id | only reported: two fields with one id edit the same value |

The rules are fixed and no AI is involved, so the same page always tidies the same way. They only
touch layouts that carry nothing but their children: a layout with its own spacing, padding, style
or id is your decision and stays. Click a finding to select it, untick the rules you do not want and
**Apply**. The whole tidy is one edit, so `⌘Z` undoes it.

## Design notes, and the view model they become

Any component can carry a **note**: a sentence about what it should do, such as "must be unique
among customers" or "only managers may change it". Select the component and write it in the yellow
**Note** box at the top of **Properties**. In the file it is the `note:` key:

```yaml
- type: FormField
  id: email
  label: Email
  note: Must be unique among customers.
```

A note is never rendered. The schema documents it, and both the server and the browser render
ignore it. On the canvas the selected component shows its note as a sticky, and **Layers** marks
noted components with ✎.

Notes are what turn a drawn page into a working one. A page made of only a definition has a layout
but no behaviour, and the notes say what that behaviour should be. In the **AI** panel, **Copy
view-model prompt** writes a prompt for your coding agent. It asks for the Java class that the layout
binds to: fields for the `FormField` ids and `@Action` methods for the buttons. Each note goes in as
a requirement for its own component, followed by the layout itself and the line that adds the class
to `routes.yaml`. When the page already has a view model, the prompt asks the agent to complete that
class instead. Share links carry the notes too, and the agent guide asks agents to leave notes where
a person asked for behaviour.

## Checking a page at other widths

The width selector in the toolbar shows the page at the size of a **desktop** (1280 px), a
**tablet** (768 px) or a **phone** (390 px), framed on the canvas. **Fill** takes the whole pane.
Mateu screens adapt to the room they are given: form columns collapse, zones stack and listings
narrow, so it is worth a look before a screen ships. Editing works the same at any width. Components
that adapt to their container, such as form layouts and zones, show their real behaviour. Anything
keyed to the browser window's media queries does not, because the editor's window stays wide. Play
mode starts at the same width and has its own selector.

## The board, and playing the app

Next to **Edit** in the toolbar, **Board** shows the whole mount at once: one card per route, each
a real miniature of its screen, and an arrow wherever one screen takes you to another. The arrows
are read from the files, not drawn by hand, so the board cannot go out of date:

| Arrow | Where it comes from |
|---|---|
| menu | the app shell's `RouteLink`s, nested menus included |
| button / link | a `RouteLink` in a page, such as a button's `actionable` |
| row click | a listing's `rowRoute` (`people/${row.id}` lands on `people/:id`) |
| after save | a REST action's `successRoute` |
| flow step | a `Navigate` step of a declared flow |
| nested route | a route's `children` |

The board flags links whose route does not exist. Pages that no route serves get a dashed card. Each
resource is laid out as a row: the listing, then its record and create form, then the edit form.
Drag the background to pan and scroll to zoom. Drag a card by its header to move it; the board
remembers the arrangement for each mount, and **Auto layout** starts it again. Click a card to label
its arrows. **Edit** opens that card's file: in place in a browser, or in its own tab in IntelliJ
and VS Code.

**▶ Play** runs the mount from the files as you have edited them, so you can click through it like
the app. The menu (including menu entries that run a shell flow), row clicks, buttons and save landings take you where the app would, and a small
address bar with back and forward follows along. A mount that is only YAML needs no backend: play
expands each screen in the browser, the same way a statically deployed bundle does. A route served
by a view model goes to the preview backend, if you have one. The width selector shows the app on a
tablet or a phone, starting at the canvas's width.

Play always runs in the **project's renderer** (a badge in its bar names it), whatever the canvas
is peeking at. With `renderer: redwood` the whole mount runs in the real Redwood app, framed like
the Redwood canvas but live. Its menu navigates, rows and links open their screens, and Play's
address bar, back and forward move it. The editor is that app's backend. Every call the app makes
comes to the editor, which answers it from the files as you have edited them, using the same
in-browser expansion Play uses for Vaadin. A shell boots as the app shell, and a route loads its
screen. An action that needs a server goes to the preview backend, and with no backend it shows a
toast saying so. Like the Redwood canvas, it needs Oracle's CDN. Play starts on the screen you are editing; a card's **Play** starts on that card.
**Close** (or `Esc`) brings you back.

## Recognising components in the palette

The **Insert** tab shows every component as a card with a picture of it. Hover a card to see it
larger. A selector next to the title picks the look: **Vaadin**, **Redwood** or **Names only**. It
starts with the look of the canvas renderer. The pictures are real renders of a small sample of each
component, regenerated from the catalog: the Vaadin ones by the Vaadin canvas, the Redwood ones by
the [Redwood canvas](#the-redwood-canvas). What you pick is what lands on the canvas. A few
entries have no picture because there is nothing to see on the page: triggers, menu entries, and
embeds that only exist at runtime.

## Share links, and designs from a coding agent

**Share** (toolbar) copies a link that opens the current file in the editor. When the host knows
the whole mount it carries the other files as well. The design travels **inside the link**: it is
compressed into the URL fragment (`#mateuz=…`), which a browser never sends to a server. Nothing is
uploaded, and a statically hosted editor stays static. **Open…** takes a pasted link (or the
bare JSON document) and loads it as an ordinary edit, so `⌘Z` undoes it.

Opening a link in a browser replaces the local draft, and the previous one is kept under
`mateu-visual-editor-yaml.previous`. An IDE editor writes one file, so it loads only the linked file
and tells you when the link carried more.

The same link is how a **coding agent** hands you a screen. In the **AI** panel, describe the screen
and click **Copy agent instruction**, then paste it into Claude Code, Codex or a similar agent. The
instruction points the agent at the [agent guide](https://raw.githubusercontent.com/miguelperezcolom/mateu/master/frontend/web/monorepo/apps/visual-editor/public/agent.md),
which explains the document format, points at the published schemas and gives a Node/Python
one-liner that builds the link. The agent answers with a link on *your* editor; open it with
**Open…**. This is the reverse of the scaffold prompt above it, and just as tool-agnostic:
no API key, nothing in between.

A link opens the editor at the page's own address. To point links at a hosted editor instead, set
`window.__mateuEditorUrl` before the bundle loads.

## Permissions, translations and environments

- **Access rules.** The properties panel of a component has a small editor for `eyesOnly`,
  `readOnlyUnless` and `disabledUnless` (roles, groups, scopes, permissions); the app editor's menu
  items and the routes editor carry the same editor for `access`. See
  [Permissions in YAML](/java-ui-definition/yaml-security/). Play has no identity, so it shows
  everything.
- **Translation keys.** Label fields offer the project's translation keys (`${i18n.…}`) in their
  combo, read from the translation files; you can still type any text. **▶ Play** has a locale
  switcher that renders the app in each language your files declare. See
  [Translations in YAML](/java-ui-definition/yaml-i18n/).
- **Environments.** Environment files are plain YAML: open them in the text editor, validated by
  the `type: Environment` branch of the schema. See [Environments](/java-ui-definition/environments/).
- **New › Mateu** in IntelliJ and VS Code creates an empty *Translations* or *Environment* file.

## Field types and sample data

Two files make a mount designable with **no backend and no API**:

- **`types.yaml`** (`type: Types`) — the [field types](/java-ui-definition/field-types/), the domain
  vocabulary. It opens in a YAML editor checked against `types-schema.json` (unknown keys, data
  types, stereotypes, tones, duplicate ids) with a summary of the types it declares. On a page, a
  `FormField` or `GridColumn` picks its **`fieldType`** from a list of the catalogue's ids (or you type
  one); the canvas and Play paint the field with the type's attributes, its own ones winning.
- **`sources.yaml`** — each source has a **Sample data** box (JSON or YAML: the response the endpoint
  would return) and a **sample file** field. The editor is a design session, so its canvas and Play
  always answer sources from their samples: a listing shows the sample rows (searched, sorted and
  paged in the browser), a select its options, a save succeeds without persisting. At runtime the
  samples are only used when the app opts in — see
  [sample data](/java-ui-definition/rest-source-catalogue/#sample-data-designing-without-an-api).

New › Mateu › **Field Types** (IntelliJ and VS Code) creates an empty catalogue.

## Project awareness — the roadmap

Everything above works today; what is still landing is the **"pick, don't type"** half of each
reference. The editors are currently **single-file** — each one edits the file it was opened on and
does not yet know what sibling files the mount contains — so a reference is authored as a string. The
project-awareness work gives the editor a view of the whole mount so it can offer the pickers this
manual describes and validate that a reference resolves.

## See also

- [Route registry](/java-ui-definition/route-registry/) — the routing model the routes file authors.
- [App shell as data](/java-ui-definition/yaml-app-shell/) — the chrome the app file authors.
- [Partials](/java-ui-definition/partials/) — reusable fragments.
- [YAML UI definition](/java-ui-definition/yaml-ui-definition/) — the component-tree YAML a page is.
- [Permissions in YAML](/java-ui-definition/yaml-security/), [Translations in YAML](/java-ui-definition/yaml-i18n/), [Environments](/java-ui-definition/environments/).
