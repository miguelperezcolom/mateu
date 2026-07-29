---
title: "SearchableText"
description: "Control the text used when free-text searching a CRUD listing."
---

**Interface** — `io.mateu.uidl.interfaces.SearchableText`

`SearchableText` lets an entity/row expose the text that the free-text search box of a listing matches against. The default in-memory implementation of [`CrudStore.find`](/java-ui-definition/interfaces/crud-store/#the-find-method) filters `findAll()` by checking whether each row's searchable text contains the query.

```java
public interface SearchableText {
    String searchableText();
}
```

- If the entity implements `SearchableText`, its `searchableText()` is matched against the search box value.
- If it does not, the framework falls back to `toString()`.

Matching is case-insensitive containment.

> Not to be confused with the `Searchable` **capability interface** (a marker on a [`Listing`](/java-ui-definition/interfaces/listing/) class that shows the search box) or the `@Searchable` **annotation** (lookup fields). `SearchableText` goes on the *entity*, and only affects what the default in-memory search matches against.

---

## When to use it

Implement `SearchableText` when `toString()` is not a good search target — for example, when `toString()` is used as the display representation in lookups and references, but you want the search to also cover fields that are not part of the display text.

---

## Example

```java
public record Product(String id, String name, String sku, String description)
        implements Identifiable, SearchableText {

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

`SearchableText` only affects the **default** (in-memory) `CrudStore.find` implementation. If you override `find(searchText, filters, pageable)` to push searching to the database, you decide how `searchText` is matched and `SearchableText` is not consulted.

## Related

- [CrudStore](/java-ui-definition/interfaces/crud-store/) — the data-access contract whose default `find` uses `SearchableText`
