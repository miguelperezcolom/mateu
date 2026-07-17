---
title: Version diff on the audit trail
description: The History dialog groups field-level changes by save moment — each group reads as one version of the record.
---

**Status:** ✅ Implemented

## Intent

"Who changed this, when, and **what exactly**?" An audit trail answers it only if the reader can
see the changes **as versions** — one save, its author, and every field it touched with old → new
values — instead of a flat stream of rows.

## Solution

Implement `Auditable` on the CRUD entity or view (as before) and return one `AuditEntry` **per
field change**, all changes of one save sharing the same `when`:

```java
@Override
public ListingData<AuditEntry> history(String searchText, AuditFilters filters,
        Pageable pageable, HttpRequest httpRequest) {
    return ListingData.from(auditStore.entriesFor(recordId));  // when, who, action, field, old, new
}
```

The **History** dialog now renders the trail **grouped by save moment** (`AuditEntry.when` is the
listing's `@GroupBy` column): each group subtotal row is one *version* — timestamp and number of
fields changed — and its rows are the per-field diff (`field`, `oldValue` → `newValue`, `who`,
`action`). Searching and filtering (by author, by field…) recompute the grouping over the
filtered trail.

## Restoring a version

Restoring is a write decision the framework won't take for you (it can't know whether reverting a
price also requires reverting the invoice it produced). The recipe: give the audited entity's crud
a [bulk or row action](/ux-patterns/bulk-actions/) that reads the audit rows and writes the old
values back through your repository — the [optimistic-locking](/ux-patterns/optimistic-locking/)
`@Version` bump keeps the restore itself auditable.

## Related

- [Concurrent edit conflicts](/ux-patterns/optimistic-locking/) — versions moving forward
- [Totals & row grouping](/ux-patterns/aggregates/) — the grouping machinery this reuses
