# fluent-crudl-options

**Pins:** every option of the fluent listing (Java's fluent `Listing`, the ports'
`ListingComponent`) the ports did not carry before 3.0 GA, on one listing: `crudlType` `card`,
`size`, `initialPage`, the `header`/`footer`/`preSearch` components, the `toolbar` and the
`groupActions`, `detailPath` + `useButtonForDetail`, `lazyColumnRendering`, `lazyLoading`,
`infiniteScrolling`, `vaadinGridCellBackground`/`vaadinGridCellPadding`,
`onRowSelectionChangedActionId`, `contentHeight`, `searchOnEnter`/`autoFocusOnSearchText` off,
`groupBy`, `rowStatusField`, `dragType` and `rowsSelectionEnabled`.

Worth pinning because a listing authored in code must reach the renderer with the same member
names and the same parts (components in `header`/`footer`/`preSearch`, buttons in `toolbar`/
`groupActions`) whichever server built it.

Not here: `child`, `showCards`, `selectionListened`, `hasActionOnSelectedRow` and
`multipleRowSelectionEnabled` — `CrudlDto` declares them but no Java producer sets them, so there
is nothing to pin.
