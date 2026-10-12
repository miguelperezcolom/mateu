---
title: "App shell and menus"
description: "The chrome around every page of a mount — title, variant, header widgets — and the menu, whose leaves either route somewhere or run an action."
---

The **app shell** is what surrounds every page of a [mount](/concepts/routes-and-mounts/): the
title and logo, the navigation variant, the header widgets and switches, and the **menu**. It is
one of the [building blocks](/concepts/building-blocks/).

An app shell is **not** a page. Its content area shows the current route's page, and when the URL
is the mount's root it shows the **home** route. The shell only draws the chrome around that slot.

## The menu

The menu is a list of entries, and every entry is one of these:

| Entry | What a click does |
|---|---|
| `RouteLink` | navigates to a route of the mount (or to a full URL) |
| `RuleLink` | runs client-side rules, typically one `RunAction` naming an [action](/concepts/action-catalogue/), instead of navigating |
| `Menu` | a group of entries, nestable. `presentation: {display: cards}` (or `@Menu(display = MenuDisplay.cards)`) opens it as a panel of cards |
| `RemoteMenu` | the menu of another Mateu service, fetched at runtime. This is how [federation](/mateu-about/shell-and-remote-menus/) composes several UIs into one console |

A menu leaf is therefore a **route or a rule**. A leaf that routes somewhere the caller may not
reach is not sent: a `RouteLink` inherits its route's [`access:`](/define/yaml/permissions/).

## Authoring it

The product catalogue's shell has one link and one leaf that runs the catalogue's `newProduct`
flow:

```yaml
# specs/ui/app.yaml — bound to the mount root ("") in routes.yaml
type: AppShell
title: Catalogue
variant: MENU_ON_TOP
themeToggle: true
menu:
  - type: RouteLink
    label: Products
    route: products
  - type: RuleLink
    label: New product
    rules:
      - action: RunAction
        actionId: newProduct
widgets:
  - type: Text
    text: "v1.0"
```

In Java the mount class carries the shell: `@App` for the chrome and `@Menu` fields for the menu.
A field's type decides what kind of entry it becomes:

```java
@UI("")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
@Title("Catalogue")
public class Catalogue {
  @Menu Products products;                                       // a page
  @Menu RouteLink archived = new RouteLink("/products/archived", "Archived");
}
```

For a menu that depends on the user, configuration or a database, implement `AppSupplier`, which
returns a fluent `AppShell`, or `MenuSupplier`, which returns just the menu. Both are evaluated per
request. C# uses `[App]` with `[MenuItem]` methods, or `IAppSupplier` / `IMenuSupplier`. Python uses
`@app` with `@menu_item`, or `AppSupplier` / `MenuSupplier`.

## The home page

The home page is the route the shell opens on. It resolves in this order: the shell's own
`homeRoute:`, then the mount's `home:`, then the first navigable menu item.

## Served vs static

- **Served**: the server builds the shell per request, so access rules, `AppSupplier`s and
  translated labels are applied before anything reaches the browser.
- **Static**: the bundle ships the shell. The shell's flows (`actions:` with `steps`) and catalogue
  actions are lowered to commands that run in the browser, so a `RuleLink` works with no backend.
  Access rules can't be checked without a server, so they are cosmetic there.
- **Ports**: .NET and Python have no `type: AppShell` file. They declare the shell in code, and they
  do carry the action catalogue.

## See also

- [App shell as data](/define/yaml/app-shell/): every key of `type: AppShell`, flows and widgets.
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/): the six kinds of `@Menu`
  entry, and shells in code.
- [Application shell](/java-user-manual/build/application-shell/): variants and layout.
- [UI federation](/mateu-about/ui-federation/).
