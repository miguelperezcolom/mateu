# routed-tabs-master-on-tab

The master loaded by its type on one of its tabs' URLs (`/conformance/rt/customers/7/notes`) — a deep link, a reload, back/forward.

What it pins (Java's `ActionInstanceCreator` app-not-on-screen branch (`mountOf`)):

- the master renders ITSELF (not the tab): its tabs, and the rest of the path as its home;
- the option the URL names is `selected`.

The routed-tabs fixtures (Java's `RoutedTabsRoutes`, authored in code like the routes.yaml
`children:` twin, and `ConformanceFlags`: `audit` and `simulator` off): a record master
`RtCustomerMaster` — an `App(TABS)` with no menu, bound to `/conformance/rt/customers/:customerId`
with the children `orders` (`RtOrdersTab`, `@Title("Orders")`), `notes` (`RtNotesTab`, no title)
and `audit` (`show: audit`); `RtSupplierMaster` at `/conformance/rt/suppliers/:supplierId`
(`defaultChild: notes`); `RtVcnPage` at `/conformance/rt/vcn/:id` with in-page `@Tab(key)` tabs.
