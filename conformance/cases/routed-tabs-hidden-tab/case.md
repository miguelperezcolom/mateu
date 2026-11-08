# routed-tabs-hidden-tab

The master on the URL of a tab whose `show` flag is off (`/conformance/rt/customers/7/audit`).

What it pins (Java's `RouteChains.visibleChildrenOf` + `FeatureFlagGate`):

- the tab is left out of the bar, but its route still answers: it is the master's home.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
