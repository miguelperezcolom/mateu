# more-components

**Pins:** the last wire component types that used to exist only in Java and were ported to .NET
and Python for 3.0: the layouts `BoardLayout` (rows of items with `boardCols`), `CarouselLayout`
(`auto`/`duration`/`dots`/`loop`), `Container`, `FullWidth`, `Scroller`, `FormItem`,
`FormSubSection` (`title`) and `MasterDetailLayout` (`orientation`); the navigation pieces
`ContextMenu` (`activateOnLeftClick`, its `menu` entries and the `wrapped` component), `Directory`
(a menu tree) and `MenuBar`; the fluent `Grid` with a `GridGroupColumn` (a header spanning two
columns) and a page of rows; `Chat` (`sseUrl`), `MessageList` (items with `text`/`userName`) and
`MessageInput` (`actionId`); `NotFound` (`title`/`message`/`backRoute`/`backLabel`); `VirtualList`
(a page of components); `CookieConsent` (`message`/`dismiss`/`position`); `FormEditor` and
`Workflow` (`value`).

Worth pinning because none of these could be produced by a .NET or Python app before, and their
member names and where their parts travel (metadata vs children) must agree across the three
mappers for any renderer to draw them.
