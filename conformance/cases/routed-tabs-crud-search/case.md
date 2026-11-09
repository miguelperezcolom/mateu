# routed-tabs-crud-search

The CRUD tab's search.

What it pins:

- the crud gets the chain's path parameter (`customerId` 7) and lists that customer's orders only.

Fixtures: Java's `RoutedTabsRoutes` (route chains authored in code, the routes.yaml `children:`
twin) — `RtCustomerMaster` (`App(TABS)`, no menu) at `/conformance/rt/customers/:customerId`, and
`RtAccountMaster` at `/conformance/rt/accounts/:customerId` whose `orders` tab is a CRUD
(`RtAccountOrders`, entity `RtOrder` with a `customerId`).
