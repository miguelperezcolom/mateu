# routed-tabs-key-in-url

The same page on the URL of one of its tabs (`/conformance/rt/vcn/7/gateways`).

What it pins (Java's `ActionInstanceCreator.mountOf` + `FormLayoutBuilder.routedTabKey`):

- the page answering the shortest prefix bound to it (`/conformance/rt/vcn/7`) renders, with its path parameter;
- the tab whose key the route ends with is the `active` one.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
