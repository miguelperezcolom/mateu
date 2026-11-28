# Mateu renderer for SAP Fiori (UI5 Web Components) — PREVIEW

Draws any Mateu UI served on the `/mateu/v3` wire with **SAP's UI5 Web Components**
(`@ui5/webcomponents`, `-fiori`, `-icons`, through `@ui5/webcomponents-react` — all Apache-2.0) and
the **Fiori floorplans**, in SAP's Horizon theme (light, dark, high contrast). Fiori *elements*
(SAPUI5 + OData) is not used: Mateu is the model; the Fiori guidelines decide how it is drawn.
Design: `design/renderers/nuevos-renderers-2026-11.md` (§4).

## How it is built

- **The core is the React Native renderer's** (`@rn`), and the design-system-neutral half plus the
  VIEWS are shared with Primer and Salesforce: `frontend/web/react-renderer` (`@mr`; read its
  README, "The views and the kit"). This app is only what is SAP's:
  - `src/kit` — the **UI5 kit**: the names the shared views compose with (Primer React's API,
    `views/kit-contract.json`) drawn with UI5 web components — a button is a `ui5-button`, a list
    of actions a `ui5-list`, a message a `ui5-message-strip`, an empty state a
    `ui5-illustrated-message`, a dialog a `ui5-dialog` with its footer bar; `src/kit/icons.tsx` maps
    the Octicon names onto SAP icons (each imported one by one). A modeless Drawer is a non-modal
    side panel (ui5-dialog is always modal). `src/kit/structural.tsx`: contract names only the
    overridden views use.
  - `src/tokens.css` — the **contract tokens** (`--fgColor-*`, `--bgColor-*`, `--base-size-*`…) as
    SAP theming parameters (`--sap*`), so every shared stylesheet follows Horizon and its variants;
    `src/ui5.css` — the few rules that address UI5 elements (docked drawers, the wizard nav).
  - `src/overrides` — the views where **a Fiori floorplan needs another structure**:
    `shell/AppShell.tsx` (shell bar), `shell/header/MenuNav.tsx` (side navigation / icon tab bar),
    `shell/header/theme.tsx` (setTheme / setLanguage), `shell/header/header.css`,
    `shell/MateuApp.tsx` (Fiori's confirmation dialog, IllustratedMessage boot failure),
    `shell/resilience/Resilience.tsx` (busy indicator), `render/PageRenderer.tsx` (object page
    header), `render/page/PageToc.tsx` + `page.css` (anchor bar), `render/CrudRenderer.tsx` (list
    report), `render/listing/DetailsTable.tsx`, `render/AccordionPanel.tsx` (ui5-panel),
    `render/catalogue/status/{progress,kpis,menus}.tsx` (wizard, analytical card, list),
    `render/catalogue/display/{activity,headers}.tsx` (timeline, breadcrumbs),
    `render/fields/{basic,choices,shell}.tsx` (rating, slider, colour / date range pickers,
    multi-combo box, ui5-label) and `render/fields/native.tsx` (date / time pickers, step input,
    combo box — the shared FieldRenderer's extension point).
  - `src/ui5` — modules only the overrides use (the lazy pickers chunk, the notification list, the
    profile menu); `src/i18n` — the SAP renderer's own words (six languages).
- **Nothing is fetched from SAP's servers**: the 72 font ships in the jar (`src/kit/fonts.css`,
  `setDefaultFontLoading(false)`); UI5's own texts follow the page's language (`setLanguage`).
- The core names this renderer in `X-Mateu-Renderer` (`ui5/<version> wire/<w>`).

## Run it

It installs on its own (excluded from the monorepo workspaces, `!apps/ui5`):

```bash
cd frontend/web/monorepo/apps/ui5
npm ci --ignore-scripts
MATEU_BACKEND=http://localhost:8080 npx vite --port 5194   # the e2e SUT
MATEU_BACKEND=http://localhost:8640 npx vite --port 5191   # the explorer
```

## Package it

`npm run copy` typechecks, builds, writes `THIRD-PARTY-LICENSES.txt` and copies the result into
`backend/shared/frontend/ui5/src/main/resources/static` — the `io.mateu:mateu-ui5` jar (in
`mateu-bom`). An app uses it INSTEAD of `mateu-vaadin`, and says `renderer: ui5` in
`specs/ui/project.yaml`. CI: licences (`check-frontend-licenses.mjs ui5`), notices, bundle
freshness (its sources include `@mr` and the RN core), typecheck, tests, and the `renderer-ui5` job
(the SUT served with the jar: `e2e/ui5-conformance-probe.mjs`, `ui5-a11y-probe.mjs`,
`ui5-slow-network-probe.mjs`, `ui5-sign-in-probe.mjs`).

## Where it stands (2026-11-23)

- Explorer: 207 screens, 206 clean (the one failure is the 403 the permissions page provokes on
  purpose), no unsupported type — from the dev server and from the jar. Admin panel 24/24.
- Conformance Core 7/7, Standard 12/12, Full 4/4; a11y 26/26, slow network 11/11, sign-in 16/16.
- Entry ~0.30 MB gzipped; the catalogue families, the pickers (SAP's calendar + locale data), the
  notification list, the profile menu and the Fiori illustrations load on demand.

Known gaps: the visual editor previews a `ui5` project with Vaadin; Bpmn is read-only (as on
Vaadin); a CustomComponent is registered with `window.MateuRenderer.registerCustomComponent`.
