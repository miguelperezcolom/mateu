# routed-tabs-crud-listing

The CRUD tab's listing (`/conformance/rt/accounts/7/orders`, its content load).

What it pins:

- the crud is resolved where it is MOUNTED (the shortest prefix bound to it), not by reading `/orders` as a record id;
- its filter named like the chain's path parameter (`customerId`) is `readOnly`: the route fixes it (Java's `CrudlMapper.routeScope`); the tab's label is not repeated as the listing title.

Fixtures: Java's `RoutedTabsRoutes` (route chains authored in code, the routes.yaml `children:`
twin) — `RtCustomerMaster` (`App(TABS)`, no menu) at `/conformance/rt/customers/:customerId`, and
`RtAccountMaster` at `/conformance/rt/accounts/:customerId` whose `orders` tab is a CRUD
(`RtAccountOrders`, entity `RtOrder` with a `customerId`).
Mediator protocol (actions, state, the route the form answers on) is left out, as in `crud`.
