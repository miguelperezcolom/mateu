# validation-read-only-view

**Pins:** a class-level `@ReadOnly` view (`[ReadOnly]` / `@read_only`) renders every field
`readOnly: true` and still sends the fields' constraints: Java's `ValidationMapper` maps the
validations of a page regardless of its read-only flag. Same open owner question as
`validation-locked`: whether the reference should skip locked fields.
