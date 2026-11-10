# listing-column-options

**Pins:** the column options a REFLECTED listing row declares — `@Priority(value, identifier)`
(`priority`, `identifier`), `@ColumnWidth` (a fixed `width`, `flexGrow` "0", no `autoWidth`, the
layout `weight` = Java's `WeightEstimator.parsePx(width)`: px / its unit, and 3.0 for anything
that is not a px number such as `9rem` — and the column's
own text as its tooltip), `@Line` (`line`), `@Style` (`style`) and `@Tooltip("otherField")`
(`tooltipPath`). Frozen columns, `sortingProperty`, `filterable` and column CSS classes are never
set by a reflected listing in Java either (only the fluent `Grid`/`GridColumn` carries them), so
they are not part of this case.
