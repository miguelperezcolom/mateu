---
title: Matrix grid
description: Rows of metrics or types by columns of dates, in collapsible sections, with cells that open an action and rows edited in place — the shape of an availability or forecast grid.
---

**Status:** ✅ Implemented

## Intent

Some screens are not a list of records but a **matrix**: what you are looking at is a value at the crossing of a row (a metric, a room type, a product) and a column (a date). Hotel availability, a sales forecast, a staffing plan. A listing grid cannot say "click *this* cell" or "edit the value for Tuesday", and a form has no columns. OPERA Cloud's **Property Availability** is the reference: house totals, availability by room type and controls by date, sections that fold, figures that open the day, and an overbooking row edited in place.

## Solution

Return a `MatrixGrid`:

```java
MatrixGrid.builder()
        .rowHeaderLabel("Room type")
        .cellActionId("openDay")          // a link cell runs it
        .editActionId("setOverbooking")   // an edited cell commits through it
        .columns(dates.stream().map(d -> new MatrixColumn(
                d.toString(), "Sat 17", "Oct 2026", weekend(d) ? "neutral" : null)).toList())
        .sections(List.of(
                MatrixSection.builder().id("types").title("Availability by room type").rows(List.of(
                        MatrixRow.builder().id("STD").label("STD").cells(List.of(
                                new MatrixCell("8", null, true),
                                new MatrixCell("-1", "danger", true))).build())).build(),
                MatrixSection.builder().id("controls").title("Controls").collapsed(true).rows(List.of(
                        MatrixRow.builder().id("ob:STD").label("Overbooking STD").editable(true)
                                .cells(List.of(MatrixCell.of(0), MatrixCell.of(2))).build())).build()))
        .build();
```

Both actions receive the cell as parameters — `_rowId`, `_columnId`, `_value` — so the `@Action` method knows which cell it was:

```java
@Action
public Object setOverbooking(HttpRequest rq) {
    var p = rq.runActionRq().parameters();
    overbooking.put(p.get("_rowId") + "@" + p.get("_columnId"), Integer.parseInt((String) p.get("_value")));
    return this;   // re-render: the availability rows recompute
}
```

### The pieces

| Record | Holds |
|---|---|
| `MatrixColumn(id, label, group, tone)` | consecutive columns with the same `group` (the month) get a spanning header; `tone` tints the column (weekends) |
| `MatrixSection(id, title, collapsed, rows)` | a collapsible group of rows; a blank `title` puts its rows at the top level |
| `MatrixRow(id, label, cells, editable, emphasis)` | one cell per column (the server pads or cuts to the column count); `editable` cells are edited in place; `emphasis` for totals |
| `MatrixCell(value, tone, link)` | `tone` — `info`, `success`, `warning`, `danger`, `neutral` — wins over the column's; `link` runs `cellActionId` |

Folding sections is client-side state and survives the re-render that follows an edit. An edit that leaves the value unchanged sends nothing.

## Where it works

- **Redwood (Oracle VB)** — painted by JET's own **`oj-data-grid`** over a `RowDataGridProvider`: the sections are tree rows with JET's disclosure icons, the month a nested column header, and editing is the grid's cell edit mode (F2 / Enter / typing; non-editable cells are read-only through `cell.editable`).
- **Vaadin** — the shared `mateu-matrix-grid` element (sticky headers and row labels; double click, Enter or F2 to edit; Escape cancels).
- **React Native** and the **IntelliJ plugin** — a fixed label column with horizontally scrolling cells / a `JBTable` with a row header.
- Also available from the C# (`new MatrixGrid { … }`) and Python (`fluent.MatrixGrid(…)`) backends.

## Related

- [Planning board](/ux-patterns/planning-board/) — resources × days with draggable bars, when the cells are bookings rather than figures
- [Editable table](/ux-patterns/editable-table/) — editing records, not a matrix of values
