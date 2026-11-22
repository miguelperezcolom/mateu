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

## Where it stands (2026-11-23)

- **Explorer** (`demo/demo-explorer`, a page per component and behaviour): 207/207 screens drawn
  with no unsupported type, served from the jar as well as from the dev server; the one failing
  request is the 403 the permissions page provokes on purpose. All 114 wire types are drawn.
- **Admin panel** (24 routes: check-in screens with @Toc, drawers, wizards, foldouts, boards…),
  **Star Wars** (YAML + a real REST API, also as a static bundle) and the e2e SUT walked clean.
- Conformance (`e2e/conformance-fixtures.json`): Core 7/7, Standard 12/12, Full 4/4.
- `e2e/primer-a11y-probe.mjs` 26/26 (axe WCAG 2.2 AA on the SUT screens + skip link, landmarks,
  announcements, rejected save, overlay focus), `e2e/primer-slow-network-probe.mjs` 11/11,
  `e2e/primer-sign-in-probe.mjs` 16/16 (against a mock IdP).
- What it draws, beyond forms and the catalogue: the app shell in every variant (top bar, tabs,
  tiles, side nav, card menus, responsive below 768px) with @AppContext pickers, header actions,
  the notification bell, live header values, presence, theme toggle, Connect AI; the ⌘K palette and
  command center, app shortcuts with the `?` help, the idle warning, FABs, the assistant panel,
  access keys; the full page header (peer nav, record switcher, banners, @Toc, page width,
  @Compact); listings with every layout, saved views, column chooser, filters, totals, inline
  editing, drag, selector lookups, import; built-in sign-in; the chrome in en/es/fr/de/pt/it.
- Bundle: the entry is ~0.42 MB gzipped; display/status/visual families, markdown, the assistant,
  sign-in and the QR dialog are lazy chunks (the families preload when the browser is idle).

Known gaps:
- Bpmn is read-only (as on Vaadin, which uses bpmn-js's viewer); the form/workflow designers'
  texts are English (as on the web).
- Primer React's own strings ("Select rows", overflow "More items") and the texts the React Native
  core produces (toast actions, load failures) stay English.
- CustomComponent: an app registers a renderer with `window.MateuPrimer.registerCustomComponent`
  or defines a custom element of that name.
