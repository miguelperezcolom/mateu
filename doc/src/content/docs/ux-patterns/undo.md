---
title: Undo
description: A toast with an Undo button after destructive or bulk actions — recoverability without confirmation friction.
---

**Status:** ✅ Implemented

## Intent

Confirmation dialogs tax every operation to protect against the rare mistake. The friendlier
contract is **act immediately, offer a way back**: archive the document, show *"Documento
archivado — Deshacer"*, and only the mistaken click costs anything.

## Solution

Return `Message.undoable(...)` from the action:

```java
@Button
public Message archive(HttpRequest httpRequest) {
    service.archive(docId);           // soft-delete: keep the row restorable
    return Message.undoable("Documento archivado", "restore", Map.of("docId", docId));
}

public Message restore(HttpRequest httpRequest) {
    var docId = String.valueOf(httpRequest.runActionRq().parameters().get("docId"));
    service.restore(docId);
    return Message.success("Documento restaurado");
}
```

- The toast shows the text plus an **Undo button** (label `undoLabel`, default "Deshacer") and
  stays 10 seconds by default.
- Clicking Undo dispatches `undoActionId` on the initiator component with `undoParameters` as
  action parameters — a plain method of the same class that **reverses the effect itself**.
- The pattern presumes **soft-delete** (or an equivalent reversible operation): keep the data,
  flag it, restore on undo. For truly irreversible operations keep
  `@ListToolbarButton(confirmationRequired = true)` instead — undo and confirmation are
  complementary, not exclusive.
- Works after [bulk actions](/ux-patterns/bulk-actions/) too: pass the affected ids in
  `undoParameters` and restore them all.

## Related

- [Bulk actions](/ux-patterns/bulk-actions/) — the operations most worth undoing
- [Concurrent edit conflicts](/ux-patterns/optimistic-locking/) — the other recoverability guard
