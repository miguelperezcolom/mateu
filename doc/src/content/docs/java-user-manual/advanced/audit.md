---
title: "Audit / Change History"
description: "Add a change-history button to any page by implementing the Auditable interface."
---

If a ViewModel implements `Auditable`, the framework automatically adds a "History" button to the page toolbar. Clicking it opens a modal with a paginated, filterable listing of changes supplied by the `history()` method.

---

## The interface

```java
public interface Auditable {

    ListingData<AuditEntry> history(
            String searchText,
            AuditFilters filters,
            Pageable pageable,
            HttpRequest httpRequest);
}
```

The signature mirrors `ListingBackend.search()`: the framework calls `history()` when the user searches or pages through the modal listing, passing the current search text, filters, and pagination state.

---

## Provided types

### `AuditFilters`

The filter form shown above the history listing. All fields are optional.

```java
public record AuditFilters(
        LocalDate dateFrom,
        LocalDate dateTo,
        String action,
        String field,
        String value
) {}
```

| Field | Description |
|---|---|
| `dateFrom` | Show entries on or after this date |
| `dateTo` | Show entries on or before this date |
| `action` | Filter by action label (e.g. `"APPROVE"`, `"DELETE"`, `"SEND"`) |
| `field` | Filter by the name of the changed field |
| `value` | Filter by old or new value |

### `AuditEntry`

The row type rendered in the history listing.

```java
public record AuditEntry(
        LocalDateTime when,
        String who,
        String action,
        String field,
        String oldValue,
        String newValue
) {}
```

| Field | Description |
|---|---|
| `when` | Timestamp of the change |
| `who` | User or system actor that made the change |
| `action` | Free-form action label — can be `"UPDATE"`, `"APPROVE"`, `"ARCHIVE"`, or any domain-specific string |
| `field` | Name of the changed field (empty for record-level actions) |
| `oldValue` | Value before the change |
| `newValue` | Value after the change |

---

## Example

```java
@UI("/customers/:id")
@Service
@Scope("prototype")
public class CustomerForm implements Auditable {

    String id;
    String name;
    String email;

    final AuditService auditService;

    @Override
    public ListingData<AuditEntry> history(
            String searchText,
            AuditFilters filters,
            Pageable pageable,
            HttpRequest httpRequest) {

        return auditService.findByEntity("Customer", id, searchText, filters, pageable);
    }

    @Toolbar
    Object save() { /* persist */ }
}
```

`auditService.findByEntity(...)` is your own service — Mateu only defines the contract. The service queries whatever audit store you use (a dedicated audit table, an event store, an external system, etc.) and maps the results to `AuditEntry`.

---

## `action` field conventions

Because `action` is a plain `String`, you can use any labels that fit your domain:

| Action string | When to use |
|---|---|
| `CREATE` | Record first created |
| `UPDATE` | One or more fields changed |
| `DELETE` | Record deleted or soft-deleted |
| `APPROVE` / `REJECT` | Workflow state transitions |
| `SEND` / `EXPORT` | Operations with external side effects |
| `LOGIN` / `LOGOUT` | Session-level events (for user audit) |

There is no enforced vocabulary — use what makes sense for each entity.

---

## Related

- [Key interfaces](/reference/key-interfaces/) — full interface reference
- [ListingBackend](/java-ui-definition/interfaces/listing-backend/) — the `search()` signature that `history()` mirrors
