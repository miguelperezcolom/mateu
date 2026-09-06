---
title: "Bring your own design system"
description: "Build a custom Mateu frontend using your own design system or component library."
---

Mateu's frontend and backend communicate through a simple, documented JSON API. Any frontend that implements this API becomes a valid Mateu renderer.

## How it works

The Mateu backend exposes **one** sync endpoint per mount. A renderer POSTs the current route and any
user action to it, and gets back a UI increment to apply:

```
POST /{baseUrl}/mateu/v3/components/_/action
Body: { "route": "...", "actionId": "<the load action> | <methodName>", "componentState": { ... } }
```

The response is a `UIIncrementDto` carrying `commands` (navigation, window title, …), `messages`
(toasts/alerts) and `fragments` (the component tree to render or patch). The same increment shape
drives every interaction, so a renderer only ever implements one request/response.

A renderer:
1. POSTs the route with the load action to get the initial `fragments`
2. renders the fragments using its own component library
3. sends user interactions back as further actions (the method's `actionId` + `componentState`)
4. applies the response — `fragments`, `commands` and `messages`

See the [renderer contract](/design-systems/renderer-contract/) for the authoritative wire spec
(exact action ids, component types and the increment schema).

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
