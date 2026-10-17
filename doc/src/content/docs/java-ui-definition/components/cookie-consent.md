---
title: "CookieConsent"
---

A cookie-consent banner that appears at the bottom of the page. Renders a standard accept/decline prompt.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
CookieConsent.builder().build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Usage

Add `CookieConsent` to your app's root `Form` content or footer so it appears on every page:

```java
Form.builder()
    .content(List.of(
        mainContent,
        CookieConsent.builder().build()
    ))
    .build()
```

The banner handles showing itself only when consent has not yet been given (stored in local storage by the client-side component).
