# sapui5 — SAP UI5 renderer

Mateu frontend renderer built with SAP UI5 web components and Lit.  
Delegates all shared logic (weight engine, DTOs) to `libs/mateu`.

---

## Key components

### `mateu-sapui5-filter-bar`

Reads `metadata.filtersLayout` and resolves `'auto'` via `selectFiltersLayout`.

| Layout | Behaviour |
|---|---|
| `inline` | Filter controls rendered directly beside the search bar |
| `popover` | Styled dropdown panel with rounded border |
| `drawer` | Fixed right-side panel with dark overlay (slide-in, CSS transition) |
| `dialog` | `ui5-dialog` modal |

Active-filter chips (`ui5-token`) always visible.

### `mateu-sapui5-table`

`ResizeObserver` measures the component width; `selectColumnLayout` resolves `'auto'`.

| Layout | Behaviour |
|---|---|
| `table` | `ui5-table` with all columns |
| `list` | `ui5-list` two-line items (identifier + compact columns) |
| `cards` | Auto-fill grid of `ui5-card` tiles (up to 6 columns; image in card header) |
| `masterDetail` | Split panel: `ui5-list` on left, field-by-field detail on right |

---

## Path aliases

| Alias | Resolves to |
|---|---|
| `@infra/ui/*` | `libs/mateu/src/mateu/ui/infra/*` |
| `@mateu/*` | `libs/mateu/src/mateu/*` |
