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
public class ProductsListing extends AutoCrudOrchestrator<Product> {

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

## URL sync and saved views

Every time the user triggers a search, the listing updates the browser URL with the current filter values as query parameters. On page load the framework reads those parameters, pre-populates the filter fields, and triggers the search automatically.

This gives three capabilities for free:

- **Saved views** — bookmark any filtered URL in the browser; opening the bookmark restores the exact filter state.
- **Shareable links** — paste the URL in a chat or email; the recipient lands with the same filters applied.
- **Browser history** — the back button returns to the previous filter state.

```
/products?name=widget&category=Electronics&active=true
           ↑ filter state is in the URL — bookmarkable, shareable
```

No server-side persistence of views is needed. The browser's native bookmark manager is the saved-views feature.

## Principles served

- **Workflow over screens** — act on data without leaving the list
- **Keyboard-first** — filters respond to Enter via `@Trigger(type = OnEnter)`
- **Recoverability** — filter state survives navigation via URL sync; no Filter Amnesia
