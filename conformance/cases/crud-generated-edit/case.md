# crud-generated-edit

**Pins:** the same CRUD's edit form: the `@GeneratedValue` field and the `@EditableOnlyWhenCreating`
field are both read-only, the state is the stored record. A save takes both from the stored record,
never from the client (`ClientWritableFields`).
