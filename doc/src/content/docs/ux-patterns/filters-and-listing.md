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

![Listing with filter bar, search and bulk actions](/images/docs/ux-patterns/filters.png)

## Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Name [_________]  Category [___▼]   [Search]                │
├──────────────────────────────────────────────────────────────┤
│ ☐  Name            Category     Active   [Actions]           │
│ ☑  Product A       Electronics  ✓        [Edit] [▼]          │
│ ☑  Product B       Clothing     ✓        [Edit] [▼]          │
│ ☐  Product C       Electronics  ✗        [Edit] [▼]          │
├──────────────────────────────────────────────────────────────┤
│  [Deactivate selected]  [New]  [Export PDF] [Excel] [CSV]    │
└──────────────────────────────────────────────────────────────┘
```

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
