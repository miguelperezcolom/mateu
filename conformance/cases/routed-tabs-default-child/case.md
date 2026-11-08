# routed-tabs-default-child

A master that names its default tab (`defaultChild: notes`), reached on its own (`/conformance/rt/suppliers/3`).

What it pins (Java's `RouteRegistry.defaultChildOf` / `RouteChains.defaultChildPath`):

- its home is the child `defaultChild` names (`/notes`), not the first one.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
