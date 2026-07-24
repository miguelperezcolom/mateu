# redwood — the Oracle Redwood renderer (OJET-native island)

A Mateu frontend renderer rebuilt from scratch against **real Oracle Visual Builder code**
(`.dev/vb`). It renders a Mateu backend as an authentic Oracle Redwood app using the real Oracle JET
components (`oj-c-*`, `oj-dynamic-*`) loaded from Oracle's public CDN.

## Why a rebuild

The two previous attempts (`redwood-oj`, `redwood-spectra`) both tried to run the real OJET runtime
(AMD/RequireJS + the `preact` binding provider) **inside** Mateu's shared Lit/shadow-DOM shell. Oracle
JET VComponents (`oj-c-*`) do **not** upgrade across a shadow boundary or in a slotted/disconnected
subtree, so every screen fought the shell (plain-`<button>` escape hatches, `window.__mateu*` global
smuggling, `setInterval` layout sync, double-mount bugs). This renderer removes that impedance at the
root.

## Architecture — the "OJET-native island"

- **Boots its own app.** It does NOT reuse any of Mateu's Lit shadow-DOM components (`mateu-app`,
  `mateu-page`, `mateu-component`, …). Everything renders in **light DOM**, so the real oj-c
  components upgrade cleanly under the body's `data-oj-binding-provider="preact"`.
- **Reuses only Mateu's non-visual core.** The proven pure-TS state machine — `MateuViewController`
  + `MateuSession` + `MateuApiClient` + `expressions` — is ported from the React Native renderer. It
  speaks the identical `/mateu/v3/sync` wire protocol, so the **backend needs zero changes**.
- **Shell chrome = Oracle's own CSS.** The app shell (header + nav rail) is plain HTML using Oracle's
  `oj-web-applayout-*` / `oj-flex-*` / `oj-typography-*` classes from the CDN `oj-redwood-min.css`
  (the Visual Builder dashboard example's markup). No OJET component / binding-provider dependency, so
  the chrome is bulletproof. The real oj-c / oj-dynamic components live only in the **content** area.
- **One owner of the AMD/ESM bridge.** `src/oj/runtime.ts` loads RequireJS + Oracle's bundle configs
  from the CDN and returns a typed `OjRuntime` via `ojRuntime.ready()` — no `window` globals.
- **The oj-c CSS is aggregated.** `src/oj/preactCss.ts` imports the FULL `@oracle/oraclejet-preact`
  style set (the per-component CSS is externalized from the CDN JS, so components upgrade but render
  unstyled without it — the piece the earlier attempts never fully solved).

## Layout

```
src/
  main.ts                 entry: reads the AP-injected <mateu-ui baseUrl>, boots MateuOjApp
  oj/
    runtime.ts            THE AMD/ESM bridge (RequireJS + CDN → typed OjRuntime)
    ojElement.ts          Lit directive: props-as-properties on oj custom elements
    preactCss.ts          aggregated oj-c component CSS (generated)
  core/                   ported pure-TS state machine (from the RN renderer)
    MateuApiClient.ts  MateuSession.ts  MateuViewController.ts  expressions.ts
  app/MateuOjApp.ts       shell owner + content controller + overlays
  views/
    shell/renderShell.ts  the Redwood app shell (header + nav + context selectors)
    renderComponent.ts    the wire-component dispatch
    renderView.ts         loading/error + entry
    fields/  leaves/  table/  layout/   per-DTO widgets (oj-c form controls, oj-dynamic-table, …)
```

## What renders

Forms (oj-c-input-text / -number / -select-single / -checkbox / -text-area), CRUD listings
(oj-dynamic-table), the full new/save/view/edit lifecycle, page action buttons (oj-c-button), tabs,
dashboards (scoreboard / metric cards / panels), hero/welcome pages, markdown, badges, meters,
avatars, notices, empty states, entity headers, status/bulleted lists, Dialog + Drawer overlays, and
the RDS page-width anatomy.

## Build / run

```
yarn                # from the monorepo root (installs @oracle/oraclejet-preact)
yarn dev            # vite dev on :5173, proxying /mateu to a backend (default :8595)
yarn copy           # build + copy assets into backend/shared/frontend/redwood-lit
```

A Mateu app serves this renderer by depending on the `io.mateu:redwood-lit` module (see
`demo/explorer`). The Oracle JET / Spectra / Dynamic UI runtime is loaded from the CDN at runtime —
never bundled.

## Known follow-ups

- Dark/light theme toggle, notifications inbox, and the command-center palette (opt-in `@App` flags)
  are not wired yet.
- Archetypes with a load-time record switcher (e.g. `GeneralOverview`) render the switcher; the
  overview panel loads on selection.
- Foldout lateral panels render stacked (no fold-out interaction yet).
