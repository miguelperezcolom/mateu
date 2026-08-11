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
  (`decorateForPreview`). The renderer stamps `id=` on each DOM element, so a click maps straight back to
  a node path — no structural-alignment guesswork. Layout edits go through the `PageDoc` model, which
  serializes back to YAML.
- **Model of truth**: the YAML page file (`modelView` + `layout`). Behaviour/data stay in the Java
  ModelView. This editor edits *layout only*.

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
component to select it, edit its props on the right, add components from the left, use ↑/↓/Delete.

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
