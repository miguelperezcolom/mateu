---
title: "Embed"
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

## Theming isolation

An embedded Mateu app does **not** inherit the host page's design tokens, and does not repaint if
the host changes them.

This is not automatic from shadow DOM: shadow DOM encapsulates rules and selectors, but CSS
*custom properties* (`--lumo-*`, `--mateu-*`) cross the shadow boundary by inheritance. A host that
declares `--lumo-primary-color` on its own `:root` is an ancestor of `<mateu-ui>`, so without a
firewall it would recolour every embedded component.

Mateu firewalls the tokens by **proximity**: the renderer re-declares its full token baseline on the
`<mateu-ui>` / `<mateu-ux>` container itself. Because the container is a *closer* ancestor than the
host's `:root`, every element inside resolves each token from the container, and the host's value
can never win. Dark mode still works: `<mateu-ui>` mirrors the document's `theme` attribute, so the
scoped dark palette follows it.

You get this for free — there is nothing to configure. A host page can style itself however it likes
(including with its own `--lumo-*` tokens) without disturbing the embedded app.

> One caveat: Vaadin overlays (dialogs, drawers, menus) render in the document body, outside the
> `<mateu-ui>` container. When Mateu owns the page they inherit its document-scope tokens as usual;
> in an embedding scenario an overlay may pick up the host's tokens. The app surface itself is fully
> isolated.

The behaviour is pinned by the browser probe `e2e/theming-isolation-probe.mjs` (drops a rogue
`--lumo-primary-color` on the host `:root` and asserts it reaches a plain element but **not** the
inside of `<mateu-ui>`) and the unit test `libs/mateu/.../theme/themeScope.test.ts`.

## Key idea

Mateu UIs are not just pages.

They can also be delivered as embeddable UI building blocks.
