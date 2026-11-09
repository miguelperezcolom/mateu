# page-back-link-code-shell

The `page-back-link-chain` tab under a different master (`/conformance/bl-shell/7/orders`): one
whose "← Parent" link is declared by its CODE shell (`AppSupplier` / `IAppSupplier` /
`AppSupplier` returning a shell with `backLink = PARENT`) and NOT by `@App(backLink = PARENT)`.

Pins: the tab's page keeps its trail (no `noBreadcrumbs`). Java's `RouteChains.insideBackLinkApp`
reads the chain ancestor's `@App` only, so a code shell's back link draws the app's own "← Parent"
link (`AppMapper.backLinkParent` honours it) without turning off the trail of the pages under it —
arguably narrower than intended, but the reference's behaviour, which the ports now match.
