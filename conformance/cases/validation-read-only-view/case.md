# validation-read-only-view

**Pins:** a class-level `@ReadOnly` view (`[ReadOnly]` / `@read_only`) renders every field
`readOnly: true` and sends no validation for any of them: none of its fields is one the user can
edit (`PageFormBuilder.isEditable`, same rule as `validation-locked`).
