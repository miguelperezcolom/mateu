# crud-search

Pins the SEARCH of the plain CRUD (the `crud` case's Products), not its first load: the
`request.json` sends `actionId: "search"` with the smart-search state a user builds — the enum
filter as a multi-select list (`status: [Available, OutOfStock]`), a sort clicked on a column header
(`{fieldId: price, direction: descending}`, the grid's own shape, not the `Sort` record's
`{field, …}`), and the second page of two rows.

What the three servers must agree on is the data fragment the listing paints: the filters applied
by the framework (the multi-select is an `in` over the constants), the sort, the window of the
page (`pageNumber`/`pageSize`) and the TOTAL of the filtered result (`totalElements` 3, so the
pager shows two pages), each row's cells by column id, and its `_rowNumber` — the position in the
whole result, which is what the web grid identifies rows by (`item-id-path="_rowNumber"`). The
ports used to send rows without it.

The free-text search is left empty on purpose: in the ports it is the developer's `Fetch(search)` /
`fetch(search)` that applies it (Java's `CrudStore.find` does it by default), so it is not framework
behaviour all three share. Row ids are not visible here because the normaliser drops every `id`
member outside `actions`; the product names identify the rows.
