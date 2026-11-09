# routed-tabs-crud-new

The CRUD tab's creation form (`/conformance/rt/accounts/7/orders/new`).

What it pins:

- a new child record starts with its field named like the chain's path parameter filled in (`customerId: 7` — Java's `RouteChains.scopeValuesFor`): the form's state is pinned for this case (`FORM_STATE_PINNED`, only `_`-prefixed routing keys are protocol).

Fixtures: Java's `RoutedTabsRoutes` (route chains authored in code, the routes.yaml `children:`
twin) — `RtCustomerMaster` (`App(TABS)`, no menu) at `/conformance/rt/customers/:customerId`, and
`RtAccountMaster` at `/conformance/rt/accounts/:customerId` whose `orders` tab is a CRUD
(`RtAccountOrders`, entity `RtOrder` with a `customerId`).
