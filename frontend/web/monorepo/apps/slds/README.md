# Mateu renderer for the Salesforce Lightning Design System — PREVIEW

Draws any Mateu UI served on the `/mateu/v3` wire with the **Salesforce Lightning Design System**
(SLDS 2, `@salesforce-ux/design-system`). Not affiliated with or endorsed by Salesforce.

## What "authentic" means here

SLDS is published as **blueprints**: markup plus the design system's CSS. Salesforce's own
implementation of them (Lightning Base Components) is not open source outside its platform, so this
renderer writes the blueprints itself, in React — the markup and classes of each blueprint, with
the keyboard and ARIA behaviour its documentation describes (menus, listboxes, combobox, datepicker,
modal focus trap, tabs, tree, data table). The rule is the one every Mateu design-system renderer
keeps: **SLDS decides** — its blueprint is used before anything is invented, and its look is never
restyled. The theme is SLDS 2's light theme (the open design system publishes no dark one), so
`@App(themeToggle)` draws no switch here (the Redwood renderer's rule).

| Mateu | SLDS blueprint |
|---|---|
| App shell | Global Header (logo, search, global actions, notifications) + Global Navigation (Context Bar: App Launcher, app name, navigation items, dropdowns) or Vertical Navigation |
| Page / record page | Page Header (record home), Cards, Tabs, Accordion |
| Listing | Data Table (sortable headers, selection, row header), list view controls (search, filters, columns, saved views), Pills for the applied filters |
| Form | Form Element with Input, Textarea, Select, Checkbox, Checkbox Toggle, Radio Group, Combobox (+ pills), Datepicker, Timepicker, Datetime Picker, Lookup |
| Wizard | Path (horizontal), Progress Indicator (vertical rail) |
| Dialog / Drawer | Modals / Panel (docked) |
| Messages / banners | Toast / Scoped Notifications |
| Empty state | Illustration |
| Menus, trees | Menus (dropdown), Trees |

## How it is built

- **The core is the React Native renderer's** (`@rn`), and the design-system-neutral half of the
  React renderers is shared with Primer (`@mr`, `frontend/web/react-renderer` — read its README:
  the contract this app implements).
- **The views are Primer's — ONE shared copy** (`frontend/web/react-renderer/views`, drawn with
  `@kit`). This app supplies the **SLDS kit** (`src/kit`, aliased `@kit` / `@kit/icons`): every name
  in `views/kit-contract.json` (Button, TextInput, Dialog, ActionMenu, DataTable…) drawn as the SLDS
  blueprint it stands for, with the interaction and ARIA written here. `src/kit/slds.css` loads
  SLDS's stylesheet and defines the contract tokens (`--fgColor-muted`, `--base-size-8`…) on SLDS's
  global styling hooks, so every colour and size the views use is the design system's.
- **Overrides** (`src/overrides/<path below views/>`, swapped in by `react-renderer/vite/overrides.ts`)
  only where SLDS's STRUCTURE differs: `shell/AppShell.tsx` (Global Header + Context Bar),
  `shell/Toasts.tsx` (Toast), `shell/header/BellButton.tsx` (the global action's notification
  badge), `shell/header/theme.tsx` (light only), `render/Box.tsx` (Card), `render/AccordionPanel.tsx`
  (Accordion), `render/fields/shell.tsx` (Form Element), `render/fields/ChoiceAnchor.tsx` (the
  combobox's faux input + pill group), `render/fields/native.tsx` (`NATIVE_RULES`: Datepicker /
  Timepicker / DatetimePicker),
  `render/catalogue/status/StepsTrack.tsx` (Path, vertical Progress Indicator). An override imports
  shared code through `@mr/views/…` and this app through `@app/…`. The AppShell override draws over
  the shared `useAppShell` / `ShellBand` (views/shell/appShellState.tsx). The vite config, `npm run
  copy` and the text lint are the shared ones (react-renderer/vite/rendererConfig.ts,
  scripts/package-renderer.mjs, scripts/chromeLint.ts).
- Icons: SLDS's utility sprite (`src/kit/icons.tsx` maps each icon the views use to one utility
  icon, explicitly).
- Texts: the shared tables, plus this renderer's own words in `src/i18n/sldsTexts.ts` (six languages,
  completeness test).

## Licences

- SLDS's code (CSS) is **BSD-3-Clause**.
- Its **icons and images are CC BY-ND 4.0**: they ship **unmodified** (the sprites whole, never
  recoloured or cut down), with the attribution and both licence files in the jar's
  `THIRD-PARTY-LICENSES.txt` (`CONTENT_LICENCES` in `scripts/frontend-deps.mjs`) and a section in
  the repository's NOTICE.
- **Salesforce Sans is not included**: its licence restricts it to apps built on the Salesforce
  platform. SLDS's stylesheet declares no `@font-face`; the text uses the system font stack.
- The app's own logo is shown, never SLDS's logo class (its default image is Salesforce's mark).

## Run it

It installs on its own (excluded from the monorepo workspaces — the shared lockfile is a Vaadin
freshness source):

```bash
cd frontend/web/monorepo/apps/slds
npm ci --ignore-scripts
npm run dev                                          # http://localhost:5201 → backend on :8080
MATEU_BACKEND=http://localhost:8640 npm run dev      # another backend (here the explorer)
```

## Package it

`npm run copy` typechecks, builds, writes `THIRD-PARTY-LICENSES.txt` and copies the result into
`backend/shared/frontend/slds/src/main/resources/static` — the `io.mateu:mateu-slds` jar (in
`mateu-bom`). An app uses it INSTEAD of `mateu-vaadin`:

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-slds</artifactId>
</dependency>
```

A CustomComponent is registered with `window.MateuSlds.registerCustomComponent(name, (props,
children) => window.MateuSlds.React.createElement(…))`, or by defining a custom element of that name.

## Where it stands (2026-11-23)

- Explorer (`demo/demo-explorer`): 206/207 screens clean, no unsupported type (the one failure is
  the 403 the permissions page provokes on purpose); admin panel 24/24; conformance Core 7/7,
  Standard 12/12, Full 4/4.
- `e2e/slds-a11y-probe.mjs` 26/26, `e2e/slds-slow-network-probe.mjs` 11/11,
  `e2e/slds-sign-in-probe.mjs` 16/16.
- First load: ~0.27 MB of JS + 0.12 MB of CSS (gzipped). SLDS's stylesheet ships whole: its
  per-component edition repeats the token block in every file and leaves the utilities out.

Known gaps: a Lookup opens a search popover rather than SLDS's inline lookup combobox; multi-select
is the multi-selection Combobox, not the Dueling Picklist; the Rich Text Editor and File Selector
fields keep the shared widgets with SLDS's form element around them; Bpmn is read-only.
