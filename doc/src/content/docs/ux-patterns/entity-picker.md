---
title: Entity Picker
description: Select relationships and manage child collections without leaving the form.
---

**Status:** ✅ Implemented — `@Lookup`, `@Composition`

## Intent

Select related entities and manage child collections without leaving the form.

## Problem

Picking a customer from thousands, or managing order lines inline, typically pushes the user to another screen and breaks the form in progress. The user loses context and must navigate back.

## Solution

### Selecting a relation — `@Lookup`

Use `@Lookup` when a field references a single entity. Provide a `LookupOptionsSupplier` for the search and a `LabelSupplier` for display.

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
  Customer  [Acme Corp ×]  ← lookup, searchable in place
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

## Principles served

- **Preserve context** — no navigation break, the form stays open
- **Minimize navigation** — relation management happens inline
