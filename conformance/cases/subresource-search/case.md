# subresource-search

The sub-resource island's search.

What it pins:

- the parent's context (`vcnId: 7`) hydrates the crud: the subnets of VCN 7 only.

Fixtures: `RtVcnDetail` at `/conformance/rt/net/:id` — `@Tab(key="details")`, then
`@Subresource(tab="gateways", order=2/1, help=…, context="vcnId=id")` NAT / internet gateways and
`@Subresource(tab="subnets", load=EAGER)` subnets, each an `AutoCrud` scoped by `vcnId`.
