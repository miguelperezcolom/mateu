# bulk-actions

**Pins the listing toolbar of a CRUD with two BULK buttons** (Java `@ListToolbarButton`, .NET
`[ListToolbarButton]`, Python `@list_toolbar_button`): the buttons LEAD the toolbar, before `New`
and `Delete`, as `action-on-row-<method>`, in the order their `@Toolbar(order)` (.NET
`[Toolbar(Order)]`, Python `@toolbar(order=)`) gives — the fixture declares them the other way
round. The dressed one wears its `@Toolbar` look on the wire (`buttonStyle`, `color`, `size`) and
both carry the selection guard as declared (`rowsSelectedRequired`, on by default, off on the
second). Mediated like `crud`: the content load is pinned, the mediator protocol (the component's
`actions`, where Java advertises the confirmation texts) is not — `bulk-actions-listing` pins those.
