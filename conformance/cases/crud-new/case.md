# crud-new

Pins the CRUD's creation form (`request.json`: the content load of `/conformance/crud/new`, the
crud's route consumed): the record-titled page ("Product") with one card of the entity's fields
(id, name, price and the status select with humanized labels), the toolbar Cancel (tertiary,
`cancel-new`) + Save (primary, `create`), the record-form style, `pageType: form`, the unsaved
changes guard and the client-side validations.

Left out on every side, as in the other mediated cases: the component's `actions`,
`initialData`/`state`, and its `route` — Java's mediator answers the form on the crud's own route
(where it receives every later action), the ports on the record's (`/new`). See `MEDIATED_FORMS`
in the three runners.
