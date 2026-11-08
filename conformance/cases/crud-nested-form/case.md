# crud-nested-form

The EDIT form of a crud (`PurchaseOrdersCrud`, `/conformance/crud-nested/PO-1/edit`) whose entity
holds a plain nested data object (`supplier`, a `SupplierInfo` — the `inline-form` fixture's — with
no `@Inline`).

What it pins:

- the nested object is drawn as a sub-form in an outlined card: its fields under prefixed ids
  (`supplier-name`, `supplier-email`), its `@Toolbar` on the sub-form's toolbar and its `@Button`
  below it, both dispatched as `nested-form-action-supplier-<method>`;
- the record form ADVERTISES those nested actions (Java's `ActionMapper.addNestedFormsActions` on
  the entity's server-side component) — the one part of the form's actions this case keeps: the
  rest (create/save and how they bubble to the crud) is mediator protocol, dropped as in the other
  `crud-*` record forms, together with the route the form answers on.

Its sibling `crud-nested-form-action` dispatches one of them.
