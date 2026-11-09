# subresource-only

A page holding only a read-only field and a `@Subresource` (`/conformance/rt/only/7`).

What it pins:

- it is still a form: the field above, the sub-resource in a tab of its own named after the field.

Fixtures: `RtVcnDetail` at `/conformance/rt/net/:id` — `@Tab(key="details")`, then
`@Subresource(tab="gateways", order=2/1, help=…, context="vcnId=id")` NAT / internet gateways and
`@Subresource(tab="subnets", load=EAGER)` subnets, each an `AutoCrud` scoped by `vcnId`.
