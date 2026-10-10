# Mateu Visual Editor (cross-IDE)

A **web-based visual editor** for Mateu YAML pages: palette + WYSIWYG canvas + properties **in one
view**. It is host-agnostic — the same bundle runs standalone in a browser, embedded in IntelliJ via
JCEF, and in VSCode via a Webview. Only a thin per-host bridge (file I/O + backend URL) differs.

This replaces the IntelliJ-only Swing visual builder (separate palette/properties tool windows), which
could not run in VSCode.

## Architecture

```
┌──────────── mateu-visual-editor (this app, TS/Lit) ─────────────┐
│  editor-palette | editor-canvas (mateu-ux) | editor-properties  │
└─────────────────────────────────────────────────────────────────┘
        ▲ HostBridge (init yaml + baseUrl / save)
   IntelliJ JCEF        VSCode Webview        Browser (dev)
        └──────────── Mateu backend: __preview__ / __contract__ ───┘
```

- **Canvas** reuses the shared `libs/mateu` renderer (`mateu-ux`) for a faithful render. It POSTs the
  current layout to the reserved **`__preview__`** sync action and applies the returned fragment.
- **DOM ↔ node mapping**: before preview, every layout node is stamped with a synthetic `id="ve-<path>"`
  (`decorateForPreview`). In the editor, `libs/mateu`'s `renderComponent` tags the root element of
  every component it paints with `data-node-id` (`nodeIdStamp.ts`, OFF in production); renderers that
  paint a child themselves (tab headers, accordion/foldout panels, page/toolbar buttons) tag it with
  `nodeIdAttr`/`stampButton`. A click maps the composed event path to the innermost tagged element
  (`canvas/canvasSelection.ts`). `canvas/nodeReachability.test.ts` paints every page template and
  fails if a definition node cannot be reached by a click. Layout edits go through the `PageDoc` model, which
  serializes back to YAML.
- **Model of truth**: the YAML page file (`modelView` + `layout`). Behaviour/data stay in the Java
  ModelView. This editor edits *layout only*.

## Preview source (where the canvas renders + gets its data)

The toolbar has a **preview-source selector**. The split that governs it: rendering the layout
(`__preview__`) needs an actual renderer (any Mateu backend — it renders the layout with **no** data
binding, so you don't need the app's data source); the **data/contract** (`__contract__`, binding
pickers) is the mockable half. None of the modes require a paid cloud.

| Mode | Render (`__preview__`) | Contract/data | Use it when |
|---|---|---|---|
| **Remote backend** | the backend URL | live from the backend | you have a backend running (dev/staging/demo) |
| **Local backend** | an embedded/loopback Mateu (a labelled `remote` for now) | live | you want it offline/embedded |
| **Mock data** | still the backend URL | from **fixtures** | render against any backend, but bind against fixtures — no real data source |
| **Client-side** | in the browser, by the client-side expander — no backend | REST sources, fetched by the browser | a classless page, offline / €0 |

A `remote`/`mock` render that gets no answer from its backend falls back to the client-side render
(classless pages) and says so in the canvas.

**Canvas renderer.** The canvas paints with the **Vaadin (Lumo)** reference renderer by default
(lazily loaded from `apps/vaadin`, so the preview matches what ships), the **DS-neutral** one, or
**Redwood (Oracle)**. Listings and option fields read the project's `sources.yaml`, so they preview
with real rows.

**The Redwood canvas** (`canvas/redwood-frame.ts`) is not a component renderer: Redwood's runtime is a
whole Visual Builder app, so the canvas frames it. `redwood-preview.html` (`src/redwood/previewPage.ts`)
boots the packaged app of `io.mateu:redwood` (its `_index.html` + `_redwood/`, served under `redwood/`)
in **editor-preview mode** (`apps/redwood/poc/editorPreview.mjs`). It replays the parked boot scripts
the way the generated controller does. The canvas computes the increment as usual (`__preview__`,
or the client-side expander with no backend) and posts it to the frame (`canvas/redwoodProtocol.ts`).
The app answers its own `/mateu` calls with it: a one-route App, then the tree. It stamps
`data-node-id` (the `ve-<path>` ids) on what it paints, so a click comes back as `click {id}` and
selects the node. The frame outlines the selection itself, because the editor cannot see a
cross-origin frame's DOM, and forwards the editor's keys. JET and the VB runtime load from Oracle's
CDN. When a boot script fails or nothing answers in 45 s, the canvas shows an offline notice.

Where `redwood/` comes from: the dev server (and `vite preview`) serves it from the jar's resources,
`backend/shared/frontend/redwood/src/main/resources/static`. Override that folder with
`MATEU_REDWOOD_STATIC`, and after touching `apps/redwood/poc/` regenerate it with
`npm run build && npm run copy` there. A file missing from the folder is fetched from `MATEU_BACKEND`'s
own Redwood app. `vite build` copies the folder into `dist/redwood/`, so the IntelliJ loopback server
and the VS Code one serve the Redwood canvas with the rest of the bundle. VS Code frames it from its
loopback server (`window.__mateuRedwoodPreview`). Both fall back to the backend's `/_index.html` +
`/_redwood/` when the bundle has no Redwood app.

### Mock fixtures — the €0 / offline workflow

A fixture is what `__contract__` would answer for one ModelView (its `fields` + `actions`), so the
binding pickers work with no live data source. In **Mock data** mode the toolbar gains:

- **Capture `<VM>`** — fetch the bound view model's contract from the backend once and save it as a
  fixture. Connect to a backend, capture, then work offline.
- fixture **chips** (with ✕ to remove) for every view model that has one.
- **Export** — copy all fixtures as JSON. **Import** — paste fixtures JSON. This is also the *"have your
  AI generate the fixtures"* path: a fixture is plain `{"<vm.FQN>": { "fields": [{"id": …}], "actions":
  ["…"] }}` — generate it however you like and Import it.

The choice (mode + backend url + fixtures) persists in `localStorage`.

## Run (standalone, in a browser)

Needs any running Mateu backend (all expose `__preview__`). Point the dev-server proxy at it:

```bash
# from the monorepo root, once:
npm install

# then:
cd apps/visual-editor
MATEU_BACKEND=http://localhost:8594 npx vite   # http://localhost:5199
```

Open http://localhost:5199 — it loads a sample page (or your last edit from localStorage). Click a
component to select it, edit its props on the right, add components from the left, use ↑/↓/Delete,
⌘Z/⇧⌘Z to undo/redo. Edits are merged into the file's YAML, so comments and formatting survive.

Quality is measured with `e2e/visual-editor-tasks.mjs` (12 authoring tasks, any build) and the VS Code
host is live-run with `e2e/vscode-host-live.mjs` (a real VS Code with the extension loaded).

## Share links (`#mateuz=`) and `public/agent.md`

A design can travel in a URL: `{v:1, path?, yaml, files?}` as JSON, raw-deflated and base64url'd
after `#mateuz=` (or URI-encoded plain JSON after `#mateu=`). It is in the fragment, so nothing
reaches a server (the idea comes from lnkiai/m3e-canvas, MIT). `model/shareLink.ts` encodes and
decodes it. `BrowserHost` imports a link on boot (the old draft goes to `*.previous`, and the
fragment is cleared so a reload keeps your edits). **Open…** loads a pasted one as an undoable
edit, and `HostBridge.adoptShared` lets a host take the rest of the mount.

`public/agent.md` is the guide a coding agent follows to produce such a link. It is served next to
the bundle and published raw on master. Keep it in sync with the document shape:
`shareLink.test.ts` decodes the exact Node `deflateRawSync` recipe it gives.

## Tidy (`model/tidy.ts`)

Rule-based structural clean-ups, after m3e-canvas's `lib/tidy.ts`: fixed rules and no model.
`tidyFindings(doc)` lists them and `applyTidy(doc, rules)` applies the chosen rules until nothing
more changes. It returns a new doc, and the shell commits the result as one undoable edit. Only
*plain* layouts (`type` + `content` and nothing else) are unwrapped, merged or dropped.

## Design notes (`model/notes.ts`)

`note:` is an authoring-only key on every component. `UidlSchemaGenerator` adds it to each Component
definition. The server's YAML mapper ignores unknown keys, and the client expander strips it (both
are pinned by tests). The properties panel edits it, the outline and the canvas selection show it,
and `buildViewModelPrompt` turns a page's notes (`collectNotes`, slots included) into the prompt
that asks for its view model.

## Viewport widths (`model/viewport.ts`)

The canvas can frame the page at desktop, tablet or phone widths (Fill is the default). The choice
is kept per browser and also used as play mode's starting width. `editor-canvas` takes a `frameWidth`
and sets a `framed` attribute; the overlays are positioned relative to `.host`, so they keep working
at any width.

## Board and play mode (`board/`, `play/`)

Two views of the whole mount, next to the file editor (both from lnkiai/m3e-canvas):

- **Board** (`board/mount-board.ts`) draws every route as a card with a live miniature
  (`board-preview.ts`: the same render as the canvas, one at a time and only once visible). It draws
  arrows from the navigation the files declare. `model/mountGraph.ts` derives the screens, the edges
  (menu, `RouteLink`, `rowRoute`, `successRoute`, `Navigate` steps, nested routes; targets are matched
  like the router matches them) and the banded auto-layout. The card arrangement is kept in
  localStorage, one entry per mount.
- **Play** (`play/mount-play.ts`) runs the mount. `model/playManifest.ts` turns the files, with the
  edited one laid over its saved copy, into a specs-mode manifest that is loaded into the shared
  `bundleStore`. A plain `mateu-ux` then loads routes from it, expanded in the browser. It stands in
  for `mateu-ui` but keeps its own history, because `mateu-ui` owns `window.history` and the editor's
  page is not the app's. On close it unloads the bundle.
- **The board edits** (`model/boardEdits.ts` over `model/yamlEdit.ts`): create a missing screen
  (page + route), give an orphan page a route, draw an arrow (menu entry / button / `rowRoute` /
  `successRoute`), delete or re-point one. Each is a `BoardChange` of file writes plus their inverse
  (the board's undo). The writes are minimal text splices located through the YAML node ranges, so
  nothing else in the file moves. The shell sends the open file through its edit history and the
  others through `HostBridge.writeFile` (IntelliJ: a Document edit in a write command, saved; VS Code:
  a WorkspaceEdit, saved; the browser: the localStorage project). The board re-derives from the files.
- Edit from the board goes through `HostBridge.openFile`. The browser host swaps the draft in place;
  IntelliJ and VS Code handle an `openFile` message by opening the file in another tab.
- **Image pickers** (`widgets/ve-image-picker.ts`; the rule in `model/projectImages.ts`
  `isImageProp`). The host answers `listImages` with `images: [{path, url, thumb, src?}]` (the
  module-relative file, the URL the app serves it at, a thumbnail, and where the canvas loads it) and
  pushes the list again when an image changes. It answers `addImage` (file chooser + copy) with
  `imageAdded {image}`. IntelliJ (`ProjectImages.kt`) serves both `thumb` and `src` from its loopback
  server (`/__mateu-images/<token>/<path>`, same origin as the editor). VS Code (`projectImages.ts`)
  uses a webview URI for `thumb` and its loopback server for `src`, because the framed Redwood canvas
  cannot load a webview URI. The canvas and Play swap a project image's URL for `src`
  (`decorateForPreview`, `withPreviewImages`); the file keeps the URL.

## Palette thumbnails (`scripts/thumbnails.mjs`)

The **Insert** palette shows each component as a card with a picture of it, so you recognise it by
its look rather than its name, and hovering a card shows it larger. The pictures are **screenshots of
the editor's own canvas** painting a sample of each component, never drawings, so a thumbnail is
exactly what the canvas shows once the component is dropped.

- `src/model/thumbnailSamples.ts`: the sample per component (a grid with rows, a chart with data…).
  A part that only renders inside its parent, such as `GridColumn` or `Tab`, is pictured as that
  parent. `NO_THUMBNAIL` lists, with a reason, the ones that have none (triggers, menu entries,
  runtime-only embeds).
- `thumbs.html` + `src/thumbs/harness.ts`: the page that gets screenshotted. It is built apart by
  `vite.thumbs.config.ts` and never shipped in the editor bundle.
- `src/thumbnails/<look>/<Type>.png`: the output, `vaadin` and `redwood`. `src/model/thumbnails.ts`
  picks it up with `import.meta.glob`. The palette has a **look** selector (Vaadin / Redwood / Names
  only) that starts from the canvas's design system; the DS-neutral canvas starts with names only.
- **Redwood** thumbnails come from the same harness with the canvas switched to Redwood: the real VB
  app in editor-preview mode, framed. It paints every wire component type, so only the
  `NO_THUMBNAIL` entries go without a picture (the palette would dim any other).

Regenerate when the catalog or a renderer changes, against **any running Mateu app** (they all answer
`__preview__`), so the thumbnails show what the server renders, i.e. what ships:

```bash
node scripts/thumbnails.mjs --backend http://localhost:8080        # vaadin, all
node scripts/thumbnails.mjs --backend http://localhost:8080 --only Grid,Card

# redwood: the Redwood canvas (needs Oracle's CDN; the VB app comes from the jar's resources)
node scripts/thumbnails.mjs --renderer redwood --backend http://localhost:8080
```

The Redwood run is the Vaadin one with the canvas switched to Redwood. The framed VB app gets a
one-route App, and that route answers the sample's `__preview__` wrapped as a server-side component,
exactly as a real route's content arrives. The run crops the content panel, below the page header.

The run lists what rendered nothing and what the backend could not render. `thumbnails.test.ts`
fails while a catalog component has neither a thumbnail nor a `NO_THUMBNAIL` entry. Without
`--backend` it uses the in-browser expander, which is close to the server render but not identical.

## Status

**Fase A — first slice (this):** app scaffold, 3-pane shell, canvas render via `__preview__`, click-to-
select with DOM→path mapping, properties editing (incl. add prop), add-from-palette, delete/reorder,
YAML source view, browser HostBridge. **Build is green** (`vite build`); live render needs a backend.

**Next:**
- Drag-and-drop from palette to a precise drop position, and reposition existing nodes by dragging.
- Typed property editors + inline binding validation from the **`__contract__`** action.
- The two IDE hosts: IntelliJ JCEF FileEditor, then a VSCode extension (CustomTextEditorProvider). Both
  implement the `MessageHost` protocol already stubbed in `src/host/hostBridge.ts`.

See the `project-visual-builder` design note for the full plan and the 2026-08-10 cross-IDE pivot.
