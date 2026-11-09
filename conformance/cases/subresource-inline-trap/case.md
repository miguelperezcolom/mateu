# subresource-inline-trap

An `@Inline` orchestrator field whose type has no route of its own (`/conformance/rt/trap`).

What it pins:

- it fails where the cause is ("…an orchestrator with no route of its own…", shown in detailed errors) instead of loading the app's root inside itself forever; the wire is the error boundary's generic message.

Fixtures: `RtVcnDetail` at `/conformance/rt/net/:id` — `@Tab(key="details")`, then
`@Subresource(tab="gateways", order=2/1, help=…, context="vcnId=id")` NAT / internet gateways and
`@Subresource(tab="subnets", load=EAGER)` subnets, each an `AutoCrud` scoped by `vcnId`.
