# crud-generated-new

**Pins:** a CRUD's creation form with a `@GeneratedValue(generator)` field: read-only, and the
state starts with the value the generator (a bean) produced; `@EditableOnlyWhenCreating` stays
editable on a create. The form state is pinned (`FORM_STATE_PINNED`), the mediator protocol is not.
On a save, the generated value is the ONE read-only field the client's copy is kept for
(`ClientWritableFields` — mass-assignment rule, pinned by each port's own tests).
