# Renderer conformance (parity) suite

Infrastructure to measure how close each web renderer (`apps/sapui5`, `apps/redhat`,
`apps/redwood-oj`, …) is to full parity with the reference renderer (`apps/vaadin`).

## The three pieces

### 1. Explicit "unsupported" placeholder

Non-vaadin renderers override only part of the shared render switch
(`libs/mateu/.../renderers/renderClientSideComponent.ts`, ~55 `ComponentMetadataType`
branches); anything else used to fall through to the shared Vaadin-flavoured components,
which look broken/inconsistent in other design systems — **silently**.

Now each renderer **declares** the set of types it supports:

- `ComponentRenderer.supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> | undefined`
  — `undefined` (the default, and what Vaadin uses) means "everything the shared switch
  supports", so the reference renderer's behavior is unchanged.
- `ComponentRenderer.rendererName(): string` — short name for diagnostics (`'sapui5'`, …).

Both are implemented with safe defaults in `BasicComponentRenderer` and overridden in each
app's `*ComponentRenderer` (the declared set = the types its own switch handles + the types it
deliberately delegates to shared design-system-agnostic infra such as `Crud` →
`mateu-table-crud`, which calls back into the renderer's own table/filter-bar/pagination).

When a type **outside** the declared set reaches the shared fallback
(`BasicComponentRenderer.renderClientSideComponent`), a visible placeholder is rendered
instead:

```
⚠ Component "Grid" is not supported by the "sapui5" renderer yet.
```

The placeholder is `<mateu-unsupported>` (`libs/mateu/.../renderers/unsupportedRenderer.ts`),
a bare custom element — no Lit base class, no design system, inline CSS in its own shadow
root — so it renders identically under any renderer and any shadow/light DOM setup. A
`console.warn` fires once per renderer/type pair.

**Programmatic registry**: `ComponentRendererSingleton.set()` publishes
`window.__mateuRendererInfo = { name, supportedTypes }` (`supportedTypes: null` = full
support). The conformance suite reads this to build the parity matrix; anything else
(a parity dashboard, CI checks) can too.

Design decision: the declaration lives on the `ComponentRenderer` instance (not in the
`default` of each subclass switch) because (a) the fallback point is single —
`BasicComponentRenderer` — so no subclass switch had to change shape, (b) the set doubles as
a machine-readable parity declaration, and (c) renderers that have not opted in yet (e.g.
`apps/slds`) keep today's behavior untouched.

### 2. Conformance suite (screenshots + parity report)

Fixtures: `e2e/conformance-fixtures.json` — ~23 routes of the e2e SUT
(`e2e/sut/modules/sample1` form/field/layout demos + `e2e/sut/apps/mvc-app1` CRUD/wizard/
master-detail classes), each annotated with the `ComponentMetadataType`s it exercises.

Runner: `e2e/conformance.mjs` (Playwright, same pattern as `e2e/screenshot.mjs`). For every
fixture route it screenshots the page, counts `<mateu-unsupported>` placeholders (Playwright
selectors pierce open shadow roots), detects blank pages, captures console errors, and reads
`window.__mateuRendererInfo`. Output per renderer:

- `e2e/conformance-report/<renderer>/report.json` — machine-readable
- `e2e/conformance-report/<renderer>/report.md` — parity matrix + per-fixture table
- `e2e/conformance-report/<renderer>/screenshots/*.png`

Wrapper: `e2e/conformance.sh` wires everything (same harness as `e2e/verify-renderer.sh`,
see `e2e/RENDERER-VERIFICATION.md`): starts the SUT if needed, temporarily patches the
renderer app's `index.html` (`baseUrl=""` so `<mateu-ui>` takes the route from the URL path)
and `vite.config.ts` (proxy → SUT), runs `yarn dev` on a dedicated port (5199), runs the
suite, restores the files.

## Running it

```bash
# once: build the SUT
(cd e2e/sut/modules/sample1 && mvn -q install)
(cd e2e/sut/apps/mvc-app1 && mvn -q -DskipTests install)

# per renderer (starts SUT on :8091 if not already running)
e2e/conformance.sh vaadin        # reference — expect 0 placeholders
e2e/conformance.sh sapui5
e2e/conformance.sh redhat
e2e/conformance.sh redwood-oj

# subset of routes / different SUT port
e2e/conformance.sh sapui5 8091 --routes /sections,/full-crud

# against an already-wired renderer (no patching), e.g. a dev server on :5173
(cd e2e && node conformance.mjs --base-url http://localhost:5173 --renderer vaadin)
```

Caveats:

- The wrapper edits the app's `index.html`/`vite.config.ts` while it runs (with backups,
  restored on exit). A dev server of the *same* app running at the time will hot-restart
  against the patched config for the duration of the run.
- `redwood-oj` bootstraps Oracle JET `oj-c-*` via require.js from vendored AMD modules; give
  it a larger `--settle` if screens come out half-initialized (see
  `e2e/RENDERER-VERIFICATION.md` for per-renderer gotchas).
- The `types` field in the fixtures file is informative (it feeds the matrix); the observed
  placeholders are the ground truth.

### 3. Unit tests

`libs/mateu/.../renderers/unsupportedRenderer.test.ts` covers the decision helper
(`isUnsupportedType`) and the placeholder template. Run with `yarn test` from
`frontend/web/monorepo` (or `libs/mateu`).
