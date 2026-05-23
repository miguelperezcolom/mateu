---
title: "MenuBar"
---

A horizontal or vertical navigation bar composed of `Actionable` items. Use it to add inline navigation to a page without wrapping the whole page in an `App` shell.

```java
@Builder
public record MenuBar(
    List<Actionable> options,
    String style,
    String cssClasses)
    implements Component { }
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `List<Actionable>` | `[]` | Navigation items |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Basic usage

```java
MenuBar.builder()
    .option(new NavItem("Overview", "/overview"))
    .option(new NavItem("Settings", "/settings"))
    .option(new NavItem("Logs", "/logs"))
    .build()
```

## Embedded in a page

```java
return Form.builder()
    .title("Admin")
    .headerItem(
        MenuBar.builder()
            .option(new NavItem("Users", "/admin/users"))
            .option(new NavItem("Roles", "/admin/roles"))
            .build()
    )
    .contentItem(content)
    .build();
```
