# listing-mapped-values

**Pins:** a listing search whose rows MAP their values on the way out: a `@Status(mappings)`
field becomes a status object (`value`, `type` from the mapping or the default, `message` = the
value humanised) and a `@MappedValue(mappings, defaultValue)` field becomes the mapped text (the
default for an unmapped value). .NET `[Status]`/`[MappedValue]` with `[StatusMapping]` /
`[ValueMapping]`, Python `Status(mappings=…)` / `MappedValue(mappings=…)` markers.
