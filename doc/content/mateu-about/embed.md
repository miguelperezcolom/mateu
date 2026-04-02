---
title: "Embed"
weight: 10
---

# Embed

Mateu's reference frontend is built as a web component, which means you can embed a Mateu UI inside any existing web page or application.

This makes Mateu useful beyond standalone apps. You don't need to migrate an entire application to start using it — you can introduce Mateu screens incrementally.

## Basic usage

Load the renderer script and place the web component in your HTML:

```html
<script src="https://cdn.mateu.io/renderer/latest/mateu.js"></script>

<mateu-ui
  baseUrl="https://your-service/mateu"
  config='{"tenantId":"1111","profile":"prod"}'
  top="false">
</mateu-ui>
```

This renders the full UI exposed by your backend at that base URL.

## Embedding a specific route

If you only want to embed a specific screen — a form, a CRUD, a workflow step — pass the route directly:

```html
<mateu-ui
  baseUrl="https://your-service/mateu"
  route="/orders/new"
  top="false"
  style="width: 100%; height: 100vh;">
</mateu-ui>
```

## Use cases

- Add an admin screen to an existing site without rebuilding it
- Expose a specific form or workflow inside a portal
- Compose multiple Mateu backends in a custom shell
- Integrate Mateu screens into a non-Mateu application incrementally
