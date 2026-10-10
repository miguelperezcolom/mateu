---
title: "IDE tooling: IntelliJ and VS Code"
description: "Author Mateu YAML in your IDE: schema validation, the visual editor, New | Mateu file templates, and connecting a project to its backend with authentication."
---

Both IDE integrations author the same `specs/ui/**` files and share their file skeletons, so a team
can mix editors freely.

| | IntelliJ plugin | VS Code extension |
|---|---|---|
| Schema validation + completion for `specs/ui/**` YAML | ✅ bundled specs schema | ✅ `yamlValidation` (needs the Red Hat YAML extension) |
| Visual editor (palette, canvas, properties) | ✅ JCEF editor tab | ✅ custom editor |
| New file from a template (mount, routes, app shell, sources, pages) | ✅ **New \| Mateu** | ✅ **Mateu: New File…** |
| Add a route to a routes file (and set the mount's home) | ✅ **Add Mateu Route…** | ✅ **Mateu: Add Route…** |
| Binding checks against the Java view model (+ quick fixes) | ✅ | — |
| Runs the Mateu app inside the IDE | ✅ ([native renderer](/native/)) | — |
| Per-project backend + authentication | ✅ Settings \| Tools \| Mateu | `mateu.baseUrl` setting |

IntelliJ needs a **Java IDE** (IntelliJ IDEA Community or Ultimate): the binding checks resolve view
models through the Java plugin.

## Creating files: New | Mateu

Right-click a folder in the Project view (or press ⌘N / Alt+Insert on it) and pick **New | Mateu**.
In VS Code, right-click a folder in the Explorer and choose **Mateu: New File…** (also in the command
palette). Every kind of file under `specs/ui` is offered:

| Entry | Creates | Notes |
|---|---|---|
| **UI Mount** | `type: UI` | An app served at a base path — the data-driven `@UI`. Lists its route files. Optionally names its **home page route** (`home:`) — usually left empty at creation and set later from Add Route…. |
| **Routes File** | `type: Routes` | Created **empty** (`routes: []` under a short header pointing at [the route registry](/java-ui-definition/route-registry/)). Pick the **mount** (`type: UI`) to register it in — it is appended to that mount's `routes:` list (preselected when there is exactly one). The optional **base path** is only for a class-declared `@UI("/shop")` mount. Add the entries one at a time with **Add Route…** (below). |
| **App Shell** | `type: AppShell` | Title, variant, home route and a menu with a group. Bind it to the mount root (`""`). |
| **REST Source Catalogue** | `type: Sources` | Two example sources (`source:` nested, `provenance`, `fields`, `totalPath`). See [the REST source catalogue](/java-ui-definition/rest-source-catalogue/). |
| **Page…** | a page definition | Pick a **template** and a **page width** (below). When the folder has a routes file, **Add a route to `<routes file>`** (on by default) appends a route to the new page, named after the file — optionally making it the home page. |

Page templates follow the [page templates](/ux-patterns/page-templates/) Mateu ships:

| Template | Root | Default width |
|---|---|---|
| Form | `Form` with a `FormLayout` and Save / Cancel | fixed |
| Listing / CRUD | `Listing` over a named source, filters, New, `rowRoute` to the record | full width |
| Wizard step | `Form` with progress and Back / Next | fixed |
| Dashboard | `Scoreboard` of `MetricCard`s over a `DashboardLayout` | full width |
| Smart Search | intro line + searchable `Listing` with filters | full width |
| To-do List | `TaskQueue` of counted buckets | fixed |
| Calendar | toolbar + `Calendar` (month/week/day/list) | full width |
| Welcome | `HeroSection` with calls to action + tiles | fixed |
| Hero Search | `HeroSection` + `Listing` as cards | fixed |
| Collection Detail | item list left, detail (empty state) right | full width |
| General Overview | record switcher + `EntityHeader` + cards | full width |
| Item Overview | sticky key-info card + `TabLayout` | full width |
| Foldout | `FoldoutLayout` with panels | edge to edge |
| Gantt Page | title + `Gantt` | edge to edge |
| Data Management | grid ⇄ Gantt tabs | full width |
| Matrix Grid | `MatrixGrid` with sections, editable row | edge to edge |
| Planning Board | `PlanningBoard` resources × days | edge to edge |
| Blank layout | an empty `VerticalLayout` | renderer decides |

The **page width** (fixed = centred, max 1408px · full width = 24px gutters · edge to edge = no
margins) is written as the root layout's `style`, because a YAML definition has no `pageWidth`
key; choose *Let the renderer decide* to leave it out.

**Where the file goes.** If you right-clicked a folder inside `specs/ui`, the file goes there.
Otherwise the nearest existing `specs/ui` (`src/main/resources/specs/ui` or `specs/ui`) at or above
that folder is used; failing that, `src/main/resources/specs/ui` is created when the folder is a
Maven/Gradle module, else `<folder>/specs/ui`. Existing files are never overwritten.

Every skeleton is validated against the generated specs schema in the plugin's test suite (strictly:
a key the schema does not declare fails), so a new file never starts out red. In IntelliJ the
skeletons are ordinary file templates — customise them in **Settings | Editor | File and Code
Templates | Other** (`Mateu …` entries). Placeholders: `__TITLE__`, `__NAME__`, and a line holding
only `__PAGE_WIDTH__`.

## Adding routes: Add Route…

A route registry grows **one entry at a time**. In IntelliJ, right-click a `type: Routes` file in the
Project view or inside its editor and choose **Add Mateu Route…** (also under **New | Mateu › Route…**
when the folder has a routes file). In VS Code, run **Mateu: Add Route…** from the Explorer or editor
context menu of the routes file, or from the command palette. You choose:

| Field | Written as | Notes |
|---|---|---|
| Routes file | — | Preselected when invoked on one; a choice when the specs folder has several. |
| Layout | `layout:` | A page or app shell discovered under `specs/ui` (relative to it), or none when the view model supplies its own tree. `layout` is the canonical key (`definition` is its deprecated alias). |
| Route | `route:` | Relative to the mount; empty is the mount root (typically the app shell). Defaults to the layout's file name in kebab case. A route already declared in the file is rejected. |
| View model | `viewModel:` | Optional fully qualified class — empty is a definition-only route, which is valid (the statically served case). |
| Parent route | `parent:` | Optional: one of the file's existing routes; the new route renders in that screen's slot (the route stays absolute). |
| Make this the home page | `home:` in the mount | Sets (or replaces) the `home:` route of the `type: UI` mount that lists this routes file, and shows the current one. Disabled when no mount lists the file. |

Every change is a **minimal text edit**: the entry is appended after the last one (the first one turns
`routes: []` into a block list), the mount gets one new line, and nothing else in your files is
reformatted. Fixed/default parameters, `children` and the data scopes are then edited by hand — see
[the route registry](/java-ui-definition/route-registry/).

## Connecting IntelliJ to a backend: Settings | Tools | Mateu

The plugin stays out of projects that are not Mateu apps: with no backend configured it makes no
HTTP calls, shows no Mateu tool windows or toolbar widget, and never touches the window title.
Configure a project in **Settings | Tools | Mateu** (stored in `.idea/mateu.xml`):

- **Base URL** of the backend (e.g. `http://localhost:8080`) and the **start route**; or an **app
  registry URL + app id**, which resolves the base URL and launch parameters.
- **Authentication**:
  - *Bearer token* — pasted once, kept in the IDE credential store (Keychain, KWallet, KeePass…),
    never in the project; sent as `Authorization: Bearer` on every Mateu call.
  - *OpenID Connect (device sign-in)* — issuer + client id (endpoints are discovered, or set
    explicitly). **Sign In…** shows a code and opens your browser; the refresh token is kept in the
    credential store and access tokens are refreshed silently.
- A **401** first tries a silent refresh; otherwise one notification offers **Sign in…** / **Open
  settings**, and the request is retried once with the new credentials.

JVM system properties override the settings, for CI or a one-off run: `-Dmateu.baseUrl`,
`-Dmateu.route`, `-Dmateu.registryUrl`, `-Dmateu.appId`, `-Dmateu.token`; `-Dmateu.debug=true` logs
the wire traffic.

The standalone desktop distribution (the IDE rebranded as your app, see
[Desktop & Mobile](/native/)) is the only place the plugin takes over the frame title, hides foreign
tool windows and lands on the home route.
