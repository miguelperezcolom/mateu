# Mateu v3.0.0 — release notes (DRAFT)

> Draft for the maintainer. Use for `gh release create v3.0.0-RC1 --notes-file …` (RC) and then
> `v3.0.0` (GA). Edit freely — in particular the **stability policy** wording below is a maintainer
> decision, stated conservatively here.

Mateu is a **model-driven UI system**: declare the model once — as code (Java/C#/Python), as data
(YAML) or in the visual builder — and Mateu renders it across web and native, backend-driven at
runtime or shipped as a static bundle. v3.0.0 is the first General Availability release of the v3
line, closing the `v3.0-alpha.*` series.

## Supported surface

| | |
|---|---|
| **Producers** | Java (Spring MVC · WebFlux · Micronaut · Quarkus · Helidon MP), .NET (ASP.NET), Python (FastAPI) |
| **Web renderers** | Vaadin (`vaadin-lit`), Oracle Redwood / Visual Builder (`redwood`) |
| **Native renderers** | React Native (iOS/Android), IntelliJ plugin |
| **Authoring** | code-first `@UI`, data-first YAML mounts/routes/sources, the visual builder (preview) |
| **Delivery** | backend-driven, or a **static bundle** served from any CDN with no backend |

The single honest snapshot of what each producer and renderer supports is the
[feature parity matrix](/reference/parity/) — every ✅ is backed by a test or a probe.

**Preview (not covered by the GA promise):** the Figma design-to-code pipeline, the VS Code
extension, the visual editor.

## Highlights of the 3.0 line

- **One declaration, many renderers** over a stable wire (`/mateu/v3/sync`); any producer serves any
  renderer.
- **Archetypes** for whole pages (Dashboard, CollectionDetail, Foldout, HeroSearch, Wizard, Calendar,
  Gantt, Planning board, …) and layout **inference** (`@AutoLayout`/`@AutoPage`).
- **CRUD & listings** with capability interfaces, smart-search filters, inline editing, drawers,
  aggregates, optimistic locking, bulk actions.
- **External REST** consumption (`@RestOptions`/`@RestData`/`@RestListing`/`@RestAction`) with a named
  **source catalogue** and a server-side **proxy** mode that injects secrets.
- **Accessibility** and **slow-network resilience** built into the generator (web and native).
- A shared **wire-conformance corpus** run by every producer's CI, so parity fails loudly.

## Known edges (honest)

- **Multi-value `optionsSource`** resolves on single-select fields; the one-to-many case
  (`multiSelect`/`listBox`/`combobox`) is deferred (see the parity matrix, "Fetch-plan edges").
- **VB/Redwood** resolves REST sources ref-native, not via the shared catalogue (by design).
- A few **in-page orchestration** behaviours (`@GroupAction`, embedded-island refinements, wide-field
  auto-colspan) and the runtime-assembled proxy `RestSourceSupplier` are **Java-only by design** — see
  "Deliberately Java-only" in the matrix.

## Migrating from `v3.0-alpha.*`

- Bump the Mateu dependency version to `3.0.0`. There is **no API change** from the last alpha; GA
  simply drops the `-alpha` qualifier.
- **Stability policy (maintainer to confirm):** the wire model and the public annotation/authoring
  surface are intended to remain compatible across the `3.x` line; breaking changes wait for `4.0`.

## Verifying the release

- Artifacts publish to Maven Central under `io.mateu:*:3.0.0`.
- A fresh project scaffolded with the Maven archetype and pointed at `3.0.0` builds and boots (the
  progressive demo suite under `demo/` is the reference — `demo/README.md`).
