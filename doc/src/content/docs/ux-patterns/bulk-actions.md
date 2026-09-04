---
title: Bulk actions
description: Select rows on a listing and run one action over the whole selection — approve, assign, export.
---

**Status:** ✅ Implemented

## Intent

Operate on **many records at once** from a listing — approve 50 invoices, deactivate a batch of
products, assign a set of tickets — without visiting each detail view. The listing offers row
selection (checkbox column with select-all) and toolbar buttons that act on the selection.

## Solution

Annotate a method of your `AutoCrud` (or any `Crud`) with `@ListToolbarButton`. It renders as a
toolbar button over the listing, and a `List<Row>` parameter receives the **typed selection**:

```java
@UI("/invoices")
public class InvoicesCrud extends AutoCrud<Invoice> {

    @Override
    public CrudStore<Invoice> store() { return store; }

    @ListToolbarButton
    @Label("Aprobar seleccionadas")
    public Message approve(List<Invoice> selection, HttpRequest httpRequest) {
        selection.forEach(invoice -> service.approve(invoice.id()));
        return new Message(selection.size() + " facturas aprobadas");
    }
}
```

- The selection column is enabled by default on every crud listing (opt out by overriding
  `selectionEnabled()` to `false`).
- The frontend keeps the selected rows in the component state (`crud_selected_items`); the
  framework hydrates them **typed** into any `List<Row>` parameter of the method.
- By default the button **requires a selection**: clicking it with nothing selected shows a
  notice instead of calling the server. Opt out with
  `@ListToolbarButton(rowsSelectedRequired = false)` for toolbar actions that don't need rows.
- `@ListToolbarButton(confirmationRequired = true)` asks for confirmation first — combine both
  for destructive bulk operations. See [Making it look and read
  dangerous](#making-it-look-and-read-dangerous) for saying *what* is being confirmed.
- The button label follows the usual rules: `@Label` (translated) or the humanized method name.
- Return value semantics are the standard action ones: a `Message` toasts, a `PageBanner` shows a
  banner, `void`/`null` simply re-runs the search so the listing reflects the changes.

## Making it look and read dangerous

A bulk action runs over N records at once, so it is the one that most needs to look destructive and
to say what the user is about to confirm. Three annotations on the same method, each with one job:

| Annotation | Says |
|---|---|
| `@ListToolbarButton` | **where** the button goes (a crud has two toolbars — this one and the detail view's `@ViewToolbarButton`) |
| `@Toolbar` | **how it looks** — `buttonStyle`, `buttonColor`, `buttonSize`, `order` |
| `@Action` | **how it behaves** — the confirmation texts, `timeoutMillis`, `sse`, `background`, `idempotent`… |

This is the same composition a detail-view method already uses, so nothing is duplicated:

```java
@ListToolbarButton(confirmationRequired = true)
@Toolbar(buttonStyle = ButtonStyle.secondary, buttonColor = ButtonColor.error, order = 10)
@Action(confirmationTitle = "Cancel processes",
        confirmationMessage = "Cancelling stops every selected process. This cannot be undone.",
        confirmationText = "Cancel them",
        confirmationDenialText = "Keep running")
@Label("Cancel")
public Message cancel(List<Process> selection) {
    selection.forEach(process -> service.cancel(process.id()));
    return new Message(selection.size() + " cancelled");
}
```

Notes:

- Each confirmation text falls back **on its own**, so declaring only `confirmationMessage` keeps
  the framework's title and Yes/No labels instead of blanking them.
- The flags are **merged, not overridden**: `@Action.rowsSelectedRequired` defaults to `false` while
  `@ListToolbarButton` defaults it to `true`, so adding an `@Action` for its texts never disarms the
  selection guard.
- `@Action.id()` is ignored here — the dispatch id belongs to the placement
  (`action-on-row-<method>`).
- Without `@Toolbar` the button keeps the renderer's default look, and without `@Action` it keeps
  the generic confirmation dialog: existing buttons are untouched.
- `@Toolbar(order = N)` fixes the button sequence, which reflection alone does not guarantee.

The same three annotations work on a capability `Listing` and on `@ViewToolbarButton` methods of the
detail view.

## Built-in bulk delete

Every crud listing already ships a bulk **Delete** (selection + confirmation) wired to
`CrudStore.deleteAllById(List<IdType>)` — no code needed.

## Other servers

Same wire contract from .NET and Python — with the caveat that the appearance and confirmation-text
knobs above are **Java only** for now: neither port carries a `[Toolbar]`/`toolbar` equivalent nor
confirmation texts on the wire (no action of theirs can declare them, bulk or not).


```csharp
public class InvoicesCrud : AutoCrud<Invoice>
{
    [ListToolbarButton]
    [Label("Approve selected")]
    public Message Approve(List<Invoice> selection) =>
        new Message($"{selection.Count} approved");
}
```

```python
class InvoicesCrud(AutoCrud[Invoice]):
    @list_toolbar_button(label="Approve selected")
    def approve(self, selection: list[Invoice]):
        return Message(f"{len(selection)} approved")
```

## Principles served

- **Workflow over screens** — the operation happens where the user already is: the listing.
- **Recoverability** — destructive bulk actions can require confirmation.

## Related

- [Filters & Listing](/ux-patterns/filters-and-listing/) — finding the rows to act on
- [Task queue](/ux-patterns/task-queue/) — when each item needs individual attention instead
