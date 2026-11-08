# crud-view

Pins the CRUD's read-only record page (`request.json`: the content load of
`/conformance/crud/P-001`): the fields as plain text, `pageType: detail` (a record of a collection
is a detail page; the crud's own `collection` type describes its listing) and the view toolbar in
Java's order — Back to list (tertiary), Edit. "Add another" is NOT on the view of an existing record:
it belongs to the create flow (the toast confirming a create offers it). The ports used to answer
`pageType: collection` and Edit before Add another.

The mediator protocol (`actions`, `initialData`/`state`, `route`) is left out as in `crud-new`.

The record page is titled after the RECORD (2026-11): the fixture's Product names itself like the
starters' (`toString()` / `ToString()` / `__str__` → its name, "New product" while blank), so the
title — window title included — is "Espresso machine", marked `titleIsText` (data, rendered as
text). A type that does not name itself (no override, or a generated record/dataclass dump) keeps
the class name; that half is pinned by each port's own title tests. `crud-new` ("New product") and
`crud-edit` pin the same rule.
