# routed-tabs-keys

A page with in-page tabs that are URLs (`@Tab(key)`), on its own route (`/conformance/rt/vcn/7`).

What it pins (Java's `FormLayoutBuilder` + `FormTabArranger`):

- every tab carries its key as `routeKey`; none is `active` (the renderer opens the first);
- a tab whose `show` flag is off (`Simulator`) is not offered at all, its fields with it;
- the fields declared BEFORE the first tab sit in a form layout of their own above the tab strip.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
