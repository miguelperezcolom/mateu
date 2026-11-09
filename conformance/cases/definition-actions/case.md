# definition-actions

Pins a DEFINITION-ONLY page (a route with a `layout:` and no view model, served from this case's
own `specs/ui/`) that declares `actions:` beside its layout — the write half of the YAML DSL (Java's
`SeededYamlPage`).

What it pins:

- the page is WRAPPED in a server-side component (a bare layout carries no actions) that carries the
  route's `state:` seed as its initial data;
- it advertises exactly the DECLARED actions, never the `*` wildcard a class view advertises;
- `purge` declares `access: {roles: [admin]}` and the case is rendered anonymously: it is not
  advertised;
- `save` keeps `validationRequired`, its `restAction`'s `successMessage` and `successRoute` (a
  TEMPLATE the client resolves after the response merges) and its `body` uninterpolated;
- `remove` is PROXIED: its `${secret.…}` header never travels (the server makes that call through
  `__restfetch__`, from its own copy of the definition);
- `back` is a flow, lowered to its `NavigateTo` command;
- the `required: true` field gets the client validation a Java `@NotEmpty` field gets;
- `confirmOnNavigationIfDirty: true` on the Form reaches the wrapper.

The three runners render it with their specs directory pointed at `specs/ui/` here (a case with a
`specs/` directory is a YAML case) and the request in `request.json`.
