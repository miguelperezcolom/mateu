---
title: "Advanced"
---

The topics here build on the core Mateu model. Read them when you encounter a specific need: client-side behavior, navigation context, custom UI elements, or production concerns like security and testing.

## Topics

- [Rules](/java-user-manual/advanced/rules/) — conditional visibility, status badges, and display mappings evaluated in the browser
- [Breadcrumbs](/java-user-manual/advanced/breadcrumbs/) — static and dynamic navigation context for pages
- [Layout and composition](/java-user-manual/advanced/layout-and-composition/) — control page structure, regions, and inline styling
- [Custom web components](/java-user-manual/advanced/custom-web-components/) — embed any standard web component using `Element.builder()`
- [Extensibility](/java-user-manual/advanced/extensibility/) — override framework internals, add micro-frontends, or plug in an alternative renderer
- [Security](/java-user-manual/advanced/security/) — authenticate with Keycloak and restrict access with `@EyesOnly`
- [Internacionalización (i18n)](/java-user-manual/advanced/i18n/) — translate labels, titles and messages via the `Translator` interface
- [Accessibility (WCAG)](/java-user-manual/advanced/accessibility/) — how WCAG compliance is inherited from the design system and where developer responsibility begins
- [Printing](/java-user-manual/advanced/printing/) — control print output with browser `@media print` CSS and a programmatic print action
- [Testing](/java-user-manual/advanced/testing/) — unit-test ViewModels, actions, and repositories with no framework overhead

## Suggested reading order

Start with [Rules](/java-user-manual/advanced/rules/) and [Security](/java-user-manual/advanced/security/) — they apply to nearly every production application. Add [Custom web components](/java-user-manual/advanced/custom-web-components/) and [Extensibility](/java-user-manual/advanced/extensibility/) when you need to go beyond what Mateu renders by default.

## Related

- [Real-world patterns](/java-user-manual/real-world/) — how these techniques apply in hexagonal and microservices architectures
- [Concepts](/java-user-manual/concepts/) — core model reference
