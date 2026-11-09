# bulk-actions-listing

**Pins a BULK button on a plain listing** (no interaction capability, so no mediator and the
actions are pinned): the button is reached by the method's OWN name (Java's `Listing.actions`, not
`action-on-row-<method>` as on a CRUD), is advertised right after `search` and before the open
`action-on-row-*` / `action-on-view-*` wildcards, does not bubble, and carries the confirmation
the placement asks for (`confirmationRequired`) with the four texts of the `@Action` beside it
(.NET `[ActionOptions]`, Python `@action_options`) plus the selection guard. The button wears its
`@Toolbar` look (`buttonStyle`, `color`, `size`) both in the listing's toolbar and in the PAGE
header's toolbar, which shows a plain listing's bulk buttons beside the title. One button only: a
Java listing advertises its actions in the JVM's method order, which is unspecified.
