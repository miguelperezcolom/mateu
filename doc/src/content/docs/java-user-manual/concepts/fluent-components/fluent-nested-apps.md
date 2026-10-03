---
title: "Nested apps"
---

A nested app is a self-contained sub-application embedded inside a page. It has its own navigation structure (menu, tabs, or left sidebar) and its own set of routes — all scoped under a parent route.

Use nested apps to build sections within a larger application that need their own navigation, like an "Admin" section or a "Settings" panel.

---

## The pattern

Implement `AppSupplier` and return an `AppShell` from `getApp()`:

```java
public class AdminApp implements AppSupplier {

    @Override
    public AppShell getApp(HttpRequest httpRequest) {
        return AppShell.builder()
                .pageTitle("Admin panel")
                .title("Admin")
                .subtitle("Manage your application")
                .variant(AppVariant.MENU_ON_LEFT)
                .homeRoute("/admin/home")
                .menu(List.of(
                        new RouteLink("/home", "Home"),
                        new RouteLink("/users", "Users"),
                        new Menu("/settings", "Settings", List.of(
                                new RouteLink("/profile", "Profile"),
                                new RouteLink("/security", "Security")
                        ))
                ))
                .build();
    }
}
```

The app and the pages within it are bound to their URLs by [`routes.yaml` entries](/java-ui-definition/route-registry/), the pages under the app's route:

```java
public class AdminHomePage implements ComponentTreeSupplier {
    // ...
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: admin
    viewModel: com.example.AdminApp
  - route: admin/home
    viewModel: com.example.AdminHomePage
```

---

## App variants

Three layout variants control where the navigation appears.

### Menu on left

```java
AppShell.builder()
        .variant(AppVariant.MENU_ON_LEFT)
        .homeRoute("/app/home")
        .menu(List.of(
                new RouteLink("/home", "Home"),
                new RouteLink("/page1", "Page 1"),
                new Menu("/submenu", "Submenu", List.of(
                        new RouteLink("/home", "Home"),
                        new RouteLink("/page1", "Page 1")
                ))
        ))
        .build()
```

The left sidebar shows the menu. `homeRoute` is the default landing page.

### Menu on top

```java
AppShell.builder()
        .variant(AppVariant.MENU_ON_TOP)
        .menu(List.of(
                new RouteLink("/home", "Home"),
                new RouteLink("/page1", "Page 1")
        ))
        .build()
```

Navigation appears as a horizontal bar at the top.

### Tabs

```java
AppShell.builder()
        .variant(AppVariant.TABS)
        .menu(List.of(
                new RouteLink("/home", "Home"),
                new RouteLink("/page1", "Page 1")
        ))
        .build()
```

Navigation appears as tabs. Each `RouteLink` becomes a tab.

---

## App properties

```java
AppShell.builder()
        .pageTitle("Browser tab title")      // sets the <title> tag
        .title("Displayed heading")          // shown inside the app shell
        .subtitle("Short description")       // shown below the title
        .variant(AppVariant.MENU_ON_LEFT)    // layout variant
        .homeRoute("/app/home")              // default route when app loads
        .menu(List.of(...))                  // navigation items
        .build()
```

---

## Menu items

| Type | Usage |
|---|---|
| `new RouteLink("/path", "Label")` | Link to a route within the app |
| `new Menu("/path", "Label", List.of(...))` | Submenu group with children |

Routes in `RouteLink` are relative to the app's root route by convention. The full route is resolved by the target page's [`routes.yaml` entry](/java-ui-definition/route-registry/).

---

## Registering app routes

Declare the app and each page within it as entries in `routes.yaml`, the pages under the app's route. The landing page is the shell's `homeRoute` (without one, the app's first menu item); a class-level app can also implement `HomeRouteSupplier`:

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: admin
    viewModel: com.example.AdminApp
  - route: admin/home
    viewModel: com.example.AdminHome
  - route: admin/users
    viewModel: com.example.AdminUsers
```

---

## Next

- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/)
- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/)
