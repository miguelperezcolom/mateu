# Phase 7 — Rich table columns (#6) + business components in data (#13) + custom components (#14)

**Status:** in progress (design). Three related ideas about *where a cell/field's rendering comes
from*, on one spectrum from **inferred** (the thesis) to **arbitrary** (the escape hatch). Sequencing
per `coherence-execution.md`; ideas in `coherence-plan.md` (#6/#13/#14).

## The one distinction that organizes all three

A column/field can be rendered three ways, and the whole phase is about keeping them **distinct** so
the common cases stay cheap and only the rare case pays:

| | What it is | Ports? | Backend? |
|---|---|---|---|
| **Inferred / rich column (#6)** | The column's TYPE (or a named rich pattern) decides the cell. | free | none |
| **Business component (#13)** | A reusable BOUND composition of EXISTING components + a data source, named. | free | none |
| **Custom component (#14)** | A genuinely NEW rendering the platform doesn't ship. | **NO** — per-renderer | none (client) |

The trap to avoid (called out in the plan): treating an "agency selector" (a `dropdown + source`) as
a *custom* component and paying per-renderer code, when it is a *business* component that ports for
free. The doc keeps #13 and #14 apart on purpose.

## Idea #6 — Rich table columns: inferred default + 3 patterns + cell-as-component escape hatch

**Already there** (from the `GridColumn` wire, seen in the Phase 6 listing golden): `dataType`,
`stereotype`, `actionId`, `text`, `identifier`, `align`, `editable`/`editorType` (inline editing),
`aggregate` (totals). So typed/inferred columns, a `stereotype` (badge/status-ish), and an
`actionId` (a clickable/action cell) exist. The machinery to render a component tree in a cell also
partly exists (grid form-field cells / editable cells).

**The gap = the 3 opinionated rich patterns as declarative sugar + the opt-in cell-as-component:**
1. **`primary`** — title + secondary caption line + optional leading (avatar/icon). NEW: a column
   that reads 2–3 fields into one rich cell. Declarative shape TBD (e.g. `@PrimaryColumn(caption=…,
   leading=…)` / `type: GridColumn, pattern: primary, captionField:…, leadingField:…`).
2. **`status`** — a chip. Likely `stereotype: status`/`badge` already most of the way; pin the
   color/label mapping.
3. **`actions`** — a row-actions cell (buttons/menu). `actionId` covers one action; the pattern is a
   SET of row actions.
4. **cell-as-component (escape hatch)** — a column whose cell IS an arbitrary component tree, only
   when explicitly declared. Reuses the expander/renderer's component rendering; the opt-in API is
   the deliverable (e.g. a `cell:` component template per row, interpolated with `${row.*}`).

Wire: extend `GridColumnDto` minimally (a `pattern` + the pattern's field refs, and a `cell`
component template for the escape hatch). Parity: Java/.NET/Python emit the same `GridColumn`
fields; the renderers paint the patterns (shared `renderColumn.ts`). Client-side expander (#1) must
handle them too (they are data).

## Idea #13 — Business components: first-class in DATA (a named, bound composition)

**Already there:** the CODE path — semantic (composed) annotations (`@Lookup @RestOptions(source=…)
@interface AgencyId {}`) + the REST source catalogue (`sources.yaml`/`@RestSource`). So a reusable
bound field type exists in code.

**The gap = the DATA twin:** a **component catalogue** — a named component definition referenceable
by name, e.g. `AgencySelector = { field: dropdown, source: agencies, ... }` in a `components.yaml`
(the exact parallel of `sources.yaml`), plus a `@Component(ref=…)`-style reference and a wire that
carries the ref (resolved like a REST source ref: the catalogue travels in `AppDto`/`manifest.json`,
resolved client-side). No new rendering → ports for free, runs with no backend (#1), authorable
visually (#12). This is the **two-producers-one-table** pattern again (annotations + `components.yaml`,
authored-wins), exactly like routes and sources.

**Increment shape:** a `ComponentCatalog` (uidl.data) + `@BusinessComponent`/`components.yaml` +
`ComponentRegistry` (core) + `ComponentDefinition.ref` on the wire + client-side resolution in
`libs/mateu` (reusing the `restSourceCatalogue.ts` pattern). Full Java/.NET/Python parity.

## Idea #14 — Custom components: the per-renderer new-rendering escape hatch

**Already there:** `ComponentAdapter<T>` (compose a domain object from EXISTING components +
round-trip), `MicroFrontend` (embed an external island), `SUPPORTED_TYPES` + `<mateu-unsupported>`
(graceful degradation). So composition-of-known-pieces and heavy embedding exist.

**The gap = a genuinely NEW component TYPE** the developer **registers per renderer** (a web
component / native view), which Mateu emits in the tree and which **degrades gracefully** where not
provided. Today a renderer is closed to new types short of a fork.

**Resolution:** declare the type + its props/slots in the model; provide a per-renderer renderer for
the platforms you target; `<mateu-unsupported>`/fallback elsewhere. The **explicit, relegated escape
hatch** — same principle as `run-js` (#3) and the arbitrary cell (#6). Wire: a `CustomComponentDto`
(type name + props map + slotted children). Frontend: a **registry** (`registerCustomComponent(name,
renderer)`) consulted by the component dispatcher, falling back to `<mateu-unsupported>`. This is
frontend-first (the registration is per-renderer); the backends only need to EMIT the type + props
(a fluent `CustomComponent(name, props, children)` + a `@Custom`-style annotation), which is cheap
parity.

## Increment plan (one PR each, test-first; wire changes → Java/.NET/Python parity + browser)

### AUDIT (2026-09-20): most of #6 was already built — only `primary` is missing

An implementation audit of the existing column machinery found three of the four #6 patterns already
shipped, so the plan below is corrected. Dispatch lives in `apps/vaadin/src/grid/renderColumn.ts`
(`columnRenderer`, ~16-way by `dataType`/`stereotype`) + `apps/vaadin/src/grid/menuColumnRenderer.ts`,
over the shared `libs/mateu/.../renderers/columnRenderers/*` suite; the card path mirrors it in
`mateu-table-crud.ts`.

- **`status` chip — DONE.** `dataType: 'status'` → `renderStatusCell` (`statusColumnRenderer.ts`,
  `getThemeForBadgetType`); backend `@Status(mappings, defaultStatus)` + a `Status` row type →
  `FieldDataType.status`; table + card. (Residual: the DS-neutral `neutralTableRenderer` doesn't
  render it; .NET/Python parity unverified.)
- **`actions` — DONE.** `dataType: 'action'|'actionGroup'|'menu'` and `stereotype:'button'`/`actionId`
  → `renderActionCell`/`renderMenuCell`/`renderButtonCell`; fluent `ColumnAction`/`ColumnActionGroup`;
  table + card.
- **cell-as-component (escape hatch) — DONE.** `dataType: 'component'` → `renderComponentCell`; the
  row field carries a `Component`/`ClientSideComponent`, rendered with the row in state/data. (No
  static `cell:` template — the cell IS the row's component object, which is the more general shape.)
- **`primary` (title + caption + leading) — MISSING.** No annotation, no wire fields, no renderer. A
  layout-level two-line list exists (`GridLayout.list` / `renderTwoLineList`) but not a COLUMN
  stereotype. This is the one real #6 gap.

Also missing (minor): **inferred column dataType from the row field's type** (today a status/action
column needs the annotation/typed field; there's no "auto-detect Status → dataType=status"). Deferred
— the explicit path works and is clear.

| # | Increment | Notes |
|---|---|---|
| 0 | **This design doc + audit.** | — |
| 1 | **#6 `primary` column** — title + caption + leading, reading 2–3 row fields; the ONE real #6 gap. `@PrimaryColumn(caption, leading)` + `GridColumn.captionPath/leadingPath` + `primaryColumnRenderer.ts` + dispatch. | new wire fields; full Java/.NET/Python parity; Java golden |
| — | ~~status / actions / cell-as-component~~ | **DONE** (see audit); no work |
| 2 | **#13 component catalogue** — `components.yaml` + `@BusinessComponent` + `ComponentRegistry` + wire `ref` + client-side resolution. | two-producers-one-table; full parity |
| 3 | **#14 custom component** — wire `CustomComponent(name, props, slots)` + per-renderer `registerCustomComponent` + `<mateu-unsupported>` fallback; backends emit the type. | frontend-first; cheap backend parity |
| 4 | **Docs** — the three-way distinction (inferred/rich / business / custom), the decision guide. (Folds into Phase 9.) | — |

**Golden discipline (carried from Phase 6):** wire changes are pinned to Java goldens via
`TestMateu.sync`; the client-side expander (#1) must handle any new data-carried column/component so
the no-backend path keeps working; browser-verify each renderer change. Parity is required for every
wire change (the ports emit the same DTOs); custom-component *rendering* is per-renderer by nature
(that is the whole point of #14) and does not "port for free".
