# validation-unless

**Pins:** a field locked by permission — `@ReadOnlyUnless(roles = "manager")` (`[ReadOnlyUnless]` /
`ReadOnlyUnless(...)`), rendered for an anonymous caller — carries `readOnly: true` AND still sends
its constraint, like any field next to it: Java's `PageFormBuilder.rendersAsInput` (which both
`ValidationMapper` and `ServerConstraintCheck` ask) does not consult `@ReadOnlyUnless`, and the
locked value travels pre-filled. Same open owner question as `validation-locked`: whether the
reference should skip locked fields.
