# routed-tabs-deep-link

A FRESH load naming no type (`consumedRoute: _empty`, request.json `"serverSideType": null`) of
a tab's URL, `/conformance/rt/customers/7/orders` — a reload, a pasted link.

What it pins:

- the chain's outermost level not on screen is an app ANCESTOR, so the master answers: its tabs, the tab the URL names `selected` and as its home (Java's `RouteChains.pendingAppAncestor`).

Fixtures: Java's `RoutedTabsRoutes` (route chains authored in code, the routes.yaml `children:`
twin) — `RtCustomerMaster` (`App(TABS)`, no menu) at `/conformance/rt/customers/:customerId`, and
`RtAccountMaster` at `/conformance/rt/accounts/:customerId` whose `orders` tab is a CRUD
(`RtAccountOrders`, entity `RtOrder` with a `customerId`).
