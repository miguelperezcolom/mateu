---
title: Global entity search
description: The ⌘K command palette searches your data — customers, bookings, invoices — not just the menu.
---

**Status:** ✅ Implemented

## Intent

Expert users navigate by **entity**, not by screen: "take me to *Acme's* file", not "Customers →
search → Acme". The command palette already jumps to menu entries; wiring your data into it turns
it into the app's front door.

## Solution

Implement `GlobalSearchSupplier` on the `@UI` app class:

```java
@UI
public class BackofficeApp implements GlobalSearchSupplier {

    @Override
    public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
        var hits = new ArrayList<GlobalSearchResult>();
        customers.top(searchText, 5).forEach(c ->
            hits.add(new GlobalSearchResult(c.name(), c.taxId(), "/customers/" + c.id(), "Clientes")));
        bookings.top(searchText, 5).forEach(b ->
            hits.add(new GlobalSearchResult(b.code(), b.guestName(), "/bookings/" + b.id(), "Reservas")));
        return hits;
    }
}
```

- While the user types in the **⌘K palette**, the menu results are joined (debounced) by the
  matching **entities**, grouped by `category`; arrow keys navigate across both; Enter (or click)
  navigates to the hit's `route`.
- The palette calls the app-level `_globalsearch` action with the typed `searchText` — per
  request, so results can be permission-scoped (resolve the user from the request).
- Keep it fast: search indexes, top-N per category. The palette shows at most 8 hits.

## Related

- [Navigation & menus](/ux-patterns/navigation/) — the palette's menu half
- [Filters & Listing](/ux-patterns/filters-and-listing/) — when the answer is a slice, not a record
