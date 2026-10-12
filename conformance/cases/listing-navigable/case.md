# listing-navigable

Pins the id link of a listing that is only `Navigable`: declaring the capability turns the listing into a CRUD (Java bridges it with `CapabilityCrud`), so the first column carries `actionId: "view"` — the link to the record — and the screen takes the CRUD's shape: its own route instead of `_empty`, the title on the listing, the `width: 100%` frames. Before this case Python rendered such an id column as plain text on a plain Crud while Java and .NET made it a link.

Like `crud`, it is a MEDIATED case: the corpus pins Java's content load, without the mediator protocol (the component's `actions`, `initialData` and the fragment `state`).
