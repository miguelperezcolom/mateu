# routed-tabs-segment-tab

The `notes` tab (no `@Title`: labelled "Notes" by its segment) loaded inside the master.

What it pins (Java's `RouteChains.dedupeTitle`):

- a page title that differs from the tab's label (here the humanized class name) is kept.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
