# validation-locked

**Pins:** constraints on fields the user cannot type into. A field-level `@ReadOnly`
(`[ReadOnly]` / `ReadOnly()`) field carries `readOnly: true` and sends NO validation, and neither
does a `@PlainText` field (stereotype `plainText`); the editable field next to them keeps its own.
A constraint applies only to a field the user can edit (owner decision): one the user cannot fix
would block the submit. Java's `PageFormBuilder.isEditable` is the rule `ValidationMapper` (client)
and `ServerConstraintCheck` (server) ask; the ports follow it (.NET `ReflectionMapper.IsEditable`,
Python `validation.editable`). The locked value still travels pre-filled, and the server never
writes it.
