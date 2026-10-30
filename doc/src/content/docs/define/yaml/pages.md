---
title: "YAML UI Definition"
---

Mateu can render a page defined entirely in a **YAML file** — no Java class required.

When the framework receives a request for a route that has no matching Java class, it looks for a YAML file in the classpath and uses it to build the component tree automatically.

## How it works

1. A request arrives for route `my-app/my-page`.
2. Mateu finds no Java view model bound to that route (a `@UI` mount or a `routes.yaml` entry).
3. Mateu looks for `specs/ui/my-app/my-page.yaml` in the classpath.
4. If found, it deserializes the file into a component tree and renders it.
5. If not found, Mateu falls back to "Not found".

## File location

Place YAML files under `src/main/resources/specs/ui/`, mirroring the route structure:

| Route | YAML file |
|---|---|
| `hello` | `src/main/resources/specs/ui/hello.yaml` |
| `demo/hello` | `src/main/resources/specs/ui/demo/hello.yaml` |
| `admin/users/list` | `src/main/resources/specs/ui/admin/users/list.yaml` |

:::note
This convention ties a page's layout to its URL, so one definition cannot serve two routes. To name
the file explicitly — and to bind parameters or reuse one layout across several routes — declare the
route in a [`routes.yaml` registry](/concepts/routes-and-mounts/) instead. The convention
stays as the default when no entry mentions the route.
:::

## File format

Every YAML file must have a root `type` field that names the component to render. All nested components also need a `type`.

```yaml
type: VerticalLayout
spacing: true
padding: true
content:
  - type: Text
    text: "Hello from YAML!"
    container: h1
  - type: Text
    text: "This page was defined in a YAML file, without any Java class."
  - type: HorizontalLayout
    spacing: true
    content:
      - type: Button
        label: "Save"
        actionId: save
        buttonStyle: primary
      - type: Button
        label: "Cancel"
        actionId: cancel
        buttonStyle: secondary
  - type: FormLayout
    content:
      - type: FormField
        id: name
        label: "Name"
        dataType: string
        required: true
      - type: FormField
        id: email
        label: "Email"
        dataType: string
        stereotype: email
      - type: FormField
        id: birthDate
        label: "Birth date"
        dataType: date
```

## Page type — `pageType:`

A page has a coarse **page type** — `landing`, `collection`, `detail`, `form`, `process` or
`dashboard` (the Redwood page-template families). It sets the page's default width (form, process
and landing pages are capped; collection, detail and dashboard pages defer to their content) and is
stamped on the rendered page as `data-page-type`. A Java view declares it with
`@PageTemplate(PageType.X)`; a YAML page declares it with a top-level `pageType:` key, beside
`layout:` (or beside `type:` in a bare tree):

```yaml
pageType: landing
layout:
  type: VerticalLayout
  content:
    - type: HeroSection
      title: Welcome
```

- **Declared, it wins** over the type inferred from the content or from a bound `viewModel:` — the
  same precedence as `@PageTemplate` (and, like the definition's `layout:`, over a `@PageTemplate`
  on the view model it binds, since the definition is the more specific of the two).
- **Absent, nothing changes**: the type is inferred as before.
- Matched without regard to case; an unknown value is ignored (and logged), so a typo never costs
  the page.
- It reaches the wire on every path — served by Java, .NET or Python, pre-rendered into a static
  bundle, or expanded in the browser from a `specsOnly` bundle — and every renderer (Vaadin,
  Redwood) reads it from there.

The New › Mateu › Page… templates (IntelliJ and VS Code) already write the right one: Welcome and
Hero Search → `landing`; Listing, Smart Search, To-do List, Calendar, Collection Detail and the
grid-like pages → `collection`; General/Item Overview, Foldout and Gantt → `detail`; Dashboard →
`dashboard`; Wizard step → `process`; Form → `form`. The blank layout leaves it to inference.

## Page header — `type: Form`

A page's header lives on its `type: Form` node: `title`, `subtitle`, `avatar`, `header`,
`toolbar`, `buttons`, `footer`, `noHeader` — and every other element a Java page gets from its
annotations and suppliers, now authorable as data. The keys in the table below are
**experimental** (`@Experimental("YAML page header (3.0 beta)")` on the `Form` record): their names
and shapes may still change before they are declared stable.

| Key | Shape | Java twin |
|---|---|---|
| `overline` | text above the title | `@Overline` / `OverlineSupplier` |
| `titlePlaceholder` | what the header shows while the title is empty | `@TitlePlaceholder` |
| `timestamp` | the "last updated" line under the subtitle | `@Timestamp` field |
| `badges` | list of `{label, color}` chips | `@BadgeInHeader` / `HeaderBadgesSupplier` |
| `kpis` | list of `{label, value}` key facts | `@KPI` |
| `peerNav` | `{prevLabel, prevRoute, nextLabel, nextRoute}` | `PeerNavigationSupplier` |
| `recordSwitcher` | `{label, value, type, searchable, disabled, options \| optionsSource, route \| actionId}` | `RecordSwitcherSupplier` |
| `banners` | list of `{theme, title, description, closeable, timeoutSeconds}` | `@Banner` / `BannerSupplier` |
| `fabs` | list of `{icon, label, actionId, order, buttonStyle}` | `@Fab` methods on the page |

```yaml
type: Form
title: ${state.name}
overline: Customers
titlePlaceholder: New customer…
timestamp: Last updated ${state.updatedAt}
badges:
  - {label: "${state.status}", color: success}   # blank once interpolated → hidden
kpis:
  - {label: Balance, value: "${state.balance}"}
peerNav: {prevLabel: Previous, prevRoute: "customers/${state.prevId}", nextLabel: Next, nextRoute: "customers/${state.nextId}"}
recordSwitcher:
  label: Customer
  value: ${state.id}
  searchable: true
  optionsSource: {ref: customers, itemsPath: content, valuePath: id, labelPath: name}
  route: customers/${state._record}            # the picked value is ${state._record}
banners:
  - {theme: WARNING, title: Overdue, description: "Two invoices are overdue", closeable: true}
fabs:
  - {icon: "vaadin:plus", label: New order, actionId: newOrder}
content: [...]
```

- **Dynamic values use the idioms every YAML text already has**: `${state.x}` and `${data.x}`
  (the route's `data:` source feeds `data`), interpolated by the renderer. A badge whose text
  interpolates to blank is hidden — the same switch a `@BadgeInHeader` String field gives.
- **The record switcher's entries** are either listed (`options: [{value, label, description}]`) or
  fetched by the browser from a REST source (`optionsSource:`, usually a `sources.yaml` reference,
  read with its `itemsPath`/`valuePath`/`labelPath` — like a select field's options). A pick
  **navigates** to `route` (with `${state._record}` = the picked value), or, without a route,
  dispatches `actionId` (default `_switchRecord`) with the value in `_record` — a page `actions:`
  entry or a view model method can take it from there. The source is fetched directly by the
  browser, so a `proxy: true` source does not serve a switcher.
- **Banner themes** are `INFO`, `SUCCESS`, `WARNING`, `DANGER` (upper case).
- **FABs** dispatch their `actionId` like any button: an action the page declares in `actions:`,
  an [action-catalogue](/concepts/action-catalogue/) entry, or a method of the bound view model.
  They stack by `order` (ties keep the list order); `buttonStyle` defaults to `primary`.
- They reach the wire with the **same field names** a reflected Java page's header has (`overline`,
  `titlePlaceholder`, `timestamp`, `badges`, `kpis`, `peerNav`, `switcher`, `banners`, `fabs`), so
  every renderer draws them alike — served by **Java, .NET or Python**, pre-rendered into a static
  bundle, or expanded in the browser from a `specsOnly` bundle.
- **Redwood** draws every one of them, for a YAML page and a Java page alike: KPIs, subtitle,
  switcher (listed or from a direct source; `route` picks navigate), banners and FABs, and on its
  `oj-sp` page header the status badge (the first header badge — the rest follow the subtitle,
  and a badge whose label resolves blank is not drawn), the previous/next arrows (a side with no
  route is drawn disabled; both empty, no arrows), the timestamp (the header's own "last updated"
  element when the value is a date — `2026-10-12T10:42` — otherwise the text ends the subtitle
  line), the overline above the title and the title placeholder (dimmed, only while the title
  resolves empty).

## Page templates — `template:`

A page either **fills a template** or is **free**. A free page (no `template:`) lays its `content`
out as written. A page with a `template:` fills one of the design system's page templates — the
Redwood templates, as Oracle's Spectra ships them — and gives only what that template asks for:
its fields and its slots, **named as the template names them**. The template decides the look
(colours, surfaces, spacing, the shape and size of an image); the page never styles it.

In atomic-design terms the template is the **template** level, and your YAML page — the template
filled with the record's data (`${state.x}`) — is the **page**.

| `template.type` | Redwood template | Fields | Slots |
|---|---|---|---|
| `GeneralOverviewPage` | `oj-sp-general-overview-page` | — | `info` (the complementary side panel); the form's `content` is `main`. The header — title, `recordSwitcher`, `kpis` (contextual info), timestamp, toolbar — is the form's |
| `ItemOverviewPage` | `oj-sp-item-overview-page` + `oj-sp-item-overview` | `avatar {src, initials}` (round) or `photo {src}` (4:3) | `body`, `footer` (the overview panel); the form's `content` is `main` |
| `DashboardLandingPage` | `oj-sp-dashboard-landing-page` | — | `kpi` (the scoreboard's `MetricCard`s); the form's `content` is the main area (one `DashboardPanel` per chart or list) |
| `WelcomePage` | `oj-sp-welcome-page` | `backgroundColor` (Spectra's `dark-ocean` … `dark-sienna`, or the bare tone; `auto`/none = default) | the form's `content` is the default slot (the tiles under the banner) |

The rest of the template comes from the `type: Form` that carries it: its `title`/`subtitle` are
the item's (`itemTitle`/`itemSubtitle`), its first header badge the item's badge, its `peerNav` the
previous/next item, its back button the parent link, its primary toolbar button the panel's **edit**
action when it edits (otherwise it joins the panel's other actions, like the rest of the toolbar).

A `WelcomePage` draws the page's header itself: the form's `title` is the banner's title, its
`subtitle` the description, its `overline` the line above the title and its `toolbar` the calls to
action (a `primary` one first) — the form shows no header or toolbar of its own.

```yaml
type: Form
title: Star Wars
overline: A Mateu demo
subtitle: Characters, planets and starships of the saga.
toolbar:
  - {type: Button, label: Browse the characters, buttonStyle: primary, actionable: {type: RouteLink, route: people}}
template:
  type: WelcomePage
  backgroundColor: dark-slate
content:                     # the tiles under the banner
  - type: DashboardLayout
    items:
      - {type: DashboardPanel, title: Characters, content: {type: Text, text: Who is who.}}
```

An item overview:

```yaml
type: Form
title: ${state.name}
subtitle: Character
toolbar:
  - {type: Button, actionId: backToList, label: Back to People, actionable: {type: RouteLink, route: people}}
  - {type: Button, label: Edit, buttonStyle: primary, actionable: {type: RouteLink, route: "people/${state.id}/edit"}}
template:
  type: ItemOverviewPage
  avatar: {src: "${state.image}"}
  body:
    - {type: FormField, id: gender, label: Gender, readOnly: true, propertyRow: true}
    - {type: FormField, id: homeworldName, label: Homeworld, readOnly: true, propertyRow: true}
content:                     # the template's main slot
  - type: TabLayout
    tabs:
      - type: Tab
        label: Physique
        content: {type: FormField, id: height, label: Height (cm), readOnly: true, propertyRow: true}
```

- **Redwood** paints the template itself (`oj-sp-item-overview-page`), with nothing of ours on top
  of it. A `main` slot that is one tab bar becomes the template's tabs; anything else is shown as it
  is.
- **Every other renderer** (Vaadin, React Native, IntelliJ) gets the template laid out as ordinary
  components — Mateu's own drawing of it: the overview panel pinned on the left, the main slot on
  the right, wrapping under it on a narrow screen. Each slot travels in a container named after it
  (`item-overview-body`, `item-overview-footer`, `item-overview-main`) and the template's own values
  on the form (`template: {type, avatar, photo}`).
- It works served by the **Java** backend, pre-rendered into a static bundle and expanded in the
  browser from a `specsOnly` bundle. The .NET and Python YAML builders do not read `template:` yet.
- `template:` is **experimental** (`@Experimental("page templates (3.0 beta)")`). The IDEs' **Item
  Overview** page template writes it. More templates follow the same shape.
- Demo: the record pages of `demo/demo-starwars` (`person.yaml`, `planet.yaml`, `film.yaml`…).

## Available types

All component types from the [`io.mateu.uidl.data`](/java-ui-definition/supported-components/) package are supported.
Use the exact class name as the `type` value.

**Layout components:** `VerticalLayout`, `HorizontalLayout`, `FormLayout`, `TabLayout`, `SplitLayout`, `MasterDetailLayout`, `AccordionLayout`, `BoardLayout`, `CarouselLayout`, `Grid`, …

**Content components:** `Text`, `Markdown`, `Image`, `Icon`, `Badge`, `KPI`, `Chart`, `ProgressBar`, `Anchor`, `Bpmn`, `Workflow`, …

**Input components:** `FormField`, `CustomField`, `FormSection`, `FormRow`, …

**Action components:** `Button`, `Dialog`, `ConfirmDialog`, …

**Navigation:** `RouteLink`, `Menu`, `Directory`, `Breadcrumbs`, …

The complete list of types and their fields is in the JSON Schema:
`https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/uidl-schema.json`

## IntelliSense setup

The project ships a JSON Schema at `https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/uidl-schema.json`.
Connecting your editor to it gives you **autocompletion**, **field validation**, and **documentation tooltips** while editing YAML files.

---

### VS Code

**Option A — workspace settings (recommended)**

Install the [YAML extension by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), then add this to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json": "src/**/specs/ui/**/*.yaml"
  }
}
```

This activates IntelliSense for every `*.yaml` file under any `specs/ui/` directory in the project.
`specs-schema.json` is the unified schema — a `oneOf` of every file kind (pages, `type: Routes`,
`type: UI` mounts, `sources.yaml`, `project.yaml`…), so a routes or sources file validates too; the
component catalogue `uidl-schema.json` alone would flag those as invalid.

**Option B — per file**

Start the file with a `$schema` key (the loaders ignore it; this is what the starters do), or with the
YAML language server's comment:

```yaml nocheck
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: VerticalLayout
...
```

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
```

`specs-schema.json` fits every file kind — a bare component tree, a page with a `layout:` envelope,
routes, sources, project settings. `uidl-schema.json` covers a bare component tree only and rejects a
`layout:` page.

Neither the schema nor the loader rejects an **unknown key** (a misspelt `titel:` is ignored), so a
typo shows as a missing feature, not an error. A file the loader cannot read at all makes its route
answer *Not found*; the reason is in the server log (`WARN Could not read the definition …`) and,
with `-Dmateu.dev=true`, on the page.

---

### IntelliJ IDEA

1. Open **Settings** (`⌘,` / `Ctrl+Alt+S`).
2. Go to **Languages & Frameworks → Schemas and DTDs → JSON Schema Mappings**.
3. Click **+** to add a new mapping.
4. Fill in:
   - **Name:** `Mateu UIDL`
   - **Schema file or URL:** `https://raw.githubusercontent.com/miguelperezcolom/mateu/refs/heads/master/backend/shared/uidl/specs-schema.json` (the unified schema of every `specs/ui` file kind)
   - **Schema version:** `JSON Schema version 7`
5. Under **File path pattern**, click **+** and enter: `specs/ui/**/*.yaml`
6. Click **OK**.

IntelliJ will now provide autocompletion and validation for all YAML files under `specs/ui/`.

> **Tip:** If IntelliJ shows a yellow bar saying "Schema is not applied", make sure the file path pattern matches — use `specs/ui` without a leading slash.

---

## Partials

A YAML file under `specs/ui/partials/` is not a page but a **partial** — one component, or a list
of them, usable anywhere a component is:

```yaml
- type: Partial
  ref: address-block
```

See [Partials](/define/yaml/partials/).

## `layoutDelta:` — keep inference alive

A page can carry a **`layoutDelta:`** instead of a `layout:`. The difference matters more than it
looks:

```yaml
viewModel: com.acme.Contact
layoutDelta:
  order: [email, name]
  hidden: [internalNote]
  overrides:
    name: { label: "Full name", colspan: 2 }
```

> **Vocabulary:** the key that names the view model is **`viewModel:`** (the canonical noun of the
> [5-noun model](/concepts/routes-and-mounts/)). The older **`modelView:`** is still accepted
> as a deprecated alias so existing definitions keep working; prefer `viewModel:` in new files.

A `layout:` is a **snapshot**: it takes the screen out of the inference regime for good, because
explicit always wins. Add a field to the model afterwards and it does not appear; rename one and the
layout points at a ghost.

A `layoutDelta:` records **what a human decided**, anchored to field ids. Inference still runs on
every request and the delta is re-applied on top, so a field the model grows later lands in its
inferred place, and one it loses is an entry that simply matches nothing.

What a delta deliberately cannot express is arbitrary restructuring — "wrap these two in a card
inside a tab". Anchoring to ids is exactly what makes it survive a model change; a delta that could
rebuild the tree freely would be a snapshot with a different name.

The delta is re-applied to the tree inference produced **on every request** — that is the whole
difference from a `layout:`, which is computed once and then stands in for the model forever.

### Three parts, three rules

An inferred tree may spread the model's fields over sections, tabs or rows, so:

| | |
|---|---|
| `hidden` | removes that field wherever it sits |
| `overrides` | apply to that field wherever it sits |
| `order` | reorders the fields **within each container that holds them**, leaving non-field siblings in their slots (the rows of one form layout — how its columns are drawn — count as one run, so a two-column form reorders as the editor shows it) |

A delta cannot move a field between containers, and cannot restructure the tree. That limit is not
an omission — it is the reason a delta survives a model change at all.

### The visual editor writes these

Drag a field in the editor and it saves a `layoutDelta:`, not a snapshot. Two consequences worth
knowing:

- **Opening a screen and changing nothing writes `layoutDelta: {}`** — an empty delta, which costs
  the screen nothing. Using the editor must not, by itself, end a page's inference.
- **Some edits cannot be a delta.** Add a `Text`, wrap two fields in a card, set a stereotype by
  hand — none of that is expressible as "these fields, in this order, with these tweaks". The
  editor then falls back to writing a `layout:` and shows a **snapshot** badge instead of a
  **delta** one, so the moment a screen leaves inference is visible rather than silent.

An existing `layout:` page migrates by itself: open it in the editor, rearrange, and if the layout
is a flat run of the model's own fields the next save comes back as a delta.

:::note
`layoutDelta:` is served by the **Java**, **.NET** and **Python** servers (same three rules).
:::

## Hybrid: YAML layout + Java logic with `@UISpec`

A pure YAML file has no Java class, so it cannot run server-side logic. A pure Java `ComponentTreeSupplier` has no YAML file, so the layout is hard-coded.

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

`@UISpec` is the middle ground: a **Java ViewModel class** whose component tree is loaded from a YAML file. The Java class provides state (fields), actions (methods), rules, and validations; the YAML file defines the layout.

```java
@UISpec("specs/ui/customer-form.yaml")
public class CustomerFormViewModel {

    public String name;
    public String email;

    @Button
    public void save() { ... }
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: customer-form
    viewModel: com.example.CustomerFormViewModel
```

The YAML file at `src/main/resources/specs/ui/customer-form.yaml` defines the component tree rendered for this class. Mateu combines the two: layout from YAML, behaviour from Java.

See [`@UISpec`](/java-ui-definition/annotations/uispec/) for the full reference.

## When to use YAML vs Java

| Situation | Recommendation |
|---|---|
| Static informational page (about, help, landing) | Pure YAML file |
| Page with server-side logic, computed fields, actions | `@UISpec` or `ComponentTreeSupplier` |
| Prototype or low-code scenario | Pure YAML file |
| Page that needs dependency injection or DB access | `@UISpec` or Java class |
| Designer-managed layout, developer-managed logic | `@UISpec` |
| Fully dynamic / programmatic layout | `ComponentTreeSupplier` |

YAML pages and Java pages can coexist freely in the same application.
