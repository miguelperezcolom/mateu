---
title: Filters & Listing
description: Locate and operate on records with minimal effort.
---

**Status:** ✅ Implemented

## Intent

Locate and operate on records with minimal effort.

## Problem

A listing without live filters, row actions, and bulk actions forces users to navigate to each record individually to do anything. High-volume workflows become impractical.

## Solution

Use `@List` for the collection class, `@Filterable` on filter fields, `@RowAction` for per-row actions, and `@ListToolbarButton` for bulk actions. Column display is controlled with `@ColumnWidth` and `@HiddenInList`.

```java
@UI("/products")
public class ProductsListing extends AutoCrud<Product> {

    @ListToolbarButton(rowsSelectedRequired = true, confirmationRequired = true)
    public void deactivateSelected(List<Product> selected) {
        selected.forEach(p -> p.setActive(false));
        repository.saveAll(selected);
    }
}
```

```java
public class Product {

    @Filterable
    private String name;

    @Filterable
    private ProductCategory category;

    @HiddenInList
    private String internalNotes;

    @ColumnWidth("80px")
    private boolean active;
}
```

![Listing with the smart search bar: status, date-range and price-range chips applied](/images/docs/ux-patterns/filters.png)

## The smart search bar

Filters render as a **single search field** (after the Redwood Smart Search pattern), not as a row
of inputs. The one field hosts both the free-text keyword search and the structured filters:

- **Type and press Enter** to apply a keyword search (matched against `Searchable.searchableText()`
  or `toString()`).
- **Click the field** to open the *Filter by* panel listing every filter. Picking one opens a
  type-specific widget. Filters already set show their current condition next to their name.
- **Every applied condition becomes a chip** in the bar with its own ✕. Adding or removing a chip
  re-runs the search immediately, so conditions compose (e.g. keyword + status + a date range).
- **Clear filters** at the bottom of the panel resets everything at once.

![The Filter by panel, opened by clicking the search field](/images/docs/ux-patterns/filters-panel.png)

Which fields become filters is decided server-side: every basic field **and every enum** of the
filters class. The widget (and the condition semantics) follow the field's type:

| Field type | Widget | Condition | State / URL keys |
|---|---|---|---|
| String | text input + Apply | contains (case-insensitive) | `name=widget` |
| Boolean | Yes / No | equality | `certified=true` |
| Enum | **multi-select** (checkable options) | IN — any of the picked values | `status=Available,OutOfStock` |
| Date/time (`LocalDate`, `LocalDateTime`, `LocalTime`) | **from–to range** | between / ≥ / ≤ | `added_from=2026-01-15&added_to=2026-02-28` |
| Number with `@RangeFilter` | **min–max range** | between / ≥ / ≤ | `price_from=100&price_to=150` |
| Number (plain) | number input + Apply | equality | `units=5` |

![The date-range widget of a temporal filter](/images/docs/ux-patterns/filters-range.png)

Temporal filters are ranges **by default** (equality on an exact instant is almost never what a
user wants); numeric ranges are opt-in via `@RangeFilter` on the entity field; enums are
multi-selects by default (picking a single value behaves exactly like equality). Because every
condition lives in flat state keys, the URL keeps capturing the full listing state — bookmarks and
shared links restore ranges and multi-selections too. There is nothing to configure on the
frontend — every renderer that ships the shared filter bar (Vaadin, SAP UI5, PatternFly) gets this
UX, and the Redwood renderer implements the same pattern with its own design system.

## Structure

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 (Text: widget ✕) (Category: Electronics ✕) [type here…]   │
│    ┌─ FILTER BY ──────────────┐                              │
│    │ Name                     │                              │
│    │ Category     Electronics │                              │
│    │ Active                   │                              │
│    │ Clear filters            │                              │
│    └──────────────────────────┘                              │
├──────────────────────────────────────────────────────────────┤
│ ☐  Name            Category     Active   [Actions]           │
│ ☑  Product A       Electronics  ✓        [Edit] [▼]          │
│ ☑  Product B       Clothing     ✓        [Edit] [▼]          │
│ ☐  Product C       Electronics  ✗        [Edit] [▼]          │
├──────────────────────────────────────────────────────────────┤
│  [Deactivate selected]  [New]  [Export PDF] [Excel] [CSV]    │
└──────────────────────────────────────────────────────────────┘
```

## Filtering on the default repository

You don't need to override anything for the filters to work: the default in-memory
`CrudRepository.find` applies them. Two mechanisms cooperate:

- **Equality filters travel inside the entity-shaped example object** (query by example). A filter
  counts as **set** when its value differs from a freshly-constructed instance of the filters
  class, so field initializers and primitive zeros/falses don't filter on their own. Strings match
  by case-insensitive containment, everything else by equality. The flip side: filtering **by** a
  field's default value (e.g. an initializer like `status = AVAILABLE`) needs an overridden `find`.
- **Ranges and multi-selects travel as `FilterCriterion` entries** (between/gte/lte/in, values
  already coerced to the field's type) — an entity instance simply has no room for "between 10 and
  50" or "any of A, B". They reach the repository through the 4-arg
  `find(searchText, filters, criteria, pageable)` overload, whose default evaluates them in memory.

See [CrudRepository](/java-ui-definition/interfaces/crud-repository/) for pushing both to the
database.

## Export

Override `pdfExportable()`, `excelExportable()`, or `csvExportable()` in your `Listing` subclass to show the corresponding export button. The framework reuses `search()` with the active filters to collect the data — no extra code needed.

```java
public class ProductsListing extends Listing<ProductFilters, ProductRow> {

    @Override public boolean excelExportable() { return true; }
    @Override public boolean csvExportable()   { return true; }
}
```

CSV export is included in the `core` module. Excel and PDF export are in **optional modules** that must be added as Maven dependencies — see [Export modules](#export-modules) below.

## Export modules

CSV export works out of the box. Excel and PDF require adding the corresponding optional module to your project's `pom.xml`:

**Excel** (Apache POI, Apache 2.0):

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>export-excel</artifactId>
    <version>${mateu.version}</version>
</dependency>
```

**PDF** (Apache PDFBox, Apache 2.0):

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>export-pdf</artifactId>
    <version>${mateu.version}</version>
</dependency>
```

Once the dependency is on the classpath the framework detects it automatically via CDI — no configuration needed. The export buttons appear only when the corresponding module is present, so adding neither module gives a clean toolbar with no dead buttons.

Both modules produce A4 landscape files. The Excel exporter auto-sizes columns; the PDF exporter repeats the header on each page and alternates row background colours for readability.

## URL sync and saved views

Every time the user triggers a search, the listing updates the browser URL as query parameters. On page load the framework reads those parameters, pre-populates the fields, and triggers the search automatically.

The URL captures the full listing state:

| Parameter | What it stores |
|---|---|
| Filter field names | The value of each filter field (e.g. `name=widget`) |
| `searchText` | The free-text search box value |
| `page` | Current page number (omitted when 0) |
| `sort` | Active sort as `field:direction` pairs (e.g. `sort=name:ascending,date:descending`) |

```
/products?name=widget&category=Electronics&page=2&sort=name:ascending
```

This gives three capabilities for free:

- **Saved views** — bookmark any filtered URL; opening it restores filters, page, and sort.
- **Shareable links** — paste the URL in a chat or email; the recipient lands with the same state.
- **Browser history** — the back button returns to the previous filter state.

No server-side persistence of views is needed. The browser's native bookmark manager is the saved-views feature.

## Principles served

- **Workflow over screens** — act on data without leaving the list
- **Keyboard-first** — filters respond to Enter via `@Trigger(type = OnEnter)`
- **Recoverability** — filter state, page, and sort survive navigation via URL sync; no Filter Amnesia
