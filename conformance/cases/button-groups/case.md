# button-groups

**Pins:** button groups authored fluently (Java `ButtonGroup.of`/`ButtonGroup.split`, .NET
`Button.Group`/`Button.Split`, Python `Button.group`/`Button.split`), in a page toolbar and in
content. A **split button** (a group with a primary) is the PRIMARY button itself — its label,
action and look — with `split: true` and the group's other buttons as `children`; a **dropdown**
(no primary) has no action of its own: its label, and its buttons as `children`.

Worth pinning because the ports had no button groups at all, and a renderer tells the two apart
only by `split` (a plain button never carries `children`).

Fluent, not `@Toolbar(group)` / `[Toolbar(Group)]` / `@toolbar(group=)`: the JVM does not promise
the order of a class's declared methods, so a declared group's advertised actions could swap places
between runs of the reference. Those are pinned by each server's own tests.
