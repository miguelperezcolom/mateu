# Renderer verification harness

How to render any frontend renderer (`vaadin`, `sapui5`, `slds`, `redwood-oj`, `redhat`)
against a real Mateu backend and screenshot it — to *visually* confirm a renderer draws
correctly in its design system, not just that it compiles.

## TL;DR — the script

```bash
# e2e/verify-renderer.sh <app> <route> [output.png] [sutPort]
e2e/verify-renderer.sh slds /sections
e2e/verify-renderer.sh sapui5 /field-types /tmp/sapui5-fields.png
e2e/verify-renderer.sh redwood-oj /tabs
e2e/verify-renderer.sh redhat /stereotypes
e2e/verify-renderer.sh vaadin /catalog-read-only
```

It (1) starts the SUT (`mvc-app1`) on port 8091 if it isn't already up, (2) temporarily
points the renderer's dev server at the SUT (patches `baseUrl` in `index.html` and adds a
`^/.*/mateu/v3` proxy to `vite.config.ts`, with backups), (3) runs `yarn dev`, screenshots the
route with `screenshot.mjs`, then (4) **restores the app's files**. The output PNG path is
printed; open it to inspect.

Prerequisite — the SUT must be built once:

```bash
(cd e2e/sut/modules/sample1 && mvn -q install)
(cd e2e/sut/apps/mvc-app1 && mvn -q -DskipTests install)
```

## What the harness is (and why)

A renderer is a Vite app under `frontend/web/monorepo/apps/<app>` that registers a
`*ComponentRenderer` and emits its design system's markup. To see it render you need a
backend serving the Mateu API. The SUT `mvc-app1` exposes **per-route controllers**
(`/sections/mateu/v3/...`, `/field-types/mateu/v3/...`, …), one per `@UI` class in
`e2e/sut/modules/sample1`, so any of those routes is a self-contained screen to verify.

Pieces:
1. **Backend** — `mvc-app1` on `:8091`.
2. **Dev server** — `yarn dev` of the renderer app → `:5173`.
3. **Proxy** — `vite.config.ts` forwards `/<route>/mateu/v3` to `:8091`; `baseUrl` on the
   `<mateu-ui>` element selects the route.
4. **Screenshot** — `node e2e/screenshot.mjs --url http://localhost:5173/<route> --wait-for mateu-ui`.

## Good SUT routes to screenshot

`/sections` (form sections), `/field-types` (every field type), `/stereotypes`
(email/password/textarea/radio/toggle + a button), `/tabs`, `/accordion`, `/zones`,
`/catalog-read-only` (CRUD list: table + filter bar + pagination).

## Manual steps (if you don't use the script)

1. Start the SUT: `java -jar e2e/sut/apps/mvc-app1/target/mvc-app1-1.0.0-SNAPSHOT.jar --server.port=8091`
2. In the renderer's `vite.config.ts` add a proxy entry routing the API to the SUT:
   - object-style proxy (`proxy: { ... }` — sapui5/slds/redhat/redwood-oj):
     `'^/.*/mateu/v3': 'http://localhost:8091',`
   - `Object.fromEntries([...])` style (vaadin): add `'^/.*/mateu/v3'` to the path array and
     point its `target` at `8091`.
3. Set the `<mateu-ui baseUrl="/<route>">` in `index.html`.
4. `yarn dev`, then `node e2e/screenshot.mjs --url http://localhost:5173/<route> --wait-for mateu-ui --settle 6000`.
5. Revert the `index.html` / `vite.config.ts` edits.

## Per-renderer notes / gotchas

- **vaadin** — proxy is `Object.fromEntries([...paths].map(p => [p, {target, bypass}]))`;
  it is the reference renderer (the shared lib renders Vaadin by default).
- **slds** — global CSS framework (SLDS 2 Cosmos). Renders in light DOM (`setUseShadowRoot(false)`);
  the big `slds2.cosmos.css` can take a moment, so use `--settle 6000`+.
- **sapui5** — SAP UI5 web components (`oj`/`ui5-*`); renders fine; CRUD list verified on
  `/catalog-read-only`.
- **redwood-oj** — Oracle JET. The OJ cookbook shell bootstraps `oj-c-*` via require.js and
  hides `#page-container` until init. `<mateu-ui>` is mounted inside `#ui-container`
  (committed). `oj-c-*` come from the vendored `public/oj-c/*` AMD modules, not npm — so a
  "bypass" page without the cookbook bootstrap won't define them.
- **redhat** — PatternFly/RedHat elements (`rh-*`) + RedHat Display typography.

## CI

The release workflow (`.github/workflows/buid-and-publish.yml`) builds the renderer fronts
(`npm run copy`) for vaadin/sapui5/slds/redhat and deploys; it does **not** screenshot. This
harness is for local visual verification.
