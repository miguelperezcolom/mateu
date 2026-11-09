# routed-tabs-tab

The `orders` tab loaded by its type inside the master (`/conformance/rt/customers/7/orders`, consumedRoute `/conformance/rt/customers/7`).

What it pins (Java's `PageMapper` + `RouteChains.dedupeTitle`):

- the tab's page does NOT repeat the tab's label as its title (`@Title("Orders")` is the label): the label is drawn once, by the tab — the window title keeps it;
- the path parameter of the chain (`customerId`) is the tab's state.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
