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
    @Version @Hidden long version;   // @Hidden keeps it off the form; it still travels in state
}
```

- Every successful save **bumps** the version automatically.
- A save carrying a version **older** than the stored one (someone else saved in between) is
  rejected: nothing is persisted and the user gets the **conflict dialog** — *"Modificado por
  otro usuario"* — with two choices:
  - **Recargar** — discard my changes and reload the record with theirs.
  - **Sobrescribir** — my version wins, explicitly. The save is re-dispatched with
    `_forceOverwrite`; the version keeps moving forward (the stale number is never resurrected).
- Works out of the box on `AutoCrud` editors **and** inline row editing (`@InlineEditing`), where
  the dialog re-sends the same edited row on overwrite.
- Entities without a `@Version` field are untouched — the feature is fully opt-in.

## Database-backed repositories

The check compares against `store().findById(...)` at save time. If your store enforces its
own optimistic locking (e.g. JPA `@jakarta.persistence.Version`), you can rely on that instead —
throw `OptimisticLock.StaleEditException` from `save` to get the same conflict dialog.

## Related

- [Autosave](/ux-patterns/autosave/) — fewer stale windows by saving continuously
- [Audit history](/reference/key-annotations/) — `Auditable` records who changed what
