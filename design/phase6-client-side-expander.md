# Phase 6 — JSON canonical + client-side expander + static site (#1, #10)

**Status:** in progress (design). Ideas #1 (JSON canonical + client-side expander) and #10 (static
site from the DSL) — #10 is #1 *made a deliverable*, so they land together. Sequencing per
`coherence-execution.md`; ideas in `coherence-plan.md`.

## What this phase actually adds (correcting the premise)

The costly step was never YAML→JSON parsing — it is the **spec→wire expansion** (route resolution →
`definition`→component tree → layout inference → data binding). Two JSONs must not be conflated:

- **(i) the authored spec** — `routes.yaml` / `sources.yaml` / a `definition` (layout + fields +
  actions + triggers), high-level.
- **(ii) the wire** — `UIIncrementDto` (`fragments[].component` = the expanded tree the renderer
  paints).

The renderer consumes (ii). Today the expansion (i)→(ii) runs in exactly two places, **both requiring
a JVM/.NET/Python process**:

1. **Backend-driven** — the server reads the spec live and answers the sync call. No build step, but
   needs a backend.
2. **Static bundle** — `MateuBundleExporter` (the `mateu:bundle` goal) pre-renders every route's wire
   at **build time** into `manifest.json`; the browser (`bundleStore.ts`) matches the route and serves
   the pre-rendered increment. No backend at runtime, but needs the export **build step**.

**The gap Phase 6 closes: neither is "edit a JSON, refresh, see it".** The client-side expander is a
THIRD mode — **specs mode** — that ships the raw authored specs (as JSON) and expands (i)→(ii) **in the
browser at runtime**: zero backend AND zero build. That is Idea #1's "10-second click" and Idea #10's
static site that is *authored data*, not a pre-baked artifact.

## The honest scope boundary (unchanged from the plan)

Client-side expansion works for the **100% declarative path**: a route with a `definition` +
`sources`, and **NO `viewModel`** class. A `viewModel` route runs server logic (reflection over a
model instance, validators, permissions, CrudStore/Listing binding) that cannot execute in the
browser — it still needs a backend. This frontier is clear and documentable. `demo-starwars` (already
100% DSL over an external API) is the poster child: today it needs the backend or the bundle build;
specs mode lets it run purely client-side from JSON.

**What has NO client-side substitute** (stays backend-only, by definition): model-instance reflection,
Java/.NET/Python datatype introspection, validator-annotation reading, permission checks
(`@EyesOnly`/`@ReadOnlyUnless`), and model property walks for CrudStore/Listing binding. A definition
that leans on any of these is a `viewModel` route and is out of scope for the expander.

## The authoring-sugar decision — DISSOLVED

The plan left open: "keep YAML as 1:1 sugar vs move hand-authors to JSONC/JSON5." It dissolves:
**JSON is a strict subset of YAML**, so a single `js-yaml` parse accepts BOTH a `.json` spec and a
`.yaml` spec. The expander operates on the **parsed object**, indifferent to source syntax. So:

- **Consumed = JSON** (the canonical, front-native form; what a specs bundle ships).
- **Authored = YAML or JSON or the visual builder** — all parse to the same object; no converter
  needed at runtime, `js-yaml` is the one reader.

No go/no-go required; no wire change; additive.

## What is REUSABLE client-side (already built) vs NEW

Reusable as-is (from the terrain map):
- **Route resolution** — `bundleStore.ts` `matchRouteEntry`/`applyRouteParams`/`matchBundledTemplate`
  (parameter precedence `fixed > path > client state > defaults`, static-vs-parameterized matching,
  `:param` extraction/injection). `toSyncPath` normalization.
- **REST sources** — `restSourceCatalogue.ts` (`resolveRestSource`, `pathOfField`, `totalPathOf`) +
  `externalOptions.ts` (`fetchExternalJson` with `${state.x}` interpolation, `mapItemsToRows`,
  `mapItemsToOptions`, `getByPath`). Data binding for the declarative path is **already done**.
- **Wire rendering** — `mateu-page.ts` + `renderComponent.ts` + the 100+ component renderers. The
  expander's output is a `UIIncrement`; rendering is unchanged.

New TS pieces (the expander), smallest→largest:
1. **Definition loading** — fetch a definition JSON/YAML by the route entry's `definition` path;
   `js-yaml` parse. (Route entry already carries `definition?`.)
2. **Bare-layout expansion** — a `definition` whose `layout:` is already a full component tree →
   wrap in a `UIIncrement` (one fragment, `component` = the layout tree). Plus page-level `actions:`
   and `triggers:` carried onto the envelope. **This is increment 1** (closest to identity; pins the
   plumbing + exact wire shape against a server-generated golden).
3. **Field synthesis + type mapping** — `dataType` (string/number/date/bool/…) → FormField
   `stereotype`; synthesize FormField components for a fields list. (TS twin of `FieldTypeMapper`.)
4. **`layoutDelta` application** — apply `order[]`/`hidden[]`/`overrides{}` to a layout tree.
5. **Layout packing** — row accumulation + colspan + separators (TS twin of
   `FormLayoutBuilder.buildRows`; intrinsically-wide stereotypes span the row).
6. **Listing/CRUD** — build a listing from a `definition` + a `sources` ref, reusing the REST source
   machinery above (TS twin of `PageListingBuilder` + `FilterLayoutSelector`).

## Increment plan (one PR each, test-first)

| # | Increment | Verify |
|---|---|---|
| 0 | **This design doc.** | — |
| 1 | `expandDefinition(spec, params) → UIIncrement` for the **bare-layout** case (+ actions/triggers on the envelope). Pure fn in `libs/mateu`. | vitest against a **server-generated golden** (a real definition-only route's increment) — byte-parity with the server expansion. |
| 2 | **Specs mode wiring** — load `routes.json`+`sources.json`, resolve a route to its `definition`, load+expand, hand to the renderer as the fallback when there is no pre-rendered increment and no backend. | vitest (specs store) + **browser e2e**: a definition-only route renders client-side, no backend. |
| 3 | **Field synthesis + type mapping** (`FieldTypeMapper` twin). | vitest golden per dataType. |
| 4 | **`layoutDelta` application.** | vitest golden. |
| 5 | **Layout packing** (`FormLayoutBuilder.buildRows` twin). | vitest golden vs server rows. |
| 6 | **Listing/CRUD from a definition + `sources` ref** (reuse REST machinery). | vitest + browser e2e against `demo-starwars`-style external API. |
| 7 | **Specs-bundle export option** — `mateu:bundle` can emit the RAW specs (routes/sources/definitions as JSON) alongside/instead of the pre-rendered increments, so a static site ships specs + the expander. Idea #10 deliverable. | build + browser e2e serving the specs bundle. |
| 8 | **Docs** — the three modes (backend / pre-rendered bundle / specs mode), the `viewModel`-less frontier, the "zero backend, zero build" dev loop. (Folds into Phase 9's rebuild.) | — |

**Parity note:** the expander is **frontend-only** (`libs/mateu`), so it covers vaadin + every shell
at once — no .NET/Python port (those are backends; the whole point is *no* backend). The VB/Redwood
core (`apps/redwood/poc`) has its own transport; a VB twin of the expander is a later, optional
increment (VB is ref-native for sources and does not consume them yet).

**Golden strategy:** every expansion increment is pinned to a **server-generated golden** so the
client expander is provably byte-identical to what the backend would have produced for the same
definition. The server expansion is the spec; the TS expander is a faithful reimplementation, not a
new behavior. Goldens are captured via the core test harness (`TestMateu.sync` on a definition-only
route) or the bundle exporter, and checked into the vitest fixtures.
