# crud-view

Pins the CRUD's read-only record page (`request.json`: the content load of
`/conformance/crud/P-001`): the fields as plain text, `pageType: detail` (a record of a collection
is a detail page; the crud's own `collection` type describes its listing) and the view toolbar in
Java's order — Back to list (tertiary), Edit. "Add another" is NOT on the view of an existing record:
it belongs to the create flow (the toast confirming a create offers it). The ports used to answer
`pageType: collection` and Edit before Add another.

The mediator protocol (`actions`, `initialData`/`state`, `route`) is left out as in `crud-new`.
