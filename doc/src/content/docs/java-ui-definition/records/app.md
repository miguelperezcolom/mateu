---
title: "App"
---

The full application shell record. Use it to define the top-level structure of a Mateu application, including navigation menu, layout variant, header, favicon, and home route.

```java
@Builder
@With
public record App(
    String route,
    String homeRoute,
    String homeBaseUrl,
    String homeServerSideType,
    String homeUriPrefix,
    String homeConsumedRoute,
    String serverSideType,
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Actionable> menu,
    AppVariant variant,
    List<Component> widgets,
    boolean drawerClosed,
    String style,
    String cssClasses,
    String logo)
    implements Component, PageMainContent { }
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `route` | String | `""` | Base route for this app |
| `homeRoute` | String | — | Route shown by default when navigating to the root |
| `favicon` | String | — | URL of the browser favicon |
| `pageTitle` | String | — | Browser tab title |
| `title` | String | — | App name shown in the header or drawer |
| `subtitle` | String | — | Subtitle shown below the app title |
| `menu` | `List<Actionable>` | `[]` | Top-level navigation menu items |
| `variant` | `AppVariant` | `TABS` | Layout variant |
| `widgets` | `List<Component>` | — | Additional widget components in the shell |
| `drawerClosed` | boolean | `false` | Start with the drawer closed |
| `logo` | String | — | URL of the logo image |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## AppVariant values

| Value | Description |
|---|---|
| `TABS` | Navigation rendered as a tab bar |
| `DRAWER` | Side navigation drawer |
| `TOP_MENU` | Horizontal top navigation bar |

## Basic usage

```java
@Route("/")
public class MyApp implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return App.builder()
            .title("My Application")
            .favicon("/images/favicon.ico")
            .homeRoute("/dashboard")
            .variant(AppVariant.DRAWER)
            .menuItem(new MenuEntry("Dashboard", "/dashboard"))
            .menuItem(new MenuEntry("Customers", "/customers"))
            .menuItem(new MenuEntry("Reports", "/reports"))
            .build();
    }
}
```

## With logo and subtitle

```java
return App.builder()
    .title("Admin Panel")
    .subtitle("Powered by Mateu")
    .logo("/images/logo.svg")
    .homeRoute("/home")
    .variant(AppVariant.DRAWER)
    .drawerClosed(false)
    .build();
```
