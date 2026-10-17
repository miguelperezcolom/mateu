---
title: "Application shell"
---

The application shell is the outer frame of your Mateu application: the navigation sidebar or tab bar, the logo, the title, and the top-level menu structure.

It is defined by the `@UI` class (declarative API) or the `AppSupplier` class (fluent API).

---

## Declarative API shell

Annotate a class with `@UI` to make it the application root:

```java
@UI("")
@Title("My Backoffice")
@PageTitle("My Backoffice — Admin")
@Logo("/images/logo.svg")
@FavIcon("/images/favicon.png")
public class MyApp {

    @Menu
    Products products;

    @Menu
    Orders orders;

    @Menu
    @EyesOnly(roles = "admin")
    AdminPanel admin;
}
```

---

## Shell annotations

| Annotation | Effect |
|---|---|
| `@UI("path")` | Declares the app root and its base path (`""` = root) |
| `@Title("text")` | Heading shown in the app shell (sidebar or header) |
| `@Subtitle("text")` | Subheading shown below the title |
| `@PageTitle("text")` | Browser tab `<title>` tag |
| `@Logo("/path")` | Logo image shown in the shell header |
| `@FavIcon("/path")` | Browser favicon |
| `@DrawerClosed` | Start with the navigation drawer collapsed |
| `@Style("css")` | Inline CSS on the app container |
| `implements HomeRouteSupplier` | Default landing route when the app loads (`homeRoute()` returns the path; without it, the app's first menu item) |

---

## Fluent API shell

Use `AppSupplier` + `AppShell.builder()` for programmatic control:

```java
public class AdminApp implements AppSupplier {

    @Override
    public AppShell getApp(HttpRequest httpRequest) {
        return AppShell.builder()
                .pageTitle("My Backoffice — Admin")
                .title("My Backoffice")
                .subtitle("Internal tools")
                .logo("/images/logo.svg")
                .favicon("/images/favicon.png")
                .variant(AppVariant.MENU_ON_LEFT)
                .homeRoute("/admin/home")
                .menu(List.of(
                        new RouteLink("/home",     "Dashboard"),
                        new RouteLink("/products", "Products"),
                        new RouteLink("/orders",   "Orders"),
                        new Menu("/settings", "Administration", List.of(
                                new RouteLink("/users",    "Users"),
                                new RouteLink("/config",   "Configuration")
                        ))
                ))
                .build();
    }
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: admin
    viewModel: com.example.AdminApp
```

### AppShell.builder() branding properties

| Property | Effect |
|---|---|
| `pageTitle` | Browser tab title |
| `title` | Heading in the shell header |
| `subtitle` | Subheading below the title |
| `logo` | Logo image URL |
| `favicon` | Browser favicon URL |
| `variant` | Layout variant (see below) |
| `homeRoute` | Default landing route |
| `drawerClosed` | Start with drawer collapsed |
| `style` | Inline CSS on the app container |
| `cssClasses` | CSS class names on the app container |

---

## Layout variants

| `AppVariant` | Navigation position |
|---|---|
| `TABS` | Tab bar at the top (what the default, `AUTO`, picks for a menu with no groups) |
| `MENU_ON_LEFT` | Collapsible sidebar on the left |
| `MENU_ON_TOP` | Horizontal nav bar at the top (`AUTO`'s pick for a menu with groups, ≤ 7 entries, one level deep, or one with remote menus) |
| `HAMBURGER_MENU` | A hamburger button opening the whole menu in a drawer (`AUTO`'s pick for more than 7 top-level entries with groups). `HAMBURGUER_MENU` is its deprecated misspelling |
| `HAMBURGER_SECTIONS` | The hamburger holds the sections (first level) and a band under the header the entries of the section on screen; `AUTO` never picks it |
| `TILES` | A top bar whose groups open as a hub of tiles (`AUTO`'s pick for a menu nested more than one level deep) |
| `RAIL` | A narrow icon rail on the left whose groups open a side panel |

`AUTO` (the default) applies the rules in parentheses (`AppMetadataExtractor.getVariant`).

---

## Style helpers

`StyleConstants` provides four ready-made style values:

```java
import io.mateu.uidl.StyleConstants;

@Style(StyleConstants.CONTAINER)                 // max-width: 900px; margin: auto;
@Style(StyleConstants.FULL_WIDTH)                // width: 100%;
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)   // width: 100%; with side padding
@Style(StyleConstants.COMPACT)                   // the high-density preset @Compact applies
```

Or use arbitrary CSS:

```java
@Style("max-width: 1200px; margin: auto;")
```

---

## Changing branding at runtime

In the fluent API, `getApp()` receives the `HttpRequest`, so branding can be dynamic:

```java
@Override
public AppShell getApp(HttpRequest httpRequest) {
    String tenant = httpRequest.getHeaderValue("X-Tenant-Id");
    TenantConfig config = tenantConfigService.get(tenant);

    return AppShell.builder()
            .title(config.appName())
            .logo(config.logoUrl())
            .favicon(config.faviconUrl())
            .variant(AppVariant.MENU_ON_LEFT)
            .menu(buildMenu(config))
            .build();
}
```

From an action, use `UICommand` to change the favicon or window title without a full reload:

```java
// Change favicon from an action
return UICommand.builder()
        .type(UICommandType.SetFavicon)
        .data("/images/alert-favicon.png")
        .build();

// Change window title from an action
return UICommand.builder()
        .type(UICommandType.SetWindowTitle)
        .data("(3 alerts) My Backoffice")
        .build();
```

---

## Header widgets

The `@UI` class can implement `WidgetSupplier` to place components in the app **header** — the
widgets slot on the right of the header bar (a user badge, a search box, a custom control). They do
not fill the main area:

```java
@UI("")
@Title("My Backoffice")
public class MyApp implements WidgetSupplier {

    @Menu Products products;
    @Menu Orders orders;

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        return List.of(
                new Text("Signed in as Ada")
        );
    }
}
```

For home-page content — a welcome screen or a dashboard — make the home route a page of its own
(a `Dashboard` or `Welcome` archetype) and name it with `homeRoute`. See
[Dashboard home page](/java-user-manual/build/dashboard-home-page/).

---

## Security

Log the user in with your framework's security (Spring Security, Quarkus OIDC… — Mateu reads the
principal it authenticates) and combine the shell with `@EyesOnly`:

```java
@UI("")
@Title("My Backoffice")
public class MyApp {

    @Menu
    Products products;          // visible to all authenticated users

    @Menu
    @EyesOnly(roles = "admin")
    AdminPanel admin;           // only visible to admins
}
```

See [Security](/java-user-manual/advanced/security/) for details.

---

## Next

- [Dashboard home page](/java-user-manual/build/dashboard-home-page/) — build KPI cards, charts, and activity feeds as the landing page
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/) — declare menu entries, sub-menus, route links, and remote menus
- [Security](/java-user-manual/advanced/security/) — where identity comes from, and `@EyesOnly` for role-based visibility
