---
title: "Printing"
description: "How to control print output using browser print CSS — no framework code required."
---

Mateu does not implement printing. The browser's native print dialog (`Ctrl+P` / `Cmd+P`) combined with standard `@media print` CSS is all you need.

---

## How it works

When the user triggers a print, the browser applies any `@media print` rules on top of the existing styles. The design system (Vaadin, UI5, SLDS, …) may already include sensible print defaults — hiding sidebars, removing decorative shadows, linearising layouts.

You can supplement or override those defaults with a global print stylesheet in your frontend entry HTML:

```html
<style>
  @media print {
    /* Hide navigation, toolbars, filters — not relevant on paper */
    mateu-menu,
    vaadin-app-layout::part(drawer),
    [slot="navbar"] {
      display: none !important;
    }

    /* Remove background colours — save ink */
    body {
      background: white;
      color: black;
    }

    /* Avoid cutting rows across pages */
    tr, .card {
      break-inside: avoid;
    }
  }
</style>
```

---

## Applying print styles to specific components

Use `@Style` on a page or field to inject inline CSS that includes a `@media print` block:

```java
@Style("@media print { .toolbar { display: none; } }")
public class InvoicePage { ... }
```

Or target the component's shadow DOM parts if the design system exposes them.

---

## Triggering print programmatically

Return a `UICommand` that executes `window.print()` from a toolbar action:

```java
@Toolbar
Object print() {
    return UICommand.builder()
        .type(UICommandType.ExecJs)
        .data("window.print()")
        .build();
}
```

This lets you place a "Print" button on the page that opens the native print dialog directly.

---

## Notes

- **Print preview** is the browser's own dialog — no extra UI needed.
- **PDF export** from a listing (data as a file download) is a separate concern — see [export support](/java-ui-definition/interfaces/listing-backend/#export-support).
- Avoid fixed heights and horizontal scrolling in print — both cause clipping. Use `@Style("width: 100%;")` on wide components.
