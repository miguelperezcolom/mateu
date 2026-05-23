---
title: "@App / @DrawerClosed / @Logo / @FavIcon"
---

Applies an application layout variant to a class that acts as the root application shell.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface App {
    AppVariant value();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `AppVariant` | Layout variant: `TABS`, `DRAWER`, `TOP_MENU`, etc. |

## Usage

```java
@App(AppVariant.DRAWER)
public class MyApplication implements MenuSupplier { ... }
```

---

# @DrawerClosed

Starts the application with the side drawer closed by default.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface DrawerClosed {}
```

## Usage

```java
@App(AppVariant.DRAWER)
@DrawerClosed
public class MyApplication implements MenuSupplier { ... }
```

---

# @Logo

Sets the URL of the application logo displayed in the header or drawer.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Logo {
    String value();
}
```

## Usage

```java
@Logo("/images/logo.svg")
public class MyApplication implements MenuSupplier { ... }
```

---

# @FavIcon

Sets the browser favicon for the application.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface FavIcon {
    String value();
}
```

## Usage

```java
@FavIcon("/images/favicon.ico")
public class MyApplication implements MenuSupplier { ... }
```

---

# @KeycloakSecured

Protects a page or application with Keycloak-based authentication.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface KeycloakSecured {
    String url();
    String realm();
    String clientId();
    String jsUrl() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `url` | String | — | Keycloak server URL |
| `realm` | String | — | Keycloak realm name |
| `clientId` | String | — | Keycloak client ID |
| `jsUrl` | String | `""` | Optional override for the Keycloak JS adapter URL |

## Usage

```java
@KeycloakSecured(
    url = "https://auth.example.com",
    realm = "myrealm",
    clientId = "my-app"
)
public class SecuredApp implements ComponentTreeSupplier { ... }
```

---

# @AI

Enables AI integration via SSE (Server-Sent Events) for a page or class.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface AI {
    String sse();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `sse` | String | SSE endpoint path for AI communication |

## Usage

```java
@AI(sse = "/ai/stream")
public class AiPage implements ComponentTreeSupplier { ... }
```
