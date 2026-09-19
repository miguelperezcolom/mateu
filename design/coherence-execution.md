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
  - **`@Size` explicit override** (#510): `@Size(hug|fill|fixed)` on a view sizes its whole surface;
    full parity Java/.NET/Python.
  - **`ResponsiveGrid` — the one responsive grid (#9)** landed (#511) + **full parity** (#512) +
    **per-child column spans** (#513): `data.ResponsiveGrid` with `GridTrack` columns (a track's size
    IS the #8 intent: hug=auto, fill=1fr, fixed=len), a DS-neutral CSS-grid renderer, YAML-authorable,
    browser-verified (`layout-sizing.spec.ts`).
  - **First model consolidation — Dashboard → ResponsiveGrid** (#517): the Dashboard archetype (and
    `@AutoPage`-inferred dashboards) emit a `ResponsiveGrid` instead of `DashboardLayout`; full parity;
    browser-verified. `DashboardLayout` the DTO stays (direct + Welcome use); this consolidated the
    archetype's EMISSION. It fit cleanly because a dashboard's responsive case is `auto-fit` (which
    CSS grid does natively) and its fixed-N case never collapsed (grid = faithful).
  - **Architectural decision — zones + form-columns are BLOCKED on responsive breakpoints, and that
    is correct.** `@Zones` renders as **flex-wrap** (ratio 64/36 on desktop AND stack-below-min on
    mobile); the auto-responsive **form layout** likewise collapses columns on narrow. Neither fits a
    RIGID CSS-grid `grid-template-columns` — one inline template cannot both keep a fixed ratio and
    collapse, so a naive migration REGRESSES mobile. The two non-answers were rejected: forcing a
    rigid grid (regression) and bolting a flex-wrap mode onto `ResponsiveGrid` (two layout models in
    one component — muddies the abstraction). **The right home is a genuine responsive
    `ResponsiveGrid` (the plan's "responsive by breakpoints"): tracks per breakpoint / container
    queries**, a dedicated foundational piece. Until it lands, **flex-wrap stays the correct tool for
    ratio+wrap responsive columns** and zones is NOT migrated. So: consolidate what the grid natively
    fits (Dashboard done; equal-column/auto-fit layouts next), and build breakpoints before folding
    zones/form-columns on. This is "everything is expressible, but pick the right primitive per
    intent" — not "force one CSS mechanism on every layout."
  - **Next in Phase 3:** responsive breakpoints for `ResponsiveGrid` (the blocker), then zones +
    form-columns consolidate onto it; retire `measureFill` for the flex chain (visual-regression
    guarded).
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
  - **Next in Phase 2:** grow the verb set as demand pulls it (set / validate / callRest / branch /
    forEach), each with the interpreter + corpus once divergence becomes possible.
