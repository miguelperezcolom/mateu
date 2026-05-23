---
title: "MicroFrontend"
---

Embeds another Mateu UI route as a nested micro-frontend inside the current page. Allows composing independent UI applications.

## Basic usage

```java
MicroFrontend.builder()
    .baseUrl("/other-app")
    .route("/dashboard")
    .consumedRoute("")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | String | — | Base URL of the remote Mateu UI |
| `route` | String | — | Route within the remote app to load |
| `consumedRoute` | String | — | Route prefix consumed by the host page |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Example: embedding a remote section

```java
MicroFrontend.builder()
    .baseUrl("/fluent")          // the embedded app's base path
    .route("/components/card")   // the specific page to show
    .consumedRoute("")           // how much of the URL this host page "consumes"
    .build()
```

## Use case

`MicroFrontend` is useful when:

- different teams own different parts of the UI
- you want to embed a Mateu UI into a larger shell application
- you need lazy-loading of independently deployed UI modules
