# Renderer e2e strategy — validating every renderer (GA)

The question: can we e2e-validate that *everything* works — pages, routing, menus, form fields, CRUD,
wizards… — on **all four renderers** (Vaadin, Redwood/VB, IntelliJ, React Native)? This is the
honest assessment + the plan. Written 2026-09-13.

## Where we are today (measured)

| Renderer | Kind | Functional e2e | What exists |
|---|---|---|---|
| **Vaadin** (web) | Lit / web components | **Yes** | 16 shared Playwright specs × 5 Java backends (mvc/webflux/quarkus/micronaut/helidon) + 2 federation specs, in CI |
| **Redwood/VB** (web) | Oracle JET / VB | **No** | ad-hoc probes only (`vb-a11y-probe`, `vb-slow-network-probe`); a11y + slow-network, not functional |
| **React Native** (native) | RN / Expo | **No** | ad-hoc probes only (`rn-a11y-probe`, `slow-network-probe`) via expo-web |
| **IntelliJ** (desktop) | Swing | **No** | `renderProbe` (JVM: render a wire increment → assert the Swing tree); not a functional suite; SDK env-dependent |

Plus a screenshot-based **renderer-conformance harness** (`conformance.sh`, `conformance-fixtures.json`,
`RENDERER-VERIFICATION.md`) that serves a renderer's Vite dev server against the SUT and flags
`<mateu-unsupported>` placeholders to build a support matrix. It still references **retired** renderers
(sapui5, redwood-oj, slds, redhat) and is visual/support, not functional.

Also: the e2e matrix is **Java-only** on the backend. No .NET or Python backend is exercised through
any renderer in CI (the producer×renderer cell is untested — see `conformance-findings.md`).

## The two hard problems

1. **The functional specs are DOM-coupled.** The 16 shared specs assert on Vaadin's DOM
   (`vaadin-grid`, `vaadin-text-field`, …). Vaadin, VB (JET `oj-*`), RN (native views / RN-for-web
   DOM) and IntelliJ (Swing) render **completely different trees** for the same wire. A spec written
   against one does not run on another. So "run the same specs everywhere" needs either
   **renderer-agnostic selectors** (by role / accessible name / visible text / stable `data-*` hooks)
   or **per-renderer suites** (N× the specs).
2. **Each renderer needs a different headless driver + serving path.**
   - Vaadin: Vite dev server + Playwright (done).
   - VB/Redwood: Oracle **grunt** build (CDN tarballs) + JET DOM; Playwright-drivable once served, but
     the build is heavy/fragile and the DOM is different.
   - React Native: **expo-web** is Playwright-drivable (RN-for-web maps to DOM); a device farm would be
     needed for true native, but expo-web covers the render/route/field logic.
   - IntelliJ: **not a browser** — Playwright cannot drive Swing. Needs the `renderProbe` model
     (render wire → assert component tree / accessible names), extended to the feature catalogue.

## The plan (phased, honest about effort)

**Phase 0 — foundation (prerequisite for everything).** Rewrite the shared specs to
renderer-agnostic selectors: `getByRole`/`getByLabel`/`getByText` + a small set of stable
`data-mateu-*` hooks emitted by every renderer (page title, menu item, field by fieldId, grid row,
action button). One spec then expresses one behaviour independent of the design system. This is the
lever that makes multi-renderer e2e affordable instead of N×. Prove each rewritten spec still green
on Vaadin.

**Phase 1 — second web renderer (VB/Redwood).** Add a Playwright project pointing at a served VB
build of the SUT; run the agnostic specs. Surfaces the real VB functional gaps (the corpus already
shows the wire differs; this shows whether the VB renderer *handles* it). Gated by the grunt build
being reproducible in CI.

**Phase 2 — React Native (expo-web).** Add a Playwright project against expo-web of the RN app pointed
at the SUT; run the agnostic specs that apply (forms, routing, menus, CRUD). Native-only surfaces
(gestures) stay in RN-specific probes.

**Phase 3 — IntelliJ.** Extend `renderProbe` from a smoke check into a catalogue-driven suite: for
each conformance fixture, render the wire and assert the Swing tree has the expected fields (by
`mateu.fieldId` client property), menu items, actions, accessible names. Not Playwright — its own
JVM harness. SDK provisioning in CI to be solved.

**Phase 4 — producer×renderer.** Point at least one Playwright project at a **.NET** and a **Python**
SUT (same agnostic specs) so a non-Java backend is rendered end to end. Closes the last matrix cell.

**Phase 5 — wire it all into CI** with per-renderer conformance levels (core/standard/full), so a
renderer (or a port) fails on its own when it regresses.

## Honest verdict

- **Vaadin is genuinely e2e-validated** (5 backends, in CI). That is the one renderer we can stand
  behind today.
- "**Everything × all four renderers**" is a **multi-week QA-infrastructure program**, not a single
  task: it needs the agnostic-selector rewrite (Phase 0), three new serving/driving harnesses, and
  the producer×renderer cell — parts of which are environment-gated (Oracle grunt tooling, the
  IntelliJ SDK, expo). It is the right investment for a defensible GA claim, and this document is the
  plan to resource it.
- The cheapest first real win is **Phase 0 + Phase 1** (agnostic specs + VB), because both are web and
  Playwright-drivable. Recommend starting there, with the maintainer choosing renderer priority.

## What was NOT done (and why)

Not started tonight: the actual harnesses. Building three env-fragile serving paths (grunt, expo,
IntelliJ SDK) unattended overnight would most likely yield a half-working matrix that *reads* like
coverage without being it — the exact dishonesty this GA effort exists to prevent. The producer-axis
conformance work (25-case corpus, essentials diagnosis, the bool/boolean matrix fix) was completed and
committed instead; this document scopes the renderer axis for a maintainer-directed next session.
