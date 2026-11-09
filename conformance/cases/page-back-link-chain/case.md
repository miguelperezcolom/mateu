# page-back-link-chain

A page under a record master that offers "← Parent" (`@App(backLink = PARENT)`, .NET
`[App(BackLink = BackLink.Parent)]`, Python `@app(back_link=BackLink.PARENT)`) through a route
chain: the master is bound — in code, the routes.yaml twin (`RouteEntrySupplier` /
`IRouteEntrySupplier` / `RouteEntrySupplier`), so each runner names its own classes — to
`/conformance/bl-chain/:customerId`, with a child `orders` route bound to the tab's view model.

The request (request.json) is the content load of the tab inside the master
(`route = /conformance/bl-chain/7/orders`, `consumedRoute = /conformance/bl-chain/7`, fixture type =
the tab).

Pins, on the tab's page: `noBreadcrumbs: true` — the page declares nothing; the server turns the
trail off because a link of the request's route chain above it is a back-link app (Java's
`PageMapper` + `RouteChains.insideBackLinkApp`).
