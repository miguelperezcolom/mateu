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

| # | Increment | Status | Verify |
|---|---|---|---|
| 0 | **This design doc.** | ✅ #553 | — |
| 1 | `expandDefinition/expandComponent` — **bare-layout** case. Pure fn in `libs/mateu`. | ✅ #554 | vitest vs a server structural golden (`about.yaml`), default-tolerant. |
| 2 | **Specs mode wiring** — manifest ships raw `definitions`; `bundleStore.getExpandedIncrement` expands a definition-only route as the fallback in `AxiosMateuApiClient`. | ✅ #554 | vitest (store). |
| 7 | **Specs-bundle export** — `mateu:bundle` emits the RAW `definitions` (JSON) into `manifest.json` so a static site ships specs + the expander. Idea #10. **Reordered before display-component work: it unblocks the browser e2e (the true render-parity bar) and needs no unreliable golden.** | next | Java unit test (manifest carries definitions) + **browser e2e**: an `about`-style definition-only route renders client-side, no backend. |
| 3 | **Display-component coverage** — Card (content under `metadata.content`), sections, HeroSection, Notice, StatusList, nested containers. The per-type child-placement rules. | after 7 | **Java** goldens (see below) + browser e2e. |
| 6 | **Listing/CRUD from a definition + `sources` ref** (reuse `restSourceCatalogue`/`externalOptions`). The `demo-starwars` case — the highest-value declarative content. | after 3 | vitest + browser e2e vs an external API. |
| 8 | **Docs** — the three modes, the `viewModel`-less frontier, the zero-build loop. (Folds into Phase 9.) | last | — |
| ~~4~~ | ~~`layoutDelta` application~~ | **DROPPED** | `layoutDelta` (order/hidden/overrides) grows fields from a MODEL by inference — it only exists on a `viewModel` route (`delta-page.yaml` declares `modelView`). No model client-side ⇒ out of scope. A definition-only page declares its fields explicitly. |
| ~~5~~ | ~~Layout packing (`FormLayoutBuilder`)~~ | **DEFERRED** | Only needed if editable definition-only FORMS prove worthwhile; those bind `fieldId` to state that, without a `viewModel`, has no model behind it — likely a backend concern too. Revisit after the listing path. |

**Golden source — Java, not Python, for anything past trivial display components (learned building
increment 3).** Python's YAML→wire mapping is faithful for plain display layouts (`about.yaml`
matched byte-for-byte modulo defaults) but **diverges for richer components**: a bare `FormLayout`
definition comes back as a plain `VerticalLayout` (no `FormRow` packing, no `FormLayout` metadata),
where Java packs rows via `FormLayoutBuilder`. Java is canonical (the wire conformance corpus is
Java-generated; the ports are verified against it), so goldens for Card/sections/listings must be
captured from the **Java** harness (`TestMateu.sync` on a definition-only route), not the quick
Python path. (The authored key for a field's id is `id`; the wire renames it to `fieldId`.)

**Parity note:** the expander is **frontend-only** (`libs/mateu`), so it covers vaadin + every shell
at once — no .NET/Python port (those are backends; the whole point is *no* backend). The VB/Redwood
core (`apps/redwood/poc`) has its own transport; a VB twin of the expander is a later, optional
increment (VB is ref-native for sources and does not consume them yet).

**Browser-e2e finding — deep-linking a sub-route in bundle mode renders the app HOME, not the
sub-route (blocks the naive e2e; needs in-app navigation).** The exporter→manifest→expander data
path is proven end to end: `BundleDefinitionsTest` (server ships the raw definition), the
`expandDefinition`/`bundleExpander` vitest suites (client expands it), and — with REAL Maven tooling
— `mvn -Pbundle` on `demo-static-bundle` produces a `manifest.json` whose `definitions` carries the
authored layout. In a real browser the served bundle boots (assets + manifest 200, `mateu-ui`
mounts). BUT a **direct URL load of a sub-route** (`/info`, and even the pre-rendered `/about`)
renders the ROOT app's HOME content, not the sub-route — a pre-existing app-shell/bundle-mode
deep-link behaviour, independent of the expander (it reproduces on a pre-rendered route too). So the
browser e2e that proves the expander must drive **in-app navigation** — a menu leaf pointing at the
definition-only route, clicked — rather than a deep link, OR the bundle-mode deep-link path must
first be taught to load the addressed sub-route into the content slot. That is the next increment,
and it needs a **CI-wired static-serving Playwright project** (build the bundle → serve the static
dir with SPA fallback → navigate), since the e2e config has no `webServer` and starts SUTs by hand.
Until then the expander is verified by unit/integration goldens on both sides + the real-manifest
build, not yet by an in-browser render.

**Golden strategy — render-parity, not byte-parity (corrected after the first golden).** The first
golden (`about.yaml` → its increment) revealed the crux: the server fills **per-type defaults** when
it maps a fluent node to the wire (`VerticalLayout` gains `spacing:false`; `Text` gains
`container:"div"`, `noMargins:false`; etc.). Byte-parity would force the expander to carry a **fourth
copy** of every component's default field set (Java/.NET/Python already hold three) — exactly the
drift-prone triplication this project avoids elsewhere. So the bar is **render-parity**: the expander
produces the mechanically-mapped wire (ClientSide-wrap each node, `content`→`children`, carry authored
fields into `metadata`, build the envelope) and the RENDERER, which already defaults missing metadata,
paints an identical result. Verified two ways: (a) **structural vitest goldens** — captured from the
server (Python harness `SyncHandler.handle` on a definition-only route, or the bundle exporter) and
compared with a normalization that tolerates server-only default fields (asserting every AUTHORED
field is present and correctly placed); (b) **browser e2e** — the true bar: a definition-only route
rendered client-side looks identical to the same route served by the backend. If a specific default
turns out to be load-bearing (the renderer does NOT default it), that ONE field is added to the
expander's small explicit-defaults table, case by case, rather than mirroring all ~116 components.
