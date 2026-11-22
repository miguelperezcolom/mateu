# Mateu renderer for GitHub Primer — PREVIEW

Draws any Mateu UI served on the `/mateu/v3` wire with **Primer React** (`@primer/react`, MIT) —
the real Primer, not a theme over another design system. Design: `design/renderers/nuevos-renderers-2026-11.md` (§3).

## How it is built

- **The core is the React Native renderer's**, imported in place from
  `frontend/app/react-native/src` (alias `@rn`): `MateuSession`, `MateuViewController`, the api
  client, expressions, rules, the REST source catalogue, the listing helpers. Nothing is copied.
  Two core modules import `react-native` / `expo-*` (the screen-reader announcement, opening a
  downloaded file); those imports resolve to small web shims in `src/shims`.
- **The UI layer is new**, Primer React only: `PageHeader`, `PageLayout` + `NavList` (app shell),
  `FormControl` + inputs, `DataTable` / `Table.Pagination`, `Banner`, `Dialog`, `UnderlinePanels`,
  `Blankslate`… A wire type it does not draw yet is an explicit `<mateu-unsupported>`.
- The core names this renderer in `X-Mateu-Renderer` (`primer/<version> wire/<w>`, `setRendererName`).

## Run it

```bash
cd frontend/web/monorepo
npm install --workspace mateu-primer --ignore-scripts   # only this workspace
cd apps/primer
../../node_modules/.bin/vite                             # http://localhost:5180 → backend on :8080
MATEU_BACKEND=http://localhost:8595 ../../node_modules/.bin/vite   # another backend
```

An app mounted under a path: `http://localhost:5180/shell-rail?baseUrl=/shell-rail` (dev server only;
a served page names its base itself).

## Where it stands (spike, 2026-11-22)

Against the e2e SUT (`e2e/conformance-fixtures.json`): **Core 7/7, Standard 12/12, Full 3/4**
(no `Chart` yet). Verified in a browser: forms, validation (errors on the fields, focus on the first
one), actions + toasts, the CRUD cycle (open a row → its URL, back, New, save → the record), app
shell with menu and deep links.

Not done yet: packaging as `io.mateu:mateu-primer` (jar + CI build), listings fed by a REST source
(`rowsSource`), filters, the rest of the catalogue (charts, dashboards, wizard rail, kanban…), app
shell extras (context pickers, header actions, notifications, command palette), dark-mode toggle,
the a11y/slow-network probes, and the licence gate for this target.
