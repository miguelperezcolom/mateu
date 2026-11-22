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

Primer installs on its own (it is excluded from the monorepo workspaces, so its dependencies never
touch the shared lockfile the Vaadin bundle is checked against):

```bash
cd frontend/web/monorepo/apps/primer
npm ci --ignore-scripts
npm run dev                                          # http://localhost:5180 → backend on :8080
MATEU_BACKEND=http://localhost:8640 npm run dev      # another backend (here the explorer)
```

The dev server proxies every path that is not vite's own to the backend; a page load stays here,
so deep links boot the renderer. An app mounted under a path: `http://localhost:5180/shell-rail?baseUrl=/shell-rail`
(dev server only; a served page names its mount itself).

## Package it

`npm run copy` typechecks, builds, writes `THIRD-PARTY-LICENSES.txt` and copies the result into
`backend/shared/frontend/primer/src/main/resources/static` — the `io.mateu:mateu-primer` jar (in
`mateu-bom`). An app uses it INSTEAD of `mateu-vaadin`:

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-primer</artifactId>
</dependency>
```

The served page is the usual Mateu page contract: the server fills the title, the favicon and the
`<mateu-ui baseUrl="…">` root, which this renderer only reads (it draws into its own root).
CI checks the bundle is fresh (`scripts/check-bundle-freshness.sh` — its sources include the RN
core), the licences (`check-frontend-licenses.mjs primer`), the notices and the typecheck.

## Where it stands (2026-11-22)

- **Explorer** (`demo/demo-explorer`, every component and behaviour page): 212/212 screens drawn,
  served from the jar as well as from the dev server. The only failures are the ones the pages
  provoke on purpose (a 403 role switch, a 401 secret, a 404 sample source).
- **Star Wars** (`demo/demo-starwars`, YAML only, a real REST API) and the **admin panel**
  (`demo/demo-admin-panel`, ~60 routes: check-in screens, drawers, wizards, foldouts, boards…) walked
  clean.
- Conformance (`e2e/conformance-fixtures.json`): Core, Standard and Full.
- Listings: server search, REST sources (in-memory or server-paged), filters with tokens, sort,
  groups + totals, cards / list, inline editing, row actions, drag to a drop zone, and the web
  renderer's URL contract (`searchText`, filters, `page`, `sort=field:direction`).

Known gaps:
- the app shell draws the menu only: context pickers, header actions, the notification bell, global
  search / command center, app shortcuts, live header values, the idle warning, FABs and the AI chat
  are not drawn yet; nor a theme toggle (the page follows the OS colour scheme);
- saved views and the column chooser; tree listings;
- CustomComponent has no registration mechanism; Bpmn / Workflow / FormEditor are read-only;
- the a11y and slow-network probes have not been run against this renderer yet;
- the bundle is one 1.8 MB chunk (0.5 MB gzipped): the catalogue is not split yet;
- a proxied REST call the THIRD PARTY refuses with 401 is shown as "session expired" (RN core rule,
  shared with the native app).
