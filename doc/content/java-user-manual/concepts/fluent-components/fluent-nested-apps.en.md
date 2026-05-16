---
title: "Nested apps"
weight: 11
---

# Nested apps

A nested app is a self-contained sub-application embedded inside a page. It has its own navigation structure (menu, tabs, or left sidebar) and its own set of routes — all scoped under a parent route.

Use nested apps to build sections within a larger application that need their own navigation, like an "Admin" section or a "Settings" panel.

---

## The pattern

Implement `AppSupplier` and return an `App` from `getApp()`:

```java
@Route(value = "/admin", parentRoute = "")
public class AdminApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
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

Pages within the app declare their parent route:

```java
@Route(value = "/admin/home", parentRoute = "/admin")
public class AdminHomePage implements ComponentTreeSupplier {
    // ...
}
```

---

## App variants

Three layout variants control where the navigation appears.

### Menu on left

```java
App.builder()
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
App.builder()
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
App.builder()
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
App.builder()
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

Routes in `RouteLink` are relative to the app's root route by convention. The full route is resolved by `@Route` on the target page.

---

## Registering app routes

Add `@HomeRoute` to the app class to declare the landing page, and `@Route(parentRoute = "/app-route")` on each page within it:

```java
@Route(value = "/admin", parentRoute = "")
@HomeRoute("/admin/home")
public class AdminApp implements AppSupplier { ... }

@Route(value = "/admin/home", parentRoute = "/admin")
public class AdminHome implements ComponentTreeSupplier { ... }

@Route(value = "/admin/users", parentRoute = "/admin")
public class AdminUsers implements ComponentTreeSupplier { ... }
```

---

## Next

- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/)
- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/)
