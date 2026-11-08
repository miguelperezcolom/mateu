# routed-tabs-master

The master loaded by its type on its own route (`/conformance/rt/customers/7`).

What it pins (Java's `AppMenuBuilder.childRouteTabs`, `HomeRouteResolver.getHomeRoute`, `RouteChains.defaultChildPath`):

- an app with no menu of its own offers its VISIBLE registry children as its tabs, in authored order: label = the child's `@Title`, else its segment humanized; each option carries its concrete `route`, its `path` relative to the master, `consumedRoute`/`uriPrefix` = the master's concrete path (`audit`, whose flag is off, is left out);
- the app's `route`/`rootRoute` are that concrete path, and reached on its own it opens its DEFAULT tab — the first visible child — as its home (`homeRoute`, `homeConsumedRoute`).

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
