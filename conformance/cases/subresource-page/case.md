# subresource-page

The VCN detail (`/conformance/rt/net/7`).

What it pins:

- sub-resources go to the tabs they name after the declared ones (`details`, `gateways`, `subnets`), a new tab keyed by its kebab-cased name;
- several stack in one tab in their `order`, each an embedded MEDIATOR island at `/_subresource/<Host>/<field>` with markers `_embeddedMediator`, `_hideTitle`, `_scope=vcnId`, `_lazy` (ON_OPEN), the parent's context (`vcnId: 7`) in its initialData, its title (h3) and help line above it;
- an EAGER one carries no `_lazy`, counts its rows on the tab (`badge: 3`) and, alone in its tab, draws no title.

Fixtures: `RtVcnDetail` at `/conformance/rt/net/:id` — `@Tab(key="details")`, then
`@Subresource(tab="gateways", order=2/1, help=…, context="vcnId=id")` NAT / internet gateways and
`@Subresource(tab="subnets", load=EAGER)` subnets, each an `AutoCrud` scoped by `vcnId`.
