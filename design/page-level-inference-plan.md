# Page-level inference — design plan

**Status:** Fase 0 implemented (2026-07-21) · Fase 1 implemented for the dashboard rule
(2026-07-21) · remaining fase 1 rules + fase 2 pending

## Intent

Extend the Mateu thesis — *the developer declares only information; Mateu infers the UX* — one
altitude up. `@AutoLayout` infers the presentation of a **form** (fold optionals, sections→tabs,
small enums→radio). Page-level inference infers the **archetype**: a class that declares a
collection plus a detail *is* a collection-detail; one that declares metrics *is* a dashboard.
The developer should not have to know the archetype catalog to land on the right template —
that knowledge is exactly what "The Mateu Way" compresses into three questions, and what this
plan progressively moves into the framework itself.

## Why staged

Unlike form-level inference, picking an archetype changes the whole page composition, its wire
shape and its action surface (`selectCollectionItem`, auto-save triggers…). A wrong or unstable
guess here is far more disruptive than a folded optional. So the rollout copies the pattern that
made `@AutoLayout` safe: **deterministic rules, explicit always wins, stability made visible**
(cf. `LayoutInference.THRESHOLD_PROXIMITY_MARGIN`) — and it starts advisory-only.

## Fase 0 — `ArchetypeAdvisor` (implemented)

No behavior change: when a **plain reflected form** (no archetype base class, no explicit
`@PageTemplate`) structurally resembles an archetype, log a **one-time INFO hint** naming the
archetype and the doc page. Signals, deliberately conservative (strong shape, low noise):

| Signal on a plain form class | Hint |
|---|---|
| ≥ 1 `MetricCard` field (already stamps `pageType=dashboard` on the wire, but still renders as a form) | extend `Dashboard` — KPI band + panel grid |
| a `List` field annotated `@OnRowSelected` **and** ≥ 1 component-holder field (`Callable`/`Supplier`/`Component`) | extend `CollectionDetail` — list + detail pane with selection wired |

Explicit `@PageTemplate` silences the advisor (declared intent). One log per class per JVM.
Implementation: `ArchetypeAdvisor` (componentmapper), invoked from `PageTypeResolver.resolve`
at the two shape-fallback branches. Tests: `ArchetypeAdvisorTest`.

Deliberately **not** in fase 0: wizard-likeness (no reliable structural signal on a plain class —
step fields only look like steps once `WizardStep` is implemented, at which point the developer
already found `Wizard`), welcome-likeness (`Button` fields are common on ordinary fluent forms).

## Fase 1 — opt-in composition (`@AutoPage`)

An explicit opt-in annotation (page-altitude sibling of `@AutoLayout`; also enabled by the
`mateu.layout.inference` system property, same as forms) under which the fase-0 signals stop
advising and start **composing**: the mapper wraps the plain class into the matching archetype
composition at mapping time.

**Implemented (dashboard rule, 2026-07-21):** `@AutoPage` (uidl, composable) + `PageInference`
(componentmapper decision table) + `InferredDashboard` bridge (orchestrators/dashboard) hooked in
`ReflectionUiIncrementMapper.map` right after the adapter substitution — the same instance-bridge
pattern as `AdaptedComponentTree`. The `Dashboard` archetype's composition was extracted into
`DashboardComposer` so subclassing and inference share one implementation (archetype behavior
asserted unchanged by `ArchetypesSyncTest`). The bridge advertises the model as `serverSideType`
(actions keep routing to the model class) and carries `@PageTemplate(DASHBOARD)` (correct wire
`pageType`); `ArchetypeAdvisor` stands down for classes the inference composes. Only
fully-derivable archetypes compose — shapes needing undeclared suppliers (CollectionDetail's
id/title functions) stay advisory. Tests: `AutoPageSyncTest`.

- Decision table in one class (`PageInference`), mirroring `LayoutInference`: reference
  implementation for the ports, thresholds as constants, javadoc'd rules.
- **Explicit always wins**: any archetype base class, `@PageTemplate`, or explicit layout
  annotations that conflict → inference steps aside.
- **Stability**: same proximity-warning mechanism as `LayoutInference` for any counted
  threshold; flips are impossible below the explicit opt-in.
- Wire: composition only — reuse the existing DTOs the archetypes emit today. No new wire types,
  so every renderer works unchanged.
- Candidate rules, in order of confidence: MetricCards→Dashboard, grid+`@OnRowSelected`+holder→
  CollectionDetail, single big read-only entity+peers→GeneralOverview.

## Fase 2 — ports and tooling

- Port the `PageInference` table to C#/Python once the Java rules survive a release (same
  lockstep contract as `LayoutInference`).
- `mateu layout diff` (CI tool) grows a page-level mode: report archetype flips between
  commits. Complements the runtime proximity warnings.

## Relation to "The Mateu Way"

The golden path doc teaches the human the three questions (family → archetype → refine). The
`mateu-screen` skill automates them conversationally at scaffold time. This plan is the third
leg: the framework itself recognizes the family from the declared information at runtime —
advice first (fase 0), composition under opt-in later (fase 1). All three legs share the same
six-family taxonomy that `PageTypeResolver` already stamps on the wire.
