---
title: Entity Picker
description: Select relationships and manage child collections without leaving the form.
---

**Status:** ✅ Implemented — `@Lookup`, `@Searchable`, `@Composition`

## Intent

Select related entities and manage child collections without leaving the form.

## Problem

Picking a customer from thousands, or managing order lines inline, typically pushes the user to another screen and breaks the form in progress. The user loses context and must navigate back.

## Solution

### Selecting a relation — `@Lookup`

Use `@Lookup` when a field references a single entity and a simple filterable dropdown is enough.

```java
public class Order {

    @Lookup(optionsSupplier = CustomerLookup.class, labelSupplier = CustomerLabel.class)
    private String customerId;
}

public class CustomerLookup implements LookupOptionsSupplier {
    public List<Option> search(String filter) {
        return customerRepo.search(filter)
            .map(c -> new Option(c.getId(), c.getFullName()))
            .toList();
    }
}
```

The field renders as an incremental-search input with results inline — no modal, no navigation.

### Selecting via a full search screen — `@Searchable`

Use `@Searchable` when selecting the entity requires a richer experience: a listing with multiple columns, filter fields, row actions, or even inline CRUD to create new records before selecting them.

Clicking the "Search" button opens the selector class in a modal. When the user clicks a row, the modal closes and the field is updated.

```java
public class BookingForm {

    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    @NotEmpty
    String hotelId;
}
```

The selector class extends `Listing` and implements `Selector` (and optionally `LabelSupplier`):

```java
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 40rem;")
public class HotelSelector extends Listing<Filters, Row>
        implements Selector<String>, LabelSupplier {

    @Override
    public ListingData<Row> search(String searchText, Filters filters,
                                   Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(
            hotels.stream()
                .filter(h -> h.name().contains(searchText))
                .toList()
        );
    }

    @Override
    public SelectedItem<String> selected(HttpRequest httpRequest) {
        Row row = httpRequest.getClickedRow(rowClass());
        return new SelectedItem<>(row.id(), row.name());
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return hotels.stream()
            .filter(h -> h.id().equals(id))
            .findFirst().orElseThrow().name();
    }
}
```

### Inline child collection — `@Composition`

Use `@Composition` when a field contains a collection of owned child records that can be created and deleted within the parent form.

```java
public class Order {

    @Composition(
        targetClass = OrderLine.class,
        repositoryClass = OrderLineRepository.class,
        foreignKeyField = "orderId"
    )
    private List<OrderLine> lines;
}
```

## Structure

```
Order form
  Customer  [Acme Corp ×]      ← @Lookup: incremental search inline
  Hotel     [Hotel Paris] [Search]  ← @Searchable: opens modal listing
  Date      [2024-03-15]

  Lines
  ┌──────────────────────────────┐
  │ Product        Qty   Price   │
  │ Widget A        2    19.99   │
  │ Widget B        1    34.50   │
  │                   [+ Add]   │
  └──────────────────────────────┘

  [Save]
```

## Choosing between `@Lookup` and `@Searchable`

| | `@Lookup` | `@Searchable` |
|---|---|---|
| UI | Inline dropdown | "Search" button → modal |
| Selector | `LookupOptionsSupplier` | `Listing` + `Selector` |

## Known gaps

- **Individually disabled options**: `Option` has no `disabled` flag, so a lookup cannot show a
  choice as visible-but-unselectable (e.g. an inactive agency). Workarounds: filter it out of the
  supplier, or mark it in the label (`"ACME (inactive)"`) and enforce the rule server-side in the
  use case.

## Tree selectors

A selector can present its rows as a **tree**: override `gridLayout()` to return
`GridLayout.tree` and give the row record a self-referential `children` list. The lookup dialog
then shows the hierarchy with expand/collapse carets and a per-row *Select* action — clicking
*Select* on any node picks it (`selected()` receives the clicked row as usual).

```java
public class ZoneSelector extends Listing<Filters, ZoneRow>
        implements Selector<String>, LookupLabelSupplier {

    public record ZoneRow(String id, String name, List<ZoneRow> children) {}

    @Override
    public GridLayout gridLayout() { return GridLayout.tree; }
    ...
}
```

For an INLINE tree dropdown (no dialog), see `@TreeSelect`: the field's options carry `children`
(supplied by the view's `OptionsSupplier`) and the dropdown unfolds the hierarchy in place, with
`leavesOnly = true` restricting selection to leaf nodes.

| Best for | Simple option lists | Complex grids, filters, row actions, CRUD |

## Principles served

- **Preserve context** — no navigation break, the form stays open
- **Minimize navigation** — relation management happens inline
