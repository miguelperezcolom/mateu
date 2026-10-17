---
title: "UI"
---

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

A lightweight record that carries global UI settings: the browser tab title, favicon, and the default home route. Use it when you need to configure these properties fluently without using the `@UI` annotation.

```java
@Builder
public record UI(String favicon, String pageTitle, String homeRoute) {}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `favicon` | String | URL of the browser favicon |
| `pageTitle` | String | Browser tab title |
| `homeRoute` | String | Default route shown when navigating to the root |

## Usage

```java
UI.builder()
    .pageTitle("My App")
    .favicon("/assets/favicon.ico")
    .homeRoute("/dashboard")
    .build()
```
