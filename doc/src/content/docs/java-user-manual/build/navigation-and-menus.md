---
title: "Navigation and menus"
---

Navigation in Mateu is derived from your object model.

You declare menus as annotated fields. Mateu generates the navigation structure, sidebar, breadcrumbs and routing automatically.

---

## The six kinds of menu entry

### 1. ViewModel reference

The most common case. A `@Menu` field that points to another class generates a menu entry that navigates to that class's UI.

```java
@Menu
Products products;

@Menu
Changes changes;
```

- The class is a mount (`@UI`) or is bound to a route in [`routes.yaml`](/java-ui-definition/route-registry/)
- Mateu uses the class name (or `@Title`) as the menu label
- The instance is created and managed by Mateu (or Spring, if it is a bean)

---

### 2. String route

A `@Menu` field of type `String` generates a navigation link to that path.

```java
@Menu
String page3 = "/page3";
```

Use this when the target already has a `@UI` mount or a `routes.yaml` route elsewhere, and you only want a link to it.

---

### 3. RouteLink

A `RouteLink` lets you specify a route **and** a custom label explicitly.

```java
@Menu
RouteLink page4 = new RouteLink("/page4", "Page 4");
```

Use `RouteLink` instead of a plain `String` when you need a label different from the field name.

---

### 4. RemoteMenu

A `RemoteMenu` fetches navigation items from a remote Mateu service.

```java
@Menu
RemoteMenu workflow = new RemoteMenu("http://localhost:8105/_workflow");
```

The remote service exposes its own `@Menu` structure. The shell fetches and merges it into the navigation at runtime. That fetch is cached briefly per remote and caller — see [descriptor caching](/mateu-about/shell-and-remote-menus/#descriptor-caching) for the TTL and how to tune it.

Give the entry a label when you want the shell to name the section — it then stays, whatever the
remote calls itself, and the menu does not change under the reader when the remote answers:

```java
@Menu
RemoteMenu booking = new RemoteMenu("/_booking").withLabel("Call center");
```

A remote that is down leaves its section dimmed and retried, not a broken shell; on a cold load the
section and the first breadcrumb are known before the remote answers. See
[how the menus are merged](/mateu-about/shell-and-remote-menus/#how-the-menus-are-merged).

This is the foundation of the [distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/) pattern: each microservice owns its UI, and the shell composes everything.

---

### 5. Nested ViewModel (sub-menus)

A `@Menu` field that points to a class which itself has `@Menu` fields creates a **nested menu group**.

```java
// In Home2
@Menu
NestedApp nestedApp;

// NestedApp defines its own sub-menu
public class NestedApp {

    @Menu
    Page1 page1;

    @Menu
    Page2 page2;
}
```

`NestedApp` becomes a menu section header. `Page1` and `Page2` appear under it.

Route nesting (a sub-route that renders inside a parent screen's slot) is declared as data in
[`routes.yaml`](/java-ui-definition/route-registry/#nested-routes-a-sub-route-in-a-parents-slot)
with `children:`, not by an annotation.

---

### 6. Empty String (placeholder)

A `@Menu String` field with no value renders a menu entry using the field name as label, with no navigation target.

```java
@Menu
String xxx;
```

Useful as a placeholder during development, or as a section header with no own page.

---

## A leaf is a route or a rule

Every menu leaf above is a **route** — clicking it navigates. The other primitive is a **rule**: a
leaf that runs a client-side action instead of navigating. A `@Menu` field typed `Rule` (or
`List<Rule>`) becomes a rule leaf.

```java
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;

@Menu
Rule refresh =
    Rule.builder().action(RuleAction.RunAction).actionId("refreshAll").build();
```

- `RunAction` dispatches the action (the same path a FAB/header action uses), so "a menu item that
  runs something on the server" is a rule, not a special third kind of entry.
- `RunJS` runs a statement client-side.
- Clicking the leaf runs the rules; it does **not** navigate.

So the whole menu-leaf surface reduces to two things: a **route** (with the parameters, state and
data it carries — see [the route registry](/java-ui-definition/route-registry/)) or a **rule**.

---

## Full example

```java
@UI("/home2")
@Title("My first Mateu app")
public class Home2 {

    @Menu
    Products products;            // ViewModel → generates list/CRUD UI

    @Menu
    Changes changes;              // ViewModel → custom listing

    @Menu
    NestedApp nestedApp;          // ViewModel with sub-menus

    @Menu
    String xxx;                   // Placeholder

    @Menu
    String page3 = "/page3";     // Route string

    @Menu
    RouteLink page4 = new RouteLink("/page4", "Page 4");   // Route + custom label

    @Menu
    RemoteMenu workflow = new RemoteMenu("http://localhost:8105/_workflow"); // Remote
}
```

![Menu app — top navigation with Section 1 and Section 2 tabs](/images/docs/build/navigation.png)

---

## Nesting menus with routes.yaml

When a class is navigated to from a menu, Mateu needs to know where it sits in the route tree.

Declare it as an inner route of the parent mount — a [`type: Routes`](/java-ui-definition/route-registry/) file tagged with the mount's `basePath` (routes are relative to it; use `children` to nest a route in another route's slot):

```java
public class NestedApp {

    @Menu
    Page1 page1;

    @Menu
    Page2 page2;
}
```

```yaml
# src/main/resources/specs/ui/home2-routes.yaml — the inner routes of the @UI("/home2") mount
type: Routes
basePath: /home2
routes:
  - route: xxx
    viewModel: com.example.NestedApp
```

This tells Mateu:
- `/home2/xxx` is a child of `/home2` (it renders in the parent's slot)
- breadcrumbs and back navigation are generated accordingly
- `Page1` and `Page2` appear as sub-items under `NestedApp` in the sidebar

---

## Route parameters in navigation

Routes can contain parameters:

```java
public class ExampleParametersViewModel {

    String name;      // populated from :name in the URL

    int version;

    @ReadOnly
    String assessment;

    @Button
    void check() {
        assessment = "name= " + name + ", version=" + version;
    }
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: example/:name
    viewModel: com.example.ExampleParametersViewModel
```

Mateu populates `name` from the URL segment automatically when the page is navigated to.

---

## @UI vs routes.yaml

`@UI` is the only routing annotation; inner routes are data. The difference is in context:

| Declared with | Use when |
|---|---|
| `@UI("/path")` | Top-level entry point (mount) of the application or a module |
| a `routes.yaml` entry | A page nested under a `@UI` mount, or bound to a CRUD flow |

```java
@UI("/users")                          // top-level
public class UsersPage extends AutoCrud<User> {}

public class UserEditorPage {}           // bound to the /users CRUD in routes.yaml
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: users/:id/edit
    viewModel: com.example.UserEditorPage
```

---

## App shells and menus in code

The whole shell — chrome and menu — can be composed **in code** instead of with `@App`/`@Menu`,
computed at request time so the menu can depend on the user, configuration or a database. Implement
`AppSupplier` on the `@UI` class and return a fluent `AppShell`; or implement `MenuSupplier` to
compose just the menu and keep the rest of the shell declarative.

```java
@UI("/back-office")
public class BackOffice implements AppSupplier {
  @Override public AppShell getApp(HttpRequest request) {
    return AppShell.builder()
        .title("Back office")
        .variant(AppVariant.HAMBURGUER_MENU)
        .homeRoute("/back-office/home")
        .menu(List.of(
            new RouteLink("/back-office/home", "Home"),
            new Menu("/back-office/reports", "Reports", List.of(
                new RouteLink("/back-office/reports/sales", "Sales"))),
            // A leaf can also RUN a rule instead of navigating:
            new RuleLink("Approve", List.of(Rule.builder().actionId("approve").build()))))
        .build();
  }
}
```

The menu is a `List<Actionable>`, so both leaf kinds compose — a `RouteLink`/`ContentLink` that
navigates and a `RuleLink` that runs client-side rules (the [route-or-rule leaf](#a-leaf-is-a-route-or-a-rule)) —
plus `Menu` sub-trees and `RemoteMenu` federated entries.

**Parity.** `AppSupplier`/`MenuSupplier` (Java), `IAppSupplier`/`IMenuSupplier` + `AppShell` (.NET)
and `AppSupplier`/`MenuSupplier` + `AppShell` (Python) all compose the shell + menu in code,
overriding the static declarations; a field the shell leaves unset falls back to the declared
`@App`/`[App]`/`@app` value. Routes are likewise code-authorable — see the
[route registry](/java-ui-definition/route-registry/#authoring-routes-in-code).

## Mental model

- `@Menu` field type determines what kind of entry is generated
- `routes.yaml` (`basePath`, `children`) declares where a page sits in the route tree
- `@UI` declares a top-level entry point
- Nesting is achieved by pointing `@Menu` fields at classes that themselves have `@Menu` fields
- `RemoteMenu` lets the shell pull navigation from another service at runtime

---

## Next

- [Domain models](/java-user-manual/build/domain-models/) — how ViewModels connect to your backend architecture
- [CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/) — the list → view → edit flow generated by `AutoCrud`
- [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/) — using `RemoteMenu` to compose UIs across microservices
