---
title: Listing layout
description: The layouts a listing can render in — table by default, and how to ask for a different one.
---

Every listing in Mateu renders in one of five layouts. **A listing you do not configure is a table** — at any screen width. Ask for a different layout with `gridLayout()` when a table is not the right shape for your data.

![Listing with search bar, filters and paginated table](/images/docs/build/listing.png)

---

## The four layouts

| Layout | How you get it | Best for |
|---|---|---|
| **table** | the default | Dense data with many comparable fields |
| **list** | `gridLayout(GridLayout.list)` | Navigation-heavy UIs: a title line plus secondary info |
| **cards** | `gridLayout(GridLayout.cards)` | Product catalogues, media galleries |
| **masterDetail** | `gridLayout(GridLayout.masterDetail)` | Complex entities that need side-by-side browsing |
| **tree** | `gridLayout(GridLayout.tree)` | Hierarchical rows — see [Tree layout](#tree-layout-hierarchical-rows) |

### Why the default is not inferred

It used to be. The framework measured the total column weight against the available width and
picked table, list, cards or master-detail from the result. The measurement was reasonable and the
outcome was not: the same screen looked like a different screen on a narrower window, on a second
monitor, or the day somebody added a column — and nothing in the model said it would. A listing is
a table until it says otherwise; if you want cards, say `cards`.

A **narrow window keeps the table** and scrolls it sideways inside the listing box (the page itself
never scrolls sideways). On a phone, prefer `list` or `cards` explicitly.

---

## Column weights

Weights no longer choose the layout, but they still describe how much room a column needs, and the
compact layouts (`list`, `masterDetail`) use the related `@Priority` metadata to decide what goes
in the summary line. 1 unit ≈ 76 px.

### Default weights by type

| Column type / stereotype | Weight (units) |
|---|---|
| `bool`, `icon` | 1.0 |
| `status`, `integer` | 1.5 |
| `combobox`, `select`, `number`, `date`, `money` | 2.0 |
| `link`, `dateTime`, `dateRange` | 2.5 |
| plain `String` | 3.0 |
| `image` | 4.0 |
| `html`, `richText`, `markdown`, `textarea` | 5.0 |

The weight is estimated **server-side from the row field's real Java type** (a `long` counter
weighs 1.5, a `LocalDate` 2.0, …) and travels with each column on the wire, so the selection is
accurate even though the coarse column `dataType` collapses most types to `string` for rendering
purposes. `@Weight` / `@ColumnWidth` still override it.

**Compact columns** are columns marked as the identifier (`@Priority(identifier = true)`) or with a priority value ≤ 2 (`@Priority(1)`, `@Priority(2)`). They are the fields shown in the condensed views (list row title, master-detail panel header).

---

## Telling the compact layouts what matters

### Mark the primary column

```java
public record ProductRow(

    @Priority(value = 1, identifier = true)
    String name,

    String category,
    BigDecimal price,
    ProductStatus status
) {}
```

`identifier = true` pins this column as the row title in list and master-detail layouts. Columns with `priority ≤ 2` are included in the compact summary line.

### Override column weight

```java
public record ProductRow(

    @Weight(5.0)         // treat as very wide
    String description,

    @ColumnWidth("60px") // narrow fixed column — weight derived from px
    boolean active

) {}
```

`@Weight` takes precedence over the type-based default. `@ColumnWidth` also feeds into the weight calculation when `@Weight` is absent.

---

## Forcing a specific layout

### Via the fluent Listing builder

```java
return Listing.builder()
    .gridLayout(GridLayout.cards)
    // ...
    .build();
```

Available values: `auto` (default), `table`, `list`, `cards`, `masterDetail`, `tree`.

### Via listingType (shorthand for cards)

```java
return Listing.builder()
    .listingType(ListingType.card)
    // ...
    .build();
```

`listingType(ListingType.card)` is equivalent to `gridLayout(GridLayout.cards)`. It exists as a semantic alias for CRUDs whose primary presentation is cards.

---

## Tree layout (hierarchical rows)

`GridLayout.tree` renders the listing as an **expandable tree grid** instead of a flat table. You opt in explicitly, as with every non-default layout, and here it also changes the data contract: the rows must be hierarchical.

Two requirements:

1. **The row type exposes a self-referential `children` collection.** A row with a non-empty `children` list gets an expand/collapse toggle; leaves leave it empty or `null`.
2. **`gridLayout()` returns `GridLayout.tree`.**

```java
public record CategoryRow(

    @Priority(value = 1, identifier = true)   // becomes the expandable tree column
    String name,

    int products,

    List<CategoryRow> children                // sub-categories → the tree branches
) {}
```

```java
@UI("/catalog")
@Title("Catalog")
public class CatalogTree implements Listing<CategoryRow>, Searchable {

    @Override
    public GridLayout gridLayout() {
        return GridLayout.tree;
    }

    @Override
    public ListingData<CategoryRow> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.of(rootCategories);   // roots only — each carries its children
    }
}
```

`search()` returns **only the root rows**; the framework expands each branch lazily from the `children` list as the user opens it. The identifier column becomes the tree column, with the expand toggle.

To let users **edit** a node in place, make the CRUD `@SplitCrud` so selecting a row opens its editor in a detail pane. That full pattern — including heterogeneous trees whose nodes edit with different forms, and grouping nodes that are not openable (`viewable = false`) — is documented in [Tree CRUD](/ux-patterns/tree-crud/).

---

## Fixing the content height (cards and table)

By default the listing expands to fill the container, which scrolls the whole page. Set `contentHeight` to constrain the card or table area to a fixed height with its own internal scrollbar:

```java
return Listing.builder()
    .gridLayout(GridLayout.cards)
    .contentHeight("400px")
    .build();
```

---

## Practical guide: which layout will I get?

| Situation | Layout |
|---|---|
| Anything you did not configure | table |
| The same listing on a phone | table, scrolled sideways |
| 20 columns and no `gridLayout()` | table (a wide one) — ask for `masterDetail` if that is what you want |
| `gridLayout(GridLayout.cards)`, or `listingType(ListingType.card)` | cards |
| Rows carry a `children` list and `gridLayout(GridLayout.tree)` set | tree (expandable) |

---

## Next

- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — restrict capabilities, hide fields, add toolbar buttons
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — per-row `ColumnAction` and `ColumnActionGroup`
