# Visual editor — project awareness (reference pickers)

**Status:** IMPLEMENTED (2026-08-29). The host contract, reference index, the three file-based
pickers AND the field→data-source binding are done and browser-verified. The only open item is
live-verifying the IntelliJ/VSCode `listFiles`/path responders (they compile and are wired). Motivated
while writing the user manual `doc/.../java-ui-definition/visual-editor.md`.

## Implemented

- **Host contract** extended with `listFiles(): Promise<ProjectFile[]>` (`ProjectFile = {path, content}`).
  BrowserHost backs it from a `mateu-visual-editor-project` localStorage map (a `{path: yaml}` object);
  the IntelliJ (JCEF) and VSCode hosts answer it by enumerating `specs/ui/**` in the workspace
  (`MateuVisualEditor.sendFiles` / `MateuVisualEditorProvider.collectSpecsUiFiles`). MessageHost sends
  the `listFiles` request and resolves `[]` on a 1.5 s timeout if a host has not wired the responder.
- **Reference index** — `src/model/projectIndex.ts` `buildIndex(files)` → `{routes, pages, partials,
  appShells, viewModels}` (pure, 6 unit tests). Reuses the existing type discriminators.
- **Pickers** (native `<datalist>` = autocomplete + free text, degrades to a plain field with no
  project): app-editor menu-link `route` + `homeRoute` → routes; routes-editor `definition` →
  pages+appShells and `viewModel` → viewModels; properties `Partial.ref` → partials. All browser-verified.
- IDE responders compile but are **not yet live-verified** (need runIde / F5).

### field → data-source member (done)

A page `FormField.id` picks from the bound view model's fields, and any `actionId` from its actions.
The host now carries the edited file's PATH (`init.path` for the IDE hosts, a `mateu-visual-editor-path`
localStorage key for the browser), exposed as `HostBridge.currentPath()`. The shell's `boundViewModel()`
prefers a page-level `modelView:` (the envelope), else resolves it through the route graph — the route
whose `definition` names this file supplies the `viewModel`. `fetchContractMembers` (`__contract__`)
returns `{fields, actions}`, offered as `<datalist>`s. Verified live against a `CustomerForm` view model
wired to the `customer` route in `demo-app-definition` (fields name/email/age/subscribed, action save).

## Remaining

- **Live-verify the IDE responders** (IntelliJ runIde / VSCode F5): `listFiles` and `init.path` compile
  and are wired but were not eyeballed in a running IDE.

## The problem

A data-driven mount is a set of YAML files that **reference each other**. The visual editor opens each
file in the mode its `type:` selects (mount / app / routes / page+partial), and each mode can author
that file's own content well. What it cannot do yet is help you author a **reference to another
file**: every cross-file link is a hand-typed string, because each editor is **single-file** — it
only ever sees the one file it was opened on.

The single-file boundary is the `HostBridge` contract
(`apps/visual-editor/src/host/hostBridge.ts`): `initialYaml()` + `save(yaml)`. One file in, one file
out. No editor can enumerate its siblings, resolve a reference, or open/create another file. So "the
routes editor should know the pages and apps to reference them" is impossible today by construction,
not by omission.

## The reference graph

The four file kinds form a closed graph. An edge `A → B` means "a file of kind A names a file/symbol
of kind B":

```
   app ──references routes──►  routes
    ▲   (menu: RouteLink.route)   │
    │                             ├──references pages──►  page ──► partial   (Partial.ref)
    └──root route → AppShell──────┘   (RouteEntry.definition)  │
                                                              └──► data source (RouteEntry.viewModel
       (RouteEntry.viewModel = FQN of a view model / a REST source)          ↕ resolved via __contract__)
```

- **app → routes**: `AppShell.menu[].route` (and `homeRoute`) name a route.
- **routes → pages**: `RouteEntry.definition` names a page file; the root route's definition names the
  app shell.
- **routes → data source**: `RouteEntry.viewModel` names a Java view model FQN (later: a REST source
  id from the source catalogue).
- **page → partials**: a `Partial` node's `ref` names a partial.
- **page → data source**: a page's `FormField.id`s bind by convention to the properties of the view
  model the **route** paired the page with (see the indirection note below).

## The data-source indirection (important)

The user's mental model draws **page → data source** directly. The current data-driven model routes it
through the route: the page (`definition`) is layout-only, and the data source (`viewModel`) is bound
on the **RouteEntry**, not on the page. So a page's fields bind to a model the page never names —
`page ← route → viewModel`.

Consequences for the editor:

- To validate/autocomplete a page's field bindings against a data source, the editor must resolve
  **which route(s) pair this definition with which view model**, then fetch that model's `__contract__`.
  A definition served by several routes with different view models has several possible contracts.
- The envelope form `modelView: <FQN>` + `layout:` (visual-builder phase 0, still loaded by
  `YamlUidlLoader`) lets a page name its data source **directly**. Two ways to bind then coexist:
  route-level `viewModel` (the data-driven-mounts model) and page-level `modelView` (the envelope).
  The editor should support both and be explicit about precedence.

Decision needed: does the page editor bind against (a) the route's view model resolved through the
graph, (b) an explicit page-level `modelView`, or (c) both with a defined precedence? Recommend **(c)**,
preferring an explicit page-level `modelView` when present, else the route's, and surfacing "no data
source bound" when neither resolves.

## Per-reference gap table

| Reference | Where authored | Today | Target |
| --- | --- | --- | --- |
| menu link → route | app editor, `RouteLink.route` | free-text route name | dropdown of the mount's routes |
| home route → route | app editor, `homeRoute` | free-text | dropdown of routes |
| route → page | routes editor, `definition` | free-text file name | picker of page files (+ "create page") |
| root route → app shell | routes editor, `definition` | free-text | picker of `type: AppShell` files |
| route → data source | routes editor, `viewModel` | free-text FQN | picker of view models / REST sources |
| page → partial | page canvas, `Partial.ref` | free-text ref | picker of partials (+ "create partial") |
| page field → data-source member | properties panel | hand-matched id | pick from `__contract__` fields/actions; flag unbound |
| mount → route file | mount editor, `routes[]` | free-text file name | picker of routes files (+ "create") |

Reverse-direction affordances that fall out of the same project view: "create the page/partial this
reference points at" (the pending multi-file follow-up), and "find usages" (which routes serve this
page, which menu items link to this route).

## What it needs: a project-aware host contract

Extend `HostBridge` from single-file to project-scoped. Sketch:

```ts
interface HostBridge {
  baseUrl(): string
  initialYaml(): Promise<string>          // the file this editor opened on (unchanged)
  save(yaml: string): Promise<void>       // (unchanged)

  // NEW — project awareness:
  listFiles(): Promise<ProjectFile[]>     // every specs/ui/** file with its parsed `type:` + role
  readFile(path: string): Promise<string> // read a sibling (e.g. to resolve a reference)
  createFile(path: string, yaml: string): Promise<void>  // "create page from route"
  openFile(path: string): Promise<void>   // jump to a referenced file
  watch(cb: () => void): void             // re-list when the project changes on disk
}
```

- **IntelliJ (JCEF)** and **VSCode** can all implement these against their workspace/VFS. The browser
  dev host can back them with an in-memory/`localStorage` project or a dev endpoint.
- The **reference index** (which routes exist, which pages, which partials, which view models) is
  derived by listing `specs/ui/**`, parsing each file's `type:` and key fields — the same discriminator
  the editor already uses to pick a mode. View-model FQNs come from the routes' `viewModel` fields and
  (for validation) `__contract__`; a fuller "list all view models in the project" needs either a build
  index or a backend endpoint (open question).
- **Data-source contracts** reuse the existing `__contract__` action per FQN (already consumed by the
  IntelliJ binding annotator — see the `project-visual-builder` note); cache per FQN.

## Suggested sequencing

1. **Host contract + reference index** (`listFiles`/`readFile`, in-memory index of routes/pages/
   partials). No new backend. Unlocks the file-name pickers (menu→route, route→page, page→partial,
   mount→routes).
2. **Pickers in the three form editors** (app menu, routes table, mount list) + the `Partial.ref`
   picker on the canvas. Validate that a reference resolves; warn when it dangles.
3. **Data-source binding** in the properties panel via `__contract__`, with the page↔route↔viewModel
   resolution above. Field-level bind pick + unbound warning.
4. **Create/open** (`createFile`/`openFile`): "create the page/partial this reference points at",
   "open referenced file", "find usages".

## Open questions

- Enumerating **all** view models in a project (for the `viewModel` picker) without a build step —
  backend endpoint vs. AP-emitted index vs. only offer the ones already referenced.
- REST sources as data sources (the source catalogue) — same picker, different id space.
- Page↔data-source binding precedence (route `viewModel` vs page `modelView`) — recommend explicit
  page-level wins, else route.
- Ports (.NET/Python `RouteRegistry`) have no bundle/index exporter; project awareness is editor-side
  and backend-agnostic, so this is not blocked on them.
