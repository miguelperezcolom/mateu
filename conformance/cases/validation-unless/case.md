# validation-unless

**Pins:** a field locked by permission — `@ReadOnlyUnless(roles = "manager")` (`[ReadOnlyUnless]` /
`ReadOnlyUnless(...)`), rendered for an anonymous caller — carries `readOnly: true` and sends NO
validation, while the editable field next to it keeps its own: a constraint applies only to a field
the user can edit (`PageFormBuilder.isEditable`, same rule as `validation-locked`). The server
neither checks nor writes the locked field for that caller.
