# subresource-listing

A sub-resource island's own load (`/_subresource/RtVcnDetail/subnets?…&_scope=vcnId`, type `RtSubnets`, state `vcnId: 7`).

What it pins:

- the island is addressed by its type under the host's `/_subresource/` namespace;
- its `vcnId` filter is `readOnly` (the island's `_scope`), the listing draws no title (`_hideTitle`) and does not name the window.

Fixtures: `RtVcnDetail` at `/conformance/rt/net/:id` — `@Tab(key="details")`, then
`@Subresource(tab="gateways", order=2/1, help=…, context="vcnId=id")` NAT / internet gateways and
`@Subresource(tab="subnets", load=EAGER)` subnets, each an `AutoCrud` scoped by `vcnId`.
Mediator protocol is left out, as in `crud`.
