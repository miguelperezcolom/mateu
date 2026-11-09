# editable-view

**Pins (the content load of the view page, `/view`):** an `AutoEditableView<Profile>` (.NET
`AutoEditableView<T>`, Python `AutoEditableView[T]`) — the record read-only with a single `Edit`
(`edit`) toolbar button, page type `detail`, and the entity's validations.

Java's first load is a MultiView mediator, so — like the CRUD record forms — the case pins the
content load and leaves the mediator protocol (`actions`, routing state, the component's route) out
on every side. A `save` is not pinned: Java pushes history from its mediator while the ports
navigate (.NET) or re-render in place (Python) — a port idiom; the user lands on the same screen.
