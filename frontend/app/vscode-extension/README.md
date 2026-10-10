# Mateu Visual Editor — VSCode extension

Opens Mateu visual-builder pages (`specs/ui/*.yaml`) in the **same** web visual editor as the
IntelliJ (JCEF) host — palette + WYSIWYG canvas + properties in one view. This extension is a thin
host: it wires the shared web bundle (`frontend/web/monorepo/apps/visual-editor`) into a VSCode
**Custom Editor**, seeds the open document, writes edits back, and runs a small CORS proxy so the web
app can reach the backend.

## Architecture

- **Custom Text Editor** (`mateu.visualEditor`) for `specs/ui/*.yaml`. The webview loads the shared
  bundle from `media/` (copied from the web app's `dist/`).
- **Bridge**: the web app's `HostBridge` speaks `acquireVsCodeApi()`, so no VSCode-specific code lives
  in the web side. The extension answers `ready`→`init{yaml,baseUrl}` and applies `save{yaml}` to the
  `TextDocument` (integrating VSCode undo/save); document edits push `externalChange` back.
- **Backend proxy** (`backendProxy.ts`): a loopback server that forwards `/mateu` + `/sse` to the
  configured backend with permissive CORS. The webview fetches it (`connect-src`), so the app runs
  unchanged with `baseUrl = http://127.0.0.1:<port>` — the same "no CORS" trick the JCEF host uses.

## Build & run

```bash
# 1. Copy the shared web bundle into media/ (builds the web app):
npm run copy:web

# 2. Install + compile the extension:
npm install
npm run compile      # or: npm run watch

# 3. Run: open this folder in VSCode and press F5 (Extension Development Host).
#    Or from a terminal:
#    code --extensionDevelopmentPath=$(pwd) /path/to/a/project/with/specs/ui
```

Then in the Extension Development Host: open a `specs/ui/*.yaml` file, and use **"Reopen Editor
With… → Mateu Visual Editor"** (the custom editor is registered with `priority: option`, so the YAML
text editor stays the default).

Configure the backend via the `mateu.baseUrl` setting (default `http://localhost:8594`). Any running
Mateu backend works — it exposes the reserved `__preview__` / `__contract__` actions.

## Schema validation

The extension contributes the Mateu `specs/ui` authoring schema through `yamlValidation`
(`**/specs/ui/**/*.yaml|yml`), so with the [Red Hat YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
extension installed every page, `routes.yaml` and `sources.yaml` gets completion and validation. The
schema is bundled at packaging time from the generated `backend/shared/uidl/specs-schema.json`. Without
the packaged copy (e.g. running from source before `npm run stage`), point a `$schema:` line or the
`yaml.schemas` setting at
`https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json`.

The extension activates only in workspaces containing `specs/ui/**/*.yaml|yml` files, or when the
Mateu visual editor is opened.

## New file (Mateu: New File…)

Right-click a folder in the Explorer (or run **Mateu: New File…** from the command palette) to create
a `specs/ui` file: a **UI mount** (`type: UI`), a **routes file** (`type: Routes`), an **app shell**
(`type: AppShell`), a **REST source catalogue** (`type: Sources`) or a **page** — for a page, pick
its template (form, listing/CRUD, wizard step, dashboard, smart search, to-do list, calendar, welcome,
hero search, collection detail, general overview, item overview, foldout, Gantt page, data
management, matrix grid, planning board, blank) and its page width. The file goes into the clicked
folder when it is inside `specs/ui`, else into the nearest `specs/ui` (or a new
`src/main/resources/specs/ui`).

The catalogue and skeletons are the IntelliJ plugin's (`intellij-plugin/src/main/resources/mateu/
new-file-kinds.json` + `fileTemplates/internal/*.yaml.ft`), staged into `templates/` at packaging;
running from source reads them from the plugin directly. The IntelliJ test validates every skeleton
against the specs schema; `src/newFiles.test.ts` pins the shared rendering rules here.

## Packaging & tests

```bash
npm ci
npm run compile
npm test            # vitest, headless — no VS Code instance needed
npm run package     # = vsce package; stages LICENSE, schema/ and media/ via scripts/prepackage.mjs
```

`media/` is built from the web workspace when it is installed; otherwise the bundle committed in the
IntelliJ plugin (`src/main/resources/visual-editor`, the same `dist/`) is used, so packaging works from
a clean checkout with no prompts.

## Status

First cut: renders + selects + edits + palette drag (pointer-based, shared with the JCEF host) + saves
to the document. The backend proxy is HTTP-only (demo backends are HTTP); add HTTPS if needed. Typed
property editors + `__contract__` binding validation are shared future work with the other hosts.
