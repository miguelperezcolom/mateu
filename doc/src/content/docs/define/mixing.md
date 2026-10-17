---
title: "Mixing YAML and code"
description: "Layout from a YAML definition, behaviour from a view model in Java, C# or Python — bound by a route, or by @UISpec in Java."
---

YAML and code are not two products. They meet in the same model, so one screen can take its
**layout** from a YAML file and its **behaviour** — state, actions, validation, data access — from a
class.

Use this when a screen is designed visually (or by someone who does not write the server code) but
needs logic that only a server can run.

## Bind them in the route

The [route registry](/concepts/routes-and-mounts/) binds a route to a layout and a view model
independently:

```yaml
# specs/ui/routes.yaml
type: Routes
routes:
  - route: customer-form
    layout: customer-form.yaml
    viewModel: com.example.CustomerFormViewModel
```

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
public class CustomerFormViewModel {
    public String name;
    public String email;

    @Button
    public void save() { /* … */ }
}
```

`customer-form.yaml` holds the component tree; its fields are bound to the view model's state by
id, and its buttons run the view model's methods. The .NET and Python servers read the same
`routes.yaml` (they accept `viewModel` and `view_model`).

Because layout and view model are bound by the route, not by each other:

- one definition can serve several view models — so a shared definition must **not** name a view
  model itself, or it can only serve that one;
- one view model can answer several routes with different [pinned parameters](/concepts/routes-and-mounts/);
- a route can have **no** view model at all, which is the pure-YAML case.

## Or bind them in the class (Java)

In Java, `@UISpec` points a view model at its layout file directly:

```java
@UISpec("specs/ui/customer-form.yaml")
public class CustomerFormViewModel { /* … */ }
```

See [`@UISpec`](/java-ui-definition/annotations/uispec/).

## Keep inference alive with a delta

A YAML `layout:` replaces what Mateu would infer from the class. A `layoutDelta:` instead records
only what a person changed — order, hidden fields, overrides — and is re-applied on top of the
inferred layout on every request, so fields the class gains later still appear. The visual editor
writes deltas when it can. See [`layoutDelta:`](/define/yaml/pages/#layoutdelta--keep-inference-alive).

## What goes where

| Concern | YAML | Code |
|---|---|---|
| Arrangement, labels, sections, tabs | ✓ | ✓ |
| Reading and writing REST APIs | ✓ ([data sources](/concepts/data-sources/)) | ✓ |
| Logic that needs a server (database, domain rules, secrets) | via a proxied source | ✓ |
| Validation | client rules | client + server |
| Deployable without a backend | ✓ | — |

## Related

- [Pages in YAML](/define/yaml/pages/)
- [The model](/mateu-about/the-model/) — the precedence rules when both say something
- [The authoring rule](/authoring-rule/)
