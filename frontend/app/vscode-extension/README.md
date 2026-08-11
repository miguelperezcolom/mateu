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

## Status

First cut: renders + selects + edits + palette drag (pointer-based, shared with the JCEF host) + saves
to the document. The backend proxy is HTTP-only (demo backends are HTTP); add HTTPS if needed. Typed
property editors + `__contract__` binding validation are shared future work with the other hosts.
