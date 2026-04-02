---
title: "Embed"
weight: 30
---

Mateu's reference frontend uses web components, which makes embedding straightforward.

You can place a Mateu UI inside any page by loading the renderer script and using the web component.

## Why embedding matters

Embedding makes Mateu useful beyond standalone apps.

You can:

- place a Mateu UI inside an existing website
- expose only a specific route or form
- compose multiple UIs in a larger application shell

## Basic example

```html
<mateu-ui
  baseUrl="https://demo.mateu.io/fluent"
  config='{"tenantId":"1111","profile":"dev"}'
  top="false">
</mateu-ui>
```

## Route-specific embedding

If you want to embed only a specific part of the UI, you can pass a route.

```html
<mateu-ui
  baseUrl="https://demo.mateu.io/fluent"
  route="/forms/counter1"
  top="false"
  style="width: 100%; height: 100vh;">
</mateu-ui>
```

## Key idea

Mateu UIs are not just pages.

They can also be delivered as embeddable UI building blocks.
