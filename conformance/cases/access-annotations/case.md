# access-annotations

The access annotations as an **anonymous** caller sees them — the security half of the wire.

- `salary` carries `@EyesOnly(roles = "hr")`: it is **not on the wire at all** — no field, and no
  value in `initialData` or the fragment `state` (hiding the widget while shipping the value would
  leak it to anyone reading the response).
- `notes` carries `@ReadOnlyUnless(roles = "manager")`: present, `readOnly: true`.
- the `approve` button carries `@DisabledUnless(roles = "manager")`: present, `disabled: true`.

The three servers apply these gates to the identity of the request; with none, every declared
dimension denies.
