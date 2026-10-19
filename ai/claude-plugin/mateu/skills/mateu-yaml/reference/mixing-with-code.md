# YAML layout + code behaviour

The layout can come from YAML while state and actions come from a **view model** class (Java, C#
or Python). Binding is by convention: a `FormField id: name` binds the view model's `name`
field/property, a `Button actionId: greet` runs its `greet()` method.

```yaml
# specs/ui/routes.yaml — the route binds layout and view model independently
- route: greeter
  layout: greeter.yaml
  viewModel: com.example.app.Greeter        # .NET: Namespace.Type · Python: module.Class
```

```yaml
# specs/ui/greeter.yaml — layout only (no viewModel: here, so it could serve other routes too)
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Form
title: Greeter
content:
  - type: FormLayout
    content:
      - {type: FormField, id: name, label: Name, dataType: string}
      - {type: FormField, id: greeting, label: Greeting, readOnly: true}
buttons:
  - {type: Button, label: Greet, actionId: greet, buttonStyle: primary}
```

```java
package com.example.app;

import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import java.util.List;

public class Greeter {               // NOT a bean: instantiated fresh per request
  public String name;
  public String greeting;

  public Object greet() {            // public (or @Action) — a package-private method is not runnable
    greeting = "Hello, " + name;
    return List.of(new Message(greeting), new State(this));
  }
}
```

- Spring MVC serves this with no annotation processor (the yaml starter + one class). A
  framework-agnostic `@UI` module or another adapter needs the usual processor wiring (see the
  `mateu-scaffold` skill).
- Strict action mode (the default): an action runs only if it is a method marked
  `@Action`/`@Button`/`@Toolbar`… or a public method the view's own tree names (as `greet` here).
- Variants: `@UISpec("specs/ui/customer-form.yaml")` on a Java class loads its tree from that file;
  a page with `viewModel:` + `layoutDelta:` (instead of `layout:`) keeps the class's inferred layout
  and applies only recorded tweaks (`order`, `hidden`, `overrides`) — what the visual editor writes.
- One layout, several view models: two route entries with the same `layout:` and different
  `viewModel:` — so the shared layout must not name a `viewModel:` itself.
- A Java `@UI` class can be the mount while `routes.yaml` (with `basePath:` of that mount) adds
  inner routes; an entry for `""` can even re-point the mount root to a `type: AppShell` file.
- Routes, app shells and menus can also be authored in code: `RouteEntrySupplier`,
  `AppSupplier`/`MenuSupplier` + `AppShell.builder()` (Java beans), `IRouteEntrySupplier`… (.NET),
  `RouteEntrySupplier`… (Python). Precedence: **`routes.yaml` > code supplier > annotations**.
- C# and Python: the same YAML files, under `specs/ui/` in the working directory (or
  `MATEU_SPECS_DIR`); bind with `viewModel: Namespace.Type` / `viewModel: package.module.Class`.
  Their shell comes from the app class (no `type: AppShell` there).
