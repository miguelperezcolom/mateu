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
- **Next:** Phase 1, first PR — audit the ~15 behavior annotations + the `FragmentListMapper` return
  dispatch, then introduce the unified trigger→action model additively (aliases), with tests.
