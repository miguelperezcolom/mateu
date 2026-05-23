---
title: "Bring your own design system"
description: "Build a custom Mateu frontend using your own design system or component library."
---

Mateu's frontend and backend communicate through a simple, documented JSON API. Any frontend that implements this API becomes a valid Mateu renderer.

## How it works

The Mateu backend exposes a small REST API describing the UI:

```
GET /mateu/uis/{uiId}          → full UI definition (routes, menus, metadata)
GET /mateu/uis/{uiId}/steps    → component tree for the current route
POST /mateu/uis/{uiId}/actions → execute a user action
```

A renderer:
1. fetches the UI definition and component tree
2. renders it using its own component library
3. sends user interactions back as action requests
4. applies the response (state updates, navigation, messages)

## Starting point

Clone one of the existing renderer repositories and adapt it to your component library. The [Vaadin renderer source](https://github.com/miguelperezcolom/mateu) is the most complete reference implementation.

## When to use this

- You want Mateu UIs to match your company's proprietary design system
- You are embedding Mateu in a platform with its own mandatory component library
- You want to render Mateu UIs in a non-browser environment (native mobile, desktop)

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
- [API](/mateu-about/api/)
