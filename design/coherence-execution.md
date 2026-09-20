# Coherence plan — execution (pausable / resumable)

How we execute `design/coherence-plan.md` (14 ideas + 2 refinements). Long task, done in **phases we
can stop and resume**. The **task list is the live state** (phases = tasks #8–#16); this doc is the
sequence, the rules, and each phase's done-criteria. We **stay on alphas** — GA stays paused until the
maintainer says.

## Execution rules (every phase)

1. **Additive-first.** Introduce the new (unified) model alongside the old; keep old annotations/keys
   as **deprecated aliases**. Breaking removals come last, deliberately. Nothing that works today
   breaks silently.
2. **Small PRs, gated.** Each phase is several small PRs. Gate: **backend + port suites green**, the
   **conformance corpus** (wire, and later flow) holds, and CI (`backend-tests` + `e2e`) is green.
3. **Tests are mandatory, per phase** (maintainer directive): **unit tests** for new logic in every
   backend/lib touched, **e2e** (Playwright, renderer-agnostic where possible) for user-visible
   behavior, and a **conformance case** where cross-producer or cross-renderer parity is at stake. A
   phase is not done without them.
4. **Verify independently.** I re-run the suites + inspect diffs myself (no trusting a green report);
   corpus goldens stay frozen; normalisers/soft-passes untouched unless a reviewed change.
5. **Alpha per meaningful increment.** Cut an alpha when a phase (or a shippable slice) lands.
6. **Full parity.** Java + .NET + Python for wire-level work; Vaadin + (where feasible) the other
   renderers for UI work — env-gated renderer/native verification is documented, not faked.
7. **Surface the forks.** Breaking/philosophical decisions (vocabulary renames, flow grammar, template
   set, back-compat policy) get a sensible reversible default + a note; the maintainer can course-
   correct at any checkpoint.

## Resume protocol

- **Where are we?** = `TaskList` (the phase tasks) + the merged PRs on master + the latest alpha.
- Each phase task carries its scope; sub-steps land as PRs referencing the phase. To resume: read the
  in-progress phase task, check its merged PRs, continue its next PR.

## The sequence (dependencies respected, risk + verifiability first)

| Phase | Task | Covers | Depends on | Done when |
|---|---|---|---|---|
| **1. Behavior core** | #8 | #2 trigger→action, #4 return=4 effects, R1 abstract bus | — | one trigger→action model + the 4-effect return, old annotations aliased, unit+e2e+conformance green, alpha |
| **2. Flow language v0** | #9 | #3 Rule→Step, bounded verbs+Expr, 1st interpreter + flow corpus | 1 | a bounded flow runs (web) with a flow conformance corpus; unit tests; alpha |
| **3. Layout system** | #10 | #8 sizing hug/fixed/fill, #9 one responsive grid | — | one grid unifies form-cols/zones/dashboard; sizing works; e2e on Vaadin; alpha |
| **4. Screen model** | #11 | #7 template+slots, archetypes→templates | 3 (grid) | archetypes are templates (data), inference default; e2e + conformance; alpha |
| **5. Vocabulary** | #12 | #5 App/Route/Screen/DataSource, R2 App≠Home | 1–4 stable | renames with deprecation aliases; R2 split; suites green; alpha |
| **6. JSON + expander + static** | #13 | #1 JSON canonical + client expander, #10 static site | 3–5 | declarative path renders client-side, no backend; a static demo; e2e; alpha |
| **7. Tables + business + custom** | #14 | #6 rich cols/cell-as-component, #13 business-in-data, #14 custom | 3,6 | 3 rich patterns + cell-as-component; named business component in data; custom-component per-renderer + degradation; tests; alpha |
| **8. Seeds** | #15 | #11 compile-without-renderer, #12 visual builder | most | explored with the maintainer |
| **9. Docs (final)** | #16 | rebuild docs around the model + honesty matrix | 1–7 | the 10-second click + golden path + one mental model + escape hatches, all reflecting the consolidations |

## Cross-cutting principles (the "feel", from the plan)

Everything is a component · inferred by default, explicit as override · one model expressed as data
(JSON) · client-side-capable (with/without backend) · escape hatches explicit and relegated.

## Status

- Plan captured (`coherence-plan.md`, merged). Execution scaffolding up (this doc + tasks #8–#16).
- **Phase 1 (behavior core): done.** trigger→action already existed (fluent `Trigger` refs an
  `Action` by id; `Action` carries confirm + effects); #4 default "unrecognized return → render as
  UI" already implemented via the `FragmentListMapper` fallback (pinned by `ReturnRendersAsUiSyncTest`);
  R1 (abstract event bus) is the existing `@SubscribeTo`/`@Emits` pair.
- **Phase 3 (layout: sizing + grid): in progress.**
  - **Sizing intent** (#507, PR A): a component declares `hug` / `fill` / `fixed:<len>` as portable
    data (`ClientSideComponentDto.sizing`); a listing infers `fill`; the web applies it to the
    component's host via the pure `applySizing` helper (`SizingSyncTest`, `sizing.test.ts`).
  - **Viewport-height flex chain** (PR B): the content `mateu-ux` is now a flex COLUMN — the missing
    link that lets a `fill` child (a listing's mateu-component: `flex:1 1 auto;min-height:0;overflow:auto`)
    take the remaining height and scroll internally instead of pushing the page. Verified with a real
    browser + SUT layout e2e (`e2e/tests/renderer/layout-sizing.spec.ts`, 3 checks: the ux is a flex
    column, a listing does not overflow the page, a form still renders) + the smoke suite as a
    regression guard (5/5).
  - **Finding — the listing already fills via a JS hack.** `mateu-table-crud` has a `measureFill`/
    `trimOverflow` mechanism (measures `100dvh - insets` and sets an explicit box height) — exactly
    one of the ad-hoc hacks #8 wants to retire. PR B did NOT rip it out (it works; verifiable only
    visually) — it establishes the declarative flex chain alongside it. **Follow-up:** retire
    `measureFill` in favour of the pure flex chain, once it can be visually regression-tested across
    all list layouts (table/list/cards/masterDetail).
  - **Next in Phase 3:** explicit `@Size` override + broader inference (form→hug, sidebar→fixed) with
    .NET/Python parity; then the unified responsive grid (#9) where a track's size IS the sizing
    intent (hug=auto, fixed=px, fill=fr).
- **Phase 2 (flow language v0): in progress.**
  - `Step` value model (#503): sealed v0 verbs (`Navigate`, `Emit`, `CloseOverlay`, `RunAction`,
    `MarkClean`, `MarkDirty`), each lowering 1:1 to an existing `UICommand` (`StepTest`). Bounded on
    purpose — not a programming language.
  - **Returned flow** (#504): a ModelView method may return a `Step`/`List<Step>`; each lowers to its
    wire command; a returned step is behavior, not a view. **Full parity** Java (`CommandMapper`/
    `FragmentListMapper`), Python (`FlowStep`), .NET (`FlowStep`) with unit tests. One server
    round-trip (the method runs, then the commands apply).
  - **Declared flow** (this PR): a fluent `Action` carries `steps`, lowered on the server to
    `ActionDto.commands` (reuses `UICommandDto` — no new wire family, no schema regen); the frontend
    runs them with its existing command applier via the pure `runDeclaredFlow` helper, **no server
    round-trip**. Java + web (`ActionFlowSyncTest`, `actionFlow.test.ts`).
  - **Documented fork — declared-flow authoring on the ports.** The user-visible capability (run a
    flow) has full parity via the RETURNED flow (#504, all three backends). The zero-round-trip
    DECLARED-on-action variant is Java + web for now because the ports have no fluent Action-with-
    steps authoring surface (their actions are attribute/decorator methods; a structured `steps`
    list does not fit an attribute). A port developer reaches the same OUTCOME today by RETURNING a
    flow (one round-trip). Giving the ports the zero-round-trip authoring path is a follow-up that
    needs a fluent `ActionsSupplier` surface — a capability add, not a wire mirror, so it is not
    smuggled in as a dead `commands` field on the port DTOs.
  - **Deferred — the flow conformance corpus** waits until the flow model grows past 1:1-command
    verbs: the corpus harness only does a route load, and for v0 the parallel unit tests already pin
    identical semantics.
  - **Handoff from the visual-editor thread (2026-09-19) — classless YAML `Action.steps` is NOT
    authorable yet.** The declared flow works from Java-fluent (`new Step.Navigate(...)`, no Jackson) and
    on the wire (lowered to `UICommandDto`), but a definition-only page cannot author `steps:` in YAML.
    Two causes: (1) the flow `Step` sealed interface (`io.mateu.uidl.fluent.Step`) is **not registered in
    `YamlUidlMapperFactory`** (only Component/Actionable/UserTrigger/GridContent/FieldValidation are), so
    Jackson can't deserialise the polymorphic verbs; (2) **name collision** — `io.mateu.uidl.data.Step`
    (the ProgressSteps item: id/title/description/status) already owns the `Step` schema `$def`, so the
    generated schema describes the wrong type and the flow verbs have no discriminated schema. To close:
    register the 6 verbs as `NamedType`s (+ `PolymorphicMixin` on `Step`) and disambiguate the two `Step`s
    in `UidlSchemaGenerator`. The visual editor's flow-editor slice waits on this; meanwhile it authors
    behaviour via the already-authorable `Rule`/`RuleLink` (`RunAction`) — e.g. a menu-leaf "Action".
  - **RESOLVED (2026-09-20, by the visual-editor thread).** The schema half turned out to already be in
    place — `UidlSchemaGenerator` auto-defines the polymorphic `Step` family from `Action.steps`, so
    `specs-schema.json` describes it with `type` discriminators (the collision only mis-describes the
    unrelated `uidl-schema.json` catalog entry, which nothing authors). The only real gap was runtime:
    `YamlUidlMapperFactory` now registers `PolymorphicMixin` on `io.mateu.uidl.fluent.Step` + the 6 verbs
    as `NamedType`s (mirrors the `Trigger` registration). `data.Step` (ProgressSteps item, a plain record)
    is a distinct class picked by the field's declared type, so no runtime collision. Pinned by
    `YamlDeclaredFlowSyncTest` (a classless `/yaml-flow` page whose `steps:` lower to
    `MarkAsClean`/`CloseModal`/`NavigateTo`). Full `shared/core` suite green (1071). **The flow-editor slice
    is now unblocked.**
  - **Next in Phase 2:** grow the verb set as demand pulls it (set / validate / callRest / branch /
    forEach), each with the interpreter + corpus once divergence becomes possible.
- **Phase 4 (screen model: templates + slots; archetypes→templates): done.**
  - **Template + named slots** (#523, ports #524): `ResponsiveGrid.template(id, areas, slotted)` +
    `Slotted(slot, content)` place children into a CSS `grid-template-areas` template — a Screen =
    Template + slots on the ONE grid. Wire `ResponsiveGridDto.gridTemplateAreas`; byte-identical
    across Java/.NET/Python; renderer places each slotted child in its named area and stacks the
    areas on a narrow container.
  - **Slot-level sticky** (#526): `ResponsiveGrid.stickyAreas` pins a named area (`position: sticky`)
    while the rest of the grid scrolls — a TEMPLATE property, so it lives on the grid beside the
    areas. This is what let the sticky two-region archetypes drop the bespoke ContentLayout.
  - **Archetypes → templates (all bespoke-layout producers retired):** CollectionDetail → `"list
    detail"` (#524), ItemOverview → `"keyinfo tabs"` + sticky slot (#526), Welcome highlights →
    ResponsiveGrid (#527, joining Dashboard #517), `@Aside` mechanism → `"main aside"` template
    (#529, wrapping each region in a stretch VerticalLayout since a named area holds one item). Each
    browser-verified on a live SUT.
  - **Consolidation complete + legacy soft-deprecated (#532):** `ContentLayout` and
    `DashboardLayout` now have ZERO producers — every screen layout flows through the one
    `ResponsiveGrid` (tracks, spans, named-slot templates, sticky slots, responsive stacking). Both
    are soft-deprecated (Java `@Deprecated(forRemoval=false)`, .NET/Python doc note pointing at
    `ResponsiveGrid`), kept authorable via YAML/fluent + their mappers for backward compatibility.
    Removing them (and their DTOs/mappers/schema) is a later cleanup once no consumer authors them.
- **Phase 5 (vocabulary: App/Route/Screen/DataSource + App≠Home): in progress.** Breaking renames,
  done as small ALIASED slices (old key keeps working, new canonical key wins). Decomposition:
  1. **`modelView` → `viewModel`** (#534): the ONE server class (state + actions) had two
     names — `RouteEntry.viewModel` (route side, already canonical) vs the definition YAML key
     `modelView:`. The definition envelope now reads **`viewModel:`** as canonical and keeps
     `modelView:` as a deprecated alias (`viewModel` wins if both present); schema emits both
     (`modelView` marked `deprecated`); the internal Java field/var names stay `modelView` (not
     user-facing — cosmetic churn avoided). `YamlModelViewSyncTest` pins that both keys bind
     identically. **Follow-up:** the visual editor still WRITES `modelView:` — have it emit the
     canonical `viewModel:`. (Landed on master via the visual-editor thread's `viewModelSync.ts`.)
  2. **`definition` → `layout`** (#535): the routes.yaml layout-file key. `layout:` is canonical,
     `definition:` a deprecated alias (`layout` wins). Full tri-backend parity (Java/.NET/Python all
     read `layout` → fall back to `definition`); the RouteEntry field / wire key stays `definition`
     (routes.yaml is parsed manually, so no wire change); schema advertises `layout` (canonical) +
     `definition` (deprecated) in routes-schema + specs-schema. A `help` route authored with `layout:`
     binds identically to `definition:`, pinned in all three.
  3. **`@UI`/`@App` → one "App" concept — DONE end-to-end (#549 Java, #550 ports).** `@App(route = "/shop")`
     declares BOTH that a class is an app AND its base path (design: `design/ui-app-reconciliation.md`,
     go-full approved). `@UI` stays the generic router; `@App(route)` wins when both are present; a
     value-less `@App` (chrome only) is unchanged — nothing that works today breaks. Wired through
     all four layers: the `@App.route()` attribute (uidl); the **annotation processors**
     (`MateuUIAnnotationProcessor` + the indexer now treat `@App(route)` as a routed class and
     generate its controller, deduped when a class carries both); the **runtime** route resolution
     (`RouteAnnotations.routeOf` + `RouteAnnotationMatcher`; `ViewTypeClassifier.isApp` recognises the
     `@App` annotation). Two non-obvious defects the design's "per-adapter risk" flag predicted, both
     found and fixed with browser verification: (i) `UISourceFileGenerator.createIndexController`
     hardcoded a dead `indexHtmlPath` default (`/index/index.html`) that only `@UI`'s annotation
     default (`/static/_index.html`) ever overrode — so an `@App`-only class served a nonexistent SPA
     index and never booted; defaults now match `@UI`'s. (ii) `AppHomeRouteResolver` types the home
     fragment by resolving the home route, and `RouteAnnotationMatcher.matches` only resolves a home
     route that lives UNDER the app's own mount — the fixture's cross-mount home was a test bug, not a
     product one (its own home Screen `AppRouteHomeScreen @UI("/appdemo/screen")` resolves cleanly).
     Verified: full core suite **1072 green**, `AppRouteSyncTest` (resolves + renders + two-paths rule),
     and the `app-route.spec.ts` e2e **passing in a real browser** — a real `@App(route = "/appdemo")`
     app (no `@UI`) is served (`<title>App route demo</title>`, `baseUrl="/appdemo"`) and mounts its
     distinct home Screen. **Ports DONE (#550):** .NET (`[App(Route = "/x")]`) and Python
     (`@app(route="/x")`) register by `app.Route ?? ui.Route` — reflective, no AP; .NET 385, Python 378.
  4. **retire "page" as an authoring term** (pending) — "page" is not an authoring keyword (only the
     wire artifact `PageDto`/`PageView`), so this is docs terminology; folded into Phase 9's rebuild.
  5. **R2 (App ≠ its Home Screen)** — split into (a) done, (b) pending, because unlike slices 1–2 it
     is a *behavioral* refactor of accreted routing logic (`AppHomeRouteResolver`, 154 lines of
     `_no_home_route`/`_page`/embedded-mediator/RemoteMenu special-cases across 10+ callers), NOT an
     alias. **(a) CHARACTERIZATION + concept (this slice):** `AppSyncTest.r2_*` pin the CURRENT wire
     behaviour — an app is served at its base path with a distinct `homeRoute`; the **conflation**
     that `homeServerSideType` is the APP class (not the home Screen's) is pinned as a named tripwire;
     an app with only `@Menu` items carries the `_no_home_route` sentinel (first-menu-item defaulting
     happens later in the resolver). Plus the conceptual statement in `yaml-app-shell.md` ("App is a
     shell + a reference to a Home; the App is not a Screen"). No behaviour change. **(b) REFACTOR —
     Java core DONE:** `AppHomeRouteResolver.getHomeServerSideType` now resolves the effective home
     route to the class that answers it (`RoutedClassResolver`, obtained via `MateuBeanProvider`);
     when that is a DIFFERENT routed class than the App, the home fragment is typed with the home
     **Screen's** class. The spike's correction held: **`_page` stays** (it is the content-slot fetch
     mechanism R2 wants); only the conflated *type* is fixed. Additive + safe — a single-screen app, a
     home with no backing Screen (bare menu link), or an unresolvable home keeps the App's own type,
     so it only de-conflates the case with a real distinct home Screen. Verified: full core suite
     **1070 green** (conformance goldens unchanged), the `r2_*` tripwires updated (a distinct home →
     Screen's class; a no-backing-Screen home → app class), wire confirmed
     (`/r2home` → `homeServerSideType=R2HomeScreen`, `serverSideType=R2App`), and **browser-verified**
     on a live SUT (the app chrome + the distinct home Screen's content in the slot) + a new e2e
     (`app-not-home.spec.ts`). **(b-ports) DONE (#543):** mirrored on .NET (`SyncHandler.RenderApp` →
     `registry.Resolve`) and Python (`render_app` → `registry.resolve` + `type_name`) — the resolution
     lives in the SyncHandler layer (which holds the registry), patching `homeServerSideType` after
     the mapper builds the app. Each has the mirrored `/r2app`→`R2Screen` fixture + test; .NET 384,
     Python 377 green. All three backends now emit the same R2 wire. **R2 is COMPLETE** except the
     deliberately-deferred menu-default case (type the first menu item), which needs the risky
     `_page`→real-route change the spike flagged. Remaining Phase-5 vocabulary work: `@UI`/`@App`
     reconciliation, and retire "page" as an authoring term (docs, folded into Phase 9).
