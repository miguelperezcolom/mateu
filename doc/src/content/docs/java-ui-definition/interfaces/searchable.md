---
title: "Searchable"
description: "Control the text used when free-text searching a CRUD listing."
---

**Interface** — `io.mateu.uidl.interfaces.Searchable`

`Searchable` lets an entity/row expose the text that the free-text search box of a listing matches against. The default in-memory implementation of [`CrudStore.find`](/java-ui-definition/interfaces/crud-store/#the-find-method) filters `findAll()` by checking whether each row's searchable text contains the query.

```java
public interface Searchable {
    String searchableText();
}
```

- If the entity implements `Searchable`, its `searchableText()` is matched against the search box value.
- If it does not, the framework falls back to `toString()`.

Matching is case-insensitive containment.

---

## When to use it

Implement `Searchable` when `toString()` is not a good search target — for example, when `toString()` is used as the display representation in lookups and references, but you want the search to also cover fields that are not part of the display text.

---

## Example

```java
public record Product(String id, String name, String sku, String description)
        implements Identifiable, Searchable {

    @Override
    public String id() { return id; }

    // shown in lookups and references
    @Override
    public String toString() { return name; }

    // matched by the listing search box
    @Override
    public String searchableText() {
        return name + " " + sku + " " + description;
    }
}
```

Searching for a SKU or a word from the description now finds the product, even though neither appears in `toString()`.

---

## Scope

`Searchable` only affects the **default** (in-memory) `CrudStore.find` implementation. If you override `find(searchText, filters, pageable)` to push searching to the database, you decide how `searchText` is matched and `Searchable` is not consulted.

## Related

- [CrudStore](/java-ui-definition/interfaces/crud-store/) — the data-access contract whose default `find` uses `Searchable`
