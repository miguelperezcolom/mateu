---
title: "Accessibility (WCAG)"
description: "How Mateu achieves WCAG compliance through the design system, and where developer responsibility begins."
---

Mateu does not implement accessibility itself. It delegates rendering to a design system — Vaadin, SAP UI5, Oracle Redwood, Salesforce SLDS, or Red Hat PatternFly — and each of those ships components that are designed to meet **WCAG 2.1 AA**. Keyboard navigation, ARIA attributes, focus management, screen-reader announcements, and colour contrast are all handled at the design system layer.

The practical consequence is: **if you use Mateu's declarative or fluent API to define your UI, your application inherits the accessibility guarantees of the chosen design system without writing any extra code.**

---

## What the design system handles

When Mateu renders a form field, a listing, a dialog, or a toolbar, the output is a design system component, not raw HTML. That component carries:

- Correct `role`, `aria-label`, `aria-describedby`, and `aria-live` attributes
- Keyboard interaction patterns (Tab, arrow keys, Enter, Escape)
- Focus trapping in modals and dialogs
- Screen-reader-friendly status announcements
- Colour tokens that meet contrast requirements

Mateu feeds each component its label, description, and validation messages — the design system wires them to the correct ARIA attributes.

---

## Where developer responsibility begins

The design system guarantee breaks down whenever you introduce content that bypasses the component layer:

### Raw HTML injection

The notifications polling pattern (and any use of `Hydratable`) may build HTML strings manually:

```java
// This bypasses the design system — accessibility is your responsibility
content = "<a href=\"#\" onclick=\"...\" style=\"animation: ...\">You have tasks!</a>";
```

If you inject raw HTML, ensure links have descriptive text, interactive elements are keyboard-reachable, and animations respect `prefers-reduced-motion`.

### Custom web components via `Element.builder()`

```java
Element.builder().tag("my-custom-widget").build()
```

Custom elements must implement their own ARIA roles and keyboard behaviour. The design system does not wrap them.

### Raw CSS that affects visibility or contrast

`@Style` passes inline CSS directly to the component. Avoid:
- `opacity: 0` or `visibility: hidden` to hide content that should be hidden from assistive technology — use conditional rendering instead.
- Custom colour combinations that break contrast ratios defined by the theme.

### Image alt text

When using the `Image` component or embedding `<img>` tags, always provide meaningful alt text:

```java
Image.builder().src("/logo.png").alt("Acme Corp logo").build()
```

---

## Summary

| Layer | Who is responsible |
|---|---|
| Component rendering (buttons, fields, grids, dialogs, …) | Design system (Vaadin, UI5, SLDS, …) |
| Labels, descriptions, validation messages | Mateu (passes them to the design system) |
| Raw HTML injected via `Hydratable` or `Text` | Developer |
| Custom web components via `Element.builder()` | Developer |
| Inline CSS that affects contrast or visibility | Developer |
| Image alt text | Developer |

---

## Related

- [Design systems](/design-systems/) — choose and configure the design system for your application
- [Push Notifications](/ux-patterns/notifications/) — the raw HTML injection pattern and its caveats
- [Custom web components](/java-user-manual/advanced/custom-web-components/) — embedding non-design-system elements
