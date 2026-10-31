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
| Redwood canvas (the real Oracle VB renderer, editable) | ✅ served by the plugin | ✅ served by the extension |
| New file from a template (mount, routes, app shell, sources, pages) | ✅ **New \| Mateu** | ✅ **Mateu: New File…** |
| Add a route to a routes file (and set the mount's home) | ✅ **Add Mateu Route…** | ✅ **Mateu: Add Route…** |
| Binding checks against the Java view model (+ quick fixes) | ✅ | — |
| Runs the Mateu app inside the IDE | ✅ ([native renderer](/native/)) | — |
| Per-project backend + authentication | ✅ Settings \| Tools \| Mateu | `mateu.baseUrl` setting |

IntelliJ needs a **Java IDE** (IntelliJ IDEA Community or Ultimate): the binding checks resolve view
models through the Java plugin.

## The visual editor's canvas: Vaadin or Redwood

Both editors can paint the canvas with the **Vaadin** renderer or with the real **Redwood**
renderer, which is the Oracle Visual Builder app of `io.mateu:mateu-redwood`. The canvas opens in the
project's renderer (`project.yaml`, below), and the selector in the editor's toolbar previews the
other renderer for the session. See [the Redwood canvas](/define/yaml/visual-editor/#the-redwood-canvas).
In both IDEs the Redwood app is part of the editor's bundle. The IDE's local server serves it, so
it works with no backend running. VS Code frames it from the extension's loopback server, because a
webview cannot host the app itself. A bundle built without the Redwood app falls back to the
configured backend's own (`/_index.html`, `/_redwood/`). In every case Redwood loads Oracle JET and
the Visual Builder runtime from **Oracle's CDN**, so the IDE needs to reach `static.oracle.com`.
Without it the canvas shows a notice instead of the page, and the Vaadin canvas keeps working offline.

## The project's renderer: project.yaml

The renderer is a **project** setting, kept in `specs/ui/project.yaml` (`type: Project`,
`renderer: vaadin | redwood`; see [project settings](/define/yaml/project-settings)). Both IDEs
edit that file, and the file is the source of truth:

- **IntelliJ**: **Settings | Tools | Mateu → Project → Renderer** reads `project.yaml` when the page
  opens and writes it on **Apply**. It creates the file if it is missing and rewrites only the
  `renderer:` line.
- **VS Code**: the `mateu.renderer` setting follows the file. It is synced from the file on
  activation and whenever the file changes, and changing the setting writes the file. The command
  **Mateu: Project Settings…** asks for the renderer and writes the file too.
- **New | Mateu → Project Settings** creates the descriptor. It is offered only while the project has
  none, because there is one per project.
- The **UI Mount** wizard shows the project's renderer and the artifact the app must depend on
  (`io.mateu:mateu-vaadin` or `io.mateu:mateu-redwood`).

The visual editor's canvas, Play and Export use this renderer. The canvas's own toolbar switch is
only a preview for the session.

## Creating files: New | Mateu

Right-click a folder in the Project view (or press ⌘N / Alt+Insert on it) and pick **New | Mateu**.
In VS Code, right-click a folder in the Explorer and choose **Mateu: New File…** (also in the command
palette). Every kind of file under `specs/ui` is offered:

| Entry | Creates | Notes |
|---|---|---|
| **UI Mount** | `type: UI` | An app served at a base path — the data-driven `@UI`. Lists its route files. Optionally names its **home page route** (`home:`, the page the mount opens on — see [the mount's home](/concepts/routes-and-mounts/#the-mounts-home)) — usually left empty at creation and set later from Add Route…. |
| **Routes File** | `type: Routes` | Created **empty** (`routes: []` under a short header pointing at [the route registry](/concepts/routes-and-mounts/)). Pick the **mount** (`type: UI`) to register it in — it is appended to that mount's `routes:` list (preselected when there is exactly one). The optional **base path** is only for a class-declared `@UI("/shop")` mount. Add the entries one at a time with **Add Route…** (below). |
| **App Shell** | `type: AppShell` | Title, variant, home route and a menu with a group. Bind it to the mount root (`""`). |
| **Action Catalogue** | `type: Actions` | Created **empty** (`actions: []` under a short header). Named flows and REST calls the shell menu and any page run by id — see [the action catalogue](/concepts/action-catalogue/). The visual editor opens it in a structured editor (add / rename / describe / remove actions, edit their steps), and every action-id picker offers its ids marked **catalog**. |
| **REST Source Catalogue** | `type: Sources` | Two example sources (`source:` nested, `provenance`, `fields`, `totalPath`). See [the REST source catalogue](/concepts/data-sources/). |
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

The **page width** (fixed = centred, max 1392px · full width = the whole content width · edge to
edge = no margins) is written as the root layout's `style`, because a YAML definition has no
`pageWidth` key; choose *Let the renderer decide* to leave it out. The style never adds a side
gutter: the view the page renders in already has one (the app shell's, or the design system's when
the page stands alone).

**Where the file goes.** If you right-clicked a folder inside `specs/ui`, the file goes there.
Otherwise the nearest existing `specs/ui` (`src/main/resources/specs/ui` or `specs/ui`) at or above
that folder is used; failing that, `src/main/resources/specs/ui` is created when the folder is a
Maven/Gradle module, else `<folder>/specs/ui`. Existing files are never overwritten.

Every skeleton is validated against the generated specs schema in the plugin's test suite (strictly:
a key the schema does not declare fails), so a new file never starts out red.

Both editors validate against the same generated schema (`backend/shared/uidl/specs-schema.json`), in
two spellings: IntelliJ reads it as generated, while the VS Code extension stages a variant whose
polymorphic families (`Component`, `Actionable`, …) are rewritten as `type` dispatches — the shape the
Red Hat YAML language server validates in milliseconds instead of trying all 125 component branches
at every level on every keystroke. Same files accepted, same files refused; one source. In IntelliJ the
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
[the route registry](/concepts/routes-and-mounts/).

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
[The Mateu desktop app](/native/desktop-app/)) is the only place the plugin takes over the frame title,
hides foreign tool windows, lands on the home route and updates itself; in a developer's IDE the plugin
is updated from the JetBrains Marketplace as usual.

## Live development: the Mateu App run configuration

A **Mateu App** run configuration (**Run | Edit Configurations… › + › Mateu App**) starts the
project's UI in development mode and opens it where you choose, so the same UI can be tried on the
web, on the desktop and in the mobile app from the IDE:

| Open in | What happens once the app answers |
|---|---|
| **Web (browser)** | the default browser opens it — the web renderer |
| **Desktop (this IDE)** | **Settings | Tools | Mateu** points at it and the **Mateu** tool window reconnects — the IntelliJ renderer |
| **Android emulator** | `adb shell am start` opens `mateu://add?u=http://10.0.2.2:<port>` in the Mateu app on the running emulator |
| **iOS simulator** | `xcrun simctl openurl booted mateu://add?u=http://localhost:<port>` (macOS) |
| **Phone (QR code)** | the app listens on the network and a dialog shows the QR of `https://mateu.io/add?u=http://<lan ip>:<port>` |

**Run** starts it; **Debug** also attaches a *Remote JVM Debug* session to the app (it is started with
the debug agent either way). The module is found from the project — a Spring Boot, Quarkus, Micronaut
or Helidon app (Maven or Gradle) first, else a YAML-only project that builds a **static bundle**, which
runs with `mvn mateu-bundle:dev` (no backend: nothing to attach a debugger to, and the desktop target
is refused because the IntelliJ renderer needs a backend). The *Module directory* field overrides the
choice. The Mateu app accepts a plain `http` address only in a **development build**, so the
emulator, simulator and phone targets need one installed.

**Run | Open Mateu App In…** opens the app that is already running on another target without
restarting it (the phone only when the app already listens on the network). **Run | Run Mateu App
(Live)** debugs the project's Mateu App configuration, creating one that opens on the web the first
time.

In development mode (`mateu.dev=true`, every `src/main/resources/specs/ui` of the project watched) a
YAML edit (in the text editor or the visual editor's canvas) re-renders the open screen in place, and
every **HotSwap** fires `POST /mateu/dev/reload` so the screen shows the new code. **Run | Reload
Mateu Screen** fires it by hand. VS Code has **Mateu: Run App (Live)** and **Mateu: Reload Screen**
(also fired on a Java hot code replace), opening on the web. Details, adapters and limits: [Live
reload](/java-user-manual/build/live-reload/).
