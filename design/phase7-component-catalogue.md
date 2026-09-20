# Phase 7 / Idea #13 — Business components as a component catalogue (first-class in DATA)

**Status:** in progress (design). A *business component* is a reusable, BOUND composition of EXISTING
components (a shape + a data source + optional behaviour), named — e.g. an "agency selector" =
`dropdown + source(agencies)`. It is **not** a new rendering: it ports for free and runs with no
backend (#1). The code path already exists (semantic annotations + the REST source catalogue); the
gap is making it first-class **in data** — a named component definition, referenceable by name.

This is the exact twin of the REST source catalogue (#8/2026-08-19), so it is built by ANALOGY, not
invention. Every piece below has a working sibling to copy.

## The model (mirror the REST source catalogue, one-to-one)

| REST source catalogue | Component catalogue (this) |
|---|---|
| `RestSourceEntry(name, source…)` (uidl.data) | `ComponentEntry(name, component)` — name → a bound component tree |
| `RestSourceCatalog(List<RestSourceEntry>)` record, serialised in the manifest | `ComponentCatalog(List<ComponentEntry>)` — same shape, same `hasNoX()` accessor-naming gotcha |
| `@RestSource(name, url, …)` (repeatable, on any routed class) | `@BusinessComponent(name)` on a `@UI`-registered catalogue class/field defining the composition |
| `RestSourceCatalogSupplier` beans (code producer) | `ComponentCatalogSupplier` beans (code producer) |
| `specs/ui/sources.yaml` (authored) | `specs/ui/components.yaml` (authored) |
| `RestSourceRegistry` (core: derived ∪ supplier, authored merged on top, **authored wins**) | `ComponentRegistry` (same two-producers-one-table, `MateuBeanProvider.getBeans`, authored wins) |
| wire: `RestDataSource.ref` → resolved from `AppDto.restSources` / `manifest.json` | wire: a component with a `ref` → resolved from `AppDto.components` / `manifest.json` |
| client: `restSourceCatalogue.ts` (`resolveRestSource`) in `fetchExternalJson` | client: `componentCatalogue.ts` (`resolveComponent`) in the renderer/expander |
| `@RestOptions(source = "countries")` on a field | `@Component(ref = "AgencySelector")` on a field |

## Wire — resolution by `ref` only

The wire carries the NAME, the catalogue travels separately (`AppDto.components` for a live app,
once in `manifest.json` for a bundle) — identical to REST sources. A `ComponentDto` gains an optional
`ref`; when set, the renderer (and the Phase-6 client-side expander) substitute the named catalogue
entry's component before rendering. A surface's inline overrides (if any) win over the entry, same
precedence rule as sources. `structureHash` EXCLUDES the catalogue (re-pointing/renaming a business
component is a table edit, not a different build), mirroring the REST source decision.

Because there is **no new rendering**, this needs no per-renderer work: the referenced tree is
ordinary components every renderer already paints. It ports for free and runs client-side (#1) — the
expander resolves the ref against the shipped catalogue exactly as it resolves a REST source.

## Increment plan (one PR each, test-first, full Java/.NET/Python parity)

| # | Increment | Notes |
|---|---|---|
| 0 | **This design doc.** | — |
| 1 | **Wire + registry (Java)** — `ComponentEntry`/`ComponentCatalog` (uidl.data), `@BusinessComponent` + `ComponentCatalogSupplier`, `ComponentRegistry` (core), `ComponentDto.ref`, `AppDto.components`; resolve `ref` server-side. Java golden via `TestMateu.sync`. Regenerate the schema (new records/fields). | copy RestSourceRegistry |
| 2 | **Client resolution** — `componentCatalogue.ts` (mirror `restSourceCatalogue.ts`) + resolve `ref` in the renderer AND the Phase-6 expander; ship `components` in `manifest.json` (exporter). vitest + bundle regen. | reuse the sources plumbing |
| 3 | **Ports** — .NET `[BusinessComponent]`/`IComponentCatalogSupplier`/`ComponentRegistry` + `components` wire; Python `@business_component`/`ComponentCatalogSupplier` + wire. Golden tests each. **Update the brittle .NET substring goldens** for any new wire field. | full parity |
| 4 | **`@Component(ref=…)` field sugar** + a demo (the agency-selector) + docs. | ties to #12 (visual builder authors these) |

**Golden/CI discipline (carried):** wire changes pinned to Java goldens via `TestMateu.sync`; the
client-side expander must resolve a `ref` so the no-backend path keeps working; regenerate the
`uidl` schema (`UidlSchemaTest -Duidl.schema.write=true`) and the vaadin bundle when `libs/mateu`
changes (keep test helpers in the bundle commit); and update the exact-substring column/component
goldens in `SyncHandlerTests.cs`/`ImportWizardTests.cs` in the SAME PR (no local `dotnet`).

**Relation to #14 (custom components):** a business component is composition of KNOWN pieces (this,
ports free). A custom component is a NEW rendering (per-renderer escape hatch, does NOT port free).
Keep them distinct — an agency selector is a business component, never a custom one.
