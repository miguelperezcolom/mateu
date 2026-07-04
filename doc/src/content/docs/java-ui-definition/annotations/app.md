---
title: "App Annotations"
description: "Annotations for defining the application shell, security, favicon and logo."
---

## @UI

**Target:** `TYPE`

The primary annotation. Registers a class as a UI endpoint and mounts it at the given route path. Every Mateu application needs at least one `@UI`-annotated class.

```java
public @interface UI {
    String value();                                         // required: route path e.g. "/orders"
    String indexHtmlPath() default "/static/_index.html";
    String frontendComponentPath() default "/assets/mateu.js";
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | URL path at which this UI is mounted |
| `indexHtmlPath` | `String` | `"/static/_index.html"` | Path to the HTML shell served for this UI |
| `frontendComponentPath` | `String` | `"/assets/mateu.js"` | Path to the compiled frontend component |

```java
@UI("/home")
@Title("My first Mateu app")
public class Home {

    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
    }
}
```

---

## @App

Marks a class as the application shell and selects its navigation layout variant.

```java
public @interface App {
    AppVariant value() default AppVariant.AUTO;
    AppLayout layout() default AppLayout.SINGLE_SLOT;
    boolean themeToggle() default false;
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `AppVariant` | `AUTO` | Navigation layout variant for the shell |
| `layout` | `AppLayout` | `SINGLE_SLOT` | Content area layout (`SINGLE_SLOT` or `SPLIT`) |
| `themeToggle` | `boolean` | `false` | Shows a moon/sun icon button in the header to switch dark/light mode |

**`AppVariant` values:**

| Value | Description |
|---|---|
| `HAMBURGUER_MENU` | Collapsible hamburger-style navigation drawer |
| `MENU_ON_LEFT` | Persistent navigation panel on the left side |
| `MENU_ON_TOP` | Navigation bar along the top |
| `TABS` | Tab-based navigation |
| `TILES` | Flat top-level nav; items with children open a tiles hub in the content area |
| `RAIL` | Compact icon rail on the left side |
| `AUTO` | Framework picks the variant from the menu shape (see below) |
| `MEDIATOR` | Used for nested sub-applications acting as a mediator |

With `AUTO` (the default), the variant is inferred from the menu: if any top-level item has grandchildren (menu depth > 2) → `TILES`; more than 7 top-level items → `HAMBURGUER_MENU`; otherwise `MENU_ON_TOP`. An app with no submenus at all renders as `TABS`. See [Navigation & Menus](/ux-patterns/navigation/) for the full behaviour of each variant.

**`AppLayout` values:**

| Value | Description |
|---|---|
| `SINGLE_SLOT` | Standard single-content-area layout (default) |
| `SPLIT` | Content area split into two panes |

```java
@UI("/app")
@App(AppVariant.HAMBURGUER_MENU)
public class ShellApp { ... }
```

### Dark / light mode toggle

Set `themeToggle = true` to show a moon/sun icon button in the application header. Clicking it switches between dark and light mode and persists the choice in `localStorage`. On first load the stored preference is applied; if no preference is stored the OS `prefers-color-scheme` media query is used as the default.

```java
@UI("/app")
@App(value = AppVariant.AUTO, themeToggle = true)
public class MyApp { ... }
```

---

## @PageTitle

**Target:** `TYPE`

Sets the browser tab title (`<title>` element in the HTML).

```java
public @interface PageTitle {
    String value();
}
```

```java
@UI("/orders")
@PageTitle("Orders – My App")
public class OrdersPage { ... }
```

---

## @Title

**Target:** `TYPE`

Sets the visible heading rendered inside the page, above the content area.

```java
public @interface Title {
    String value();
}
```

```java
@UI("/home")
@Title("My first Mateu app")
public class Home { ... }
```

> `@Title` controls the heading inside the page UI. `@PageTitle` controls the browser tab. Both can be combined.

---

## @Subtitle

**Target:** `TYPE`

Sets a subtitle displayed below the page title.

```java
public @interface Subtitle {
    String value();
}
```

```java
@UI("/products")
@Title("Product Catalog")
@Subtitle("Browse and manage all products")
public class ProductCatalog { ... }
```

---

## @Logo

**Target:** `TYPE`

Sets the URL of the image displayed as the application logo in the header or navigation drawer.

```java
public @interface Logo {
    String value();  // URL or path to the logo image
}
```

```java
@UI("/_workflow")
@Logo("/images/logo.svg")
public class WorkflowHome { ... }
```

---

## @FavIcon

**Target:** `TYPE`

Sets the browser favicon for the UI.

```java
public @interface FavIcon {
    String value();  // URL or path to the favicon
}
```

```java
@UI("/_workflow")
@FavIcon("/images/favicon.ico")
public class WorkflowHome { ... }
```

---

## @DrawerClosed

**Target:** `TYPE`

No attributes. Starts the navigation drawer in the closed (collapsed) state when the page is first loaded.

```java
@UI("/app")
@App(AppVariant.HAMBURGUER_MENU)
@DrawerClosed
public class ShellApp implements App { ... }
```

---

## @KeycloakSecured

**Target:** `TYPE`

Integrates Keycloak authentication. The frontend will redirect unauthenticated users to the Keycloak login page before the UI is displayed.

```java
public @interface KeycloakSecured {
    String url();
    String realm();
    String clientId();
    String jsUrl() default "";
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `url` | `String` | — | Keycloak server base URL |
| `realm` | `String` | — | Keycloak realm name |
| `clientId` | `String` | — | Keycloak client ID |
| `jsUrl` | `String` | `""` | Optional override for the Keycloak JS adapter URL |

```java
@UI("/_workflow")
@KeycloakSecured(
    url    = "https://auth.example.com",
    realm  = "myrealm",
    clientId = "my-app"
)
public class WorkflowHome { ... }
```

---

## @UISpec

**Target:** `TYPE`

Points to a YAML file that describes the UI declaratively instead of (or alongside) Java annotations.

```java
public @interface UISpec {
    String value();  // path to a YAML UI spec file
}
```

```java
@UI("/dashboard")
@UISpec("/specs/dashboard.yaml")
public class Dashboard { ... }
```

---

## @AI

**Target:** `TYPE`

Enables an AI assistant sidebar for the UI by wiring it to a Server-Sent Events (SSE) endpoint that streams AI responses.

```java
public @interface AI {
    String sse();  // SSE endpoint for AI assistant streaming
}
```

| Attribute | Type | Description |
|---|---|---|
| `sse` | `String` | Path to the SSE endpoint that provides AI responses |

```java
@UI("/support")
@AI(sse = "/api/ai/stream")
public class SupportPage { ... }
```

---

## Combined example

```java
@UI("/home")
@Title("My first Mateu app")
@Style(StyleConstants.CONTAINER)
public class Home {

    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
    }
}
```

A full application shell combining several annotations:

```java
@UI("/_workflow")
@FavIcon("/images/favicon.svg")
@PageTitle("Workflow Engine")
@Logo("/images/logo.svg")
@Title("Workflow Engine")
@KeycloakSecured(url = "https://auth.example.com", realm = "myrealm", clientId = "workflow")
public class WorkflowHome {

    @Menu
    WorkflowMenu workflow;
}
```
