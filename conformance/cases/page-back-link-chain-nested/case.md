# page-back-link-chain-nested

The `page-back-link-chain` master's second tab, `delivery` (`/conformance/bl-chain/7/delivery`,
consumedRoute `/conformance/bl-chain/7`): a form holding a plain nested data object (`shipping`, a
`DeliveryInfo`) drawn as a sub-form inside an outlined card.

Pins: `noBreadcrumbs: true` on the tab's page AND on the sub-form's page, which travels in the
card's METADATA (`content`), not among its children — Java's `PageMapper` marks every page it maps
while the request runs under a back-link app, wherever the page sits. The ports' back-link pass
walks the components a metadata record holds (a card's, a drawer's, a dialog's content) as well as
the children.
