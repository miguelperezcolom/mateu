# crud-edit

Pins the CRUD's edit form (`request.json`: the content load of `/conformance/crud/P-001/edit`): the
same page as `crud-new`, filled with P-001, whose Save dispatches `save` — not `create`, which is
the creation form's (Java's `CrudFormComponentBuilder`: "create" would route to the creation path
and discard the edit). The ports used to send `create` from both forms.

The mediator protocol (`actions`, `initialData`/`state`, `route`) is left out as in `crud-new`.
