# generic-components

**Pins:** the generic fluent building blocks that used to exist only in Java and were ported to
.NET and Python (3.0-alpha.426): `Breadcrumbs` (`currentItemText` + `breadcrumbs[{text, link}]`),
`Icon` (`icon` = the icon name), `Notification` (`title`, `text`), `Element` (`name`,
`attributes`, `on` event → action bindings, `content`, `html`), `Tooltip` (`text` + the `wrapped`
component IN the metadata), `Details` (`summary` and `content` components IN the metadata,
`opened`), `SplitLayout` (`orientation`/`variant` as lowercase names, master and detail as the
component's two CHILDREN) and `ConfirmDialog` (`header`, the button flags/texts/action ids, the
`openedCondition` defaulting to `"true"`, the content as the single child).

Worth pinning because each of these was missing from both ports' wire registries: a .NET or
Python app could not produce them at all, and their member names and where their parts travel
(metadata vs children) must agree across the three mappers for any renderer to draw them.

The `Element`'s `id` attribute is dropped by the normaliser like every `id`; the ports compute the
same fallback id (a hash of the definition) when there is none, Java its own.
