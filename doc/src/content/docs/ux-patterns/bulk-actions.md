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
    public CrudRepository<Invoice> repository() { return repository; }

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
  for destructive bulk operations.
- The button label follows the usual rules: `@Label` (translated) or the humanized method name.
- Return value semantics are the standard action ones: a `Message` toasts, a `PageBanner` shows a
  banner, `void`/`null` simply re-runs the search so the listing reflects the changes.

## Built-in bulk delete

Every crud listing already ships a bulk **Delete** (selection + confirmation) wired to
`CrudRepository.deleteAllById(List<IdType>)` — no code needed.

## Other servers

Same wire contract from .NET and Python:

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
