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

**Phase 0 — foundation (prerequisite for everything). ✅ DONE (2026-09-13).** A renderer-agnostic
smoke suite exists at `e2e/tests/renderer/smoke.spec.ts` and runs as the `renderer-vaadin` Playwright
project (baseURL :8080 = mvc-app1). Five behaviours, all by SEMANTIC selectors (`getByRole` /
accessible name / visible text / page title), no `vaadin-*` tags: a page renders with its title +
content, routing resolves incl. SPA sub-routes, the app menu is navigable, form fields render
(including a **checkbox** for a boolean — the exact bool/boolean hole the corpus surfaced), and a
listing shows its rows. **5/5 green on Vaadin.** The same file is pointed at another renderer by
adding a project with a different baseURL — that is the whole point of the agnostic selectors.
- Two real findings while writing it: (a) standalone `@UI` pages (not under an `@App` shell) expose
  **no `main` landmark** (only app-shell pages do) — a small a11y gap worth closing; (b) the Vaadin
  listing exposes `role=treegrid` (not `grid`/`table`) — the agnostic selector accepts all three.

**Phase 1 — second web renderer (VB/Redwood). ⚠️ HARNESS BUILT, RENDER ENV-GATED (2026-09-13).**
Recipe that works: `cp e2e/sut/apps/mvc-app1 → mvc-app-vb`, swap the frontend dependency
`io.mateu:vaadin-lit` → `io.mateu:redwood` in its pom, set a free port. It **builds, boots, and serves
the VB shell**, and the browser **reaches Oracle's JET CDN** (`static.oracle.com/cdn/jet/…`, 4
requests, 0 failed). BUT the VB visual-runtime **does not paint the screen headless**: after 6 s the
`<mateu-ui>` transport has 0 children, the body is empty, and there are **0 ARIA roles** in the whole
document. So the agnostic specs all fail — not because VB lacks the features, but because VB does not
render at all in headless chromium here. **VB e2e is therefore gated on making the VB/JET bootstrap
complete headless** (timing, the visual-runtime's AMD/JET init, possibly a `vb-serve`-style dev host
rather than the static `_index.html` markers), not on the specs. That work is Phase 1 proper.

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

## Progress (2026-09-13)

- **Phase 0 done and green** — the renderer-agnostic smoke suite exists and passes on Vaadin (5/5),
  wired as the `renderer-vaadin` CI project. This is the reusable lever for every other renderer.
- **Phase 1 attempted, render env-gated** — the VB SUT harness works (builds/boots/serves/reaches the
  Oracle CDN) but the VB visual-runtime does not render headless, so VB functional e2e is blocked on
  the bootstrap, not the specs (concrete evidence above, upgrading the earlier "env-fragile" guess).
- **Phases 2–4 not started** — RN (expo-web), IntelliJ (renderProbe, SDK env-gated), and the
  producer×renderer cell remain, per the plan.

## What was NOT done (and why)

The three native/second-renderer serving paths (VB headless bootstrap, expo, IntelliJ SDK) are
env-gated and would, if forced unattended overnight, yield a half-working matrix that *reads* like
coverage without being it — the exact dishonesty this GA effort exists to prevent. Phase 0 (the
agnostic foundation) is done and verified; the rest is scoped here for a maintainer-directed session.
