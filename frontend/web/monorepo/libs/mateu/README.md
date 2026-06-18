# mateu — shared UI library

Shared Lit-based component library used by all Mateu frontend renderers (Vaadin, SAP UI5, …).

---

## Package map

| Path | Purpose |
|---|---|
| `src/mateu/shared/apiClients/dtos/` | TypeScript DTOs that mirror the Java backend records |
| `src/mateu/ui/infra/ui/` | Lit custom elements (filter bar, table-crud, card list, form, …) |
| `src/mateu/ui/infra/ui/layout/` | Renderer-agnostic layout engine (weight table + selectors) |
| `src/mateu/ui/infra/ui/renderers/` | Component-type dispatch + column renderers |

---

## Adaptive layout engine (`layout/weightEngine.ts`)

TypeScript mirror of `io.mateu.uidl.layout` — same weight table, same decision thresholds.

```
columnWeight(col)          → 1u … 5u based on dataType / stereotype / col.weight override
selectColumnLayout(cols, w)→ 'table' | 'list' | 'cards' | 'masterDetail'
compactColumns(cols)       → columns with identifier=true or priority ≤ 2, sorted
selectFiltersLayout(filters)→ 'inline' | 'popover' | 'drawer' | 'dialog'
```

Imported as `@infra/ui/layout/weightEngine.ts` from any app that extends this lib.

---

## Key components

### `mateu-filter-bar`

Reads `metadata.filtersLayout` (resolved by the backend from `auto` or set manually).
Effective layout:

| Value | Behaviour |
|---|---|
| `inline` | Filter controls rendered directly in the search bar row |
| `popover` | "Filters" button + CSS-shadow panel below the bar |
| `drawer` | "Filters" button + fixed side panel (slide-in, Lumo tokens) + overlay |
| `dialog` | "Filters" button + `vaadin-dialog` modal |

Active-filter chips are always shown in the bar regardless of the chosen layout.

### `mateu-table-crud`

Reads `metadata.gridLayout` (always `auto` from the backend; resolved client-side).  
A `ResizeObserver` measures the component's own width on every resize.

| Resolved layout | Behaviour |
|---|---|
| `table` | Standard `vaadin-grid` (all columns) |
| `list` | `vaadin-list-box` with two-line items (identifier col + compact secondary) |
| `cards` | CSS auto-fill grid of `vaadin-card` tiles (up to 6 columns) |
| `masterDetail` | Split panel: compact list on the left, read-only form detail on the right |

`crudlType === 'card'` from the backend is treated as `gridLayout === 'cards'` for backwards compatibility.
