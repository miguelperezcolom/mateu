# uidl — UI Definition Language

The `uidl` module defines the **model-neutral data structures** that Mateu renderers consume.  
It has no UI framework dependency — Vaadin, SAP UI5 or any future renderer all read the same UIDL.

---

## Package map

| Package | Purpose |
|---|---|
| `io.mateu.uidl.data` | Core data records: `GridColumn`, `FormField`, `FieldDataType`, `FieldStereotype`, … |
| `io.mateu.uidl.fluent` | Fluent builders for programmatic UI construction (`Listing`, `Form`, …) |
| `io.mateu.uidl.annotations` | Annotations placed on domain model fields to drive rendering |
| `io.mateu.uidl.interfaces` | Extension-point interfaces (suppliers, adapters, selectors) |
| `io.mateu.uidl.layout` | Weight-based layout engine (renderer-agnostic) |

---

## Adaptive layout — weight engine

`io.mateu.uidl.layout` contains a **shared weight estimator** that drives both column-layout
selection and filter-panel layout selection from a single table of units (1u ≈ 76 px).

### Weight table

| Type / Stereotype | Weight |
|---|---|
| `bool`, `icon` | 1u |
| `status`, `integer` | 1.5u |
| `combobox`, `select`, `number`, `date`, `money` | 2u |
| `link`, `dateTime`, `dateRange` | 2.5u |
| `string` (default) | 3u |
| `image` | 4u |
| `html`, `richText`, `markdown`, `textarea` | 5u |

Override the auto-derived weight with `@Weight(value)` or `@ColumnWidth("Npx")` on any field
or record component.

### Column layout selector

`ColumnLayoutSelector.select(columns, availableWidthPx)` returns `{layout, compactFieldIds}`.

| Condition | Layout |
|---|---|
| r ≤ 1.0 (everything fits) | `table` |
| r > 1.6 or > 10 visible columns | `masterDetail` |
| 1.0 < r ≤ 1.6, compact primary subset ≤ 8u | `twoLineList` |
| image/html present, or 4–8 fields with no primary | `cards` |

Where `r = Σ(column weights) / available units`.  
`identifier=true` marks the row title shown in compact/master-detail views.  
`priority` (lower = more important) controls which fields survive when the view compresses.

**Example — 9-column listing at 640 px:**
```java
// Σ = 21.5u / (640/76 ≈ 8.4u) → r ≈ 2.55 → masterDetail
// compact = [name(id=0,identifier), status(id=1), balance(id=2)]
GridColumn.builder().id("name").dataType(FieldDataType.string).priority(0).identifier(true).build()
GridColumn.builder().id("status").dataType(FieldDataType.status).priority(1).build()
// …
```

### Filter layout selector

`FilterLayoutSelector.selectLayout(searchable, filters, availableWidthPx)` returns a `FiltersLayout`.

| Condition | Layout |
|---|---|
| 0 filters | `inline` |
| Σ ≤ 4u | `inline` (controls beside search bar) |
| ≥ 6 filters or Σ > 8u | `drawer` (persistent side panel) |
| otherwise | `popover` (button + badge + dropdown) |

Filter-specific modifiers on top of the base weight:
- `dateRange` → ×1.5 (shows two date pickers)
- `listBox` stereotype → ×1.5 (multi-select list)

Active filter **chips** are always rendered in the search bar regardless of where controls live —
this is a renderer concern; the layout enum only controls the controls, not the chip display.

### Manual overrides

Both layouts can be forced on `Listing`:

```java
Listing.builder()
    .filtersLayout(FiltersLayout.drawer)   // force drawer
    .gridLayout(GridLayout.masterDetail)   // force master-detail
    .build();
```

Available values: `auto` (default) · `inline/table` · `popover/list` · `drawer/cards` · `dialog/masterDetail`.

### Annotations

```java
// On domain record components or fields:
@Priority(value = 0, identifier = true)   // row title, highest importance
@Priority(value = 1)                      // next in compact/master-detail list
@Weight(2.5)                              // explicit unit override
@ColumnWidth("200px")                     // CSS width → 200/76 ≈ 2.6u
```

`@Priority` and `@Weight` target both `FIELD` and `RECORD_COMPONENT` so they work on Java
records directly.
