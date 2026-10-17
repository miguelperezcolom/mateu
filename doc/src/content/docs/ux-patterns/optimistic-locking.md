---
title: Concurrent edit conflicts
description: "@Version optimistic locking — the second writer gets a conflict dialog instead of silently losing the first writer's changes."
---

**Status:** ✅ Implemented

## Intent

Two users open the same record; both edit; both save. Without protection the second save silently
erases the first — the classic *lost update*. Enterprise apps need the second writer to **know**,
and to choose: see the other changes, or overwrite them deliberately.

## Solution

Add a `@Version` field (an `int` or `long`) to the entity:

```java
public class Article implements Identifiable {
    String id;
    String name;
    @Version long version;   // never an input on the edit/creation form; it still travels in state
}
```

- Every successful save **bumps** the version automatically.
- A save carrying a version **older** than the stored one (someone else saved in between) is
  rejected: nothing is persisted and the user gets the **conflict dialog** — *"Modified by
  another user"* — with two choices:
  - **Reload** — discard my changes and show the record with theirs (the routed editor goes to
    the record's view; the edit drawer stays open, refreshed with the stored values).
  - **Overwrite** — my version wins, explicitly. The save is re-dispatched with
    `_forceOverwrite`; the version keeps moving forward (the stale number is never resurrected).

  Either way the dialog closes with the answer. Its texts are English and go through your
  `Translator` like every other Mateu text: translate *"Modified by another user"*, *"Reload"*,
  *"Overwrite"* and the two messages (*"This record changed while you were editing it…"*, *"This
  row changed…"*) to localise it.
- The version field is never shown as an input on the edit or creation form (a user could
  otherwise type their way past the check); a read-only view still shows it.
- Works out of the box on `AutoCrud` editors **and** inline row editing (`@InlineEditing`), where
  the dialog re-sends the same edited row on overwrite.
- Entities without a `@Version` field are untouched — the feature is fully opt-in.

## Database-backed repositories

The check compares against `store().findById(...)` at save time. A **store-managed** version — a
field annotated with JPA's `@jakarta.persistence.Version` (or Spring Data's
`@org.springframework.data.annotation.Version`) — takes part in that check like Mateu's own
`@Version`, so a stale save gets the same dialog and *Overwrite* adopts the stored version; but
Mateu does **not** bump it, because the persistence provider increments it itself. For a race the
check cannot see, throw `OptimisticLock.StaleEditException` from `save` (e.g. translate Spring's
`OptimisticLockingFailureException` in your store).

## Related

- [Autosave](/ux-patterns/autosave/) — fewer stale windows by saving continuously
- [Audit history](/reference/key-annotations/) — `Auditable` records who changed what
