---
title: "Extending the UI"
description: "The extension ladder, from least to most effort: semantic annotations, field types, reusable pieces, composed pages, custom components and web components, component adapters, micro-frontends, design systems and theming, and writing your own renderer. When to use which."
---

The catalogue and the page templates cover most business screens. When they don't, Mateu has a
**ladder** of extension points. Each rung costs more than the one above it and gives up a little
more of what Mateu does for you, so start at the top and descend only as far as the problem
needs.

| # | Rung | Use it when | Effort | Ports to every renderer? |
|---|---|---|---|---|
| 1 | [Explicit declarations](#1-say-what-you-want-explicitly) | an inferred decision is wrong for this screen | none | yes |
| 2 | [Semantic annotations](#2-name-your-configuration-semantic-annotations) | the same annotations repeat on many fields | a few lines | yes |
| 3 | [Field types](#3-name-your-domain-concepts-field-types) | a domain concept (`Money`, `OrderStatus`) repeats across fields and columns | a YAML entry | yes |
| 4 | [Partials and business components](#4-reuse-a-piece-partials-and-business-components) | a piece of screen repeats across pages | a YAML file or a class | yes |
| 5 | [A composed page](#5-compose-the-page-yourself) | the whole screen fits no template | a component tree | yes |
| 6 | [Component adapters](#6-render-a-foreign-object-componentadapter) | an object can't or shouldn't carry Mateu annotations | an adapter class | yes |
| 7 | [Micro-frontends and remote UIs](#7-embed-another-ui-micro-frontends-and-federation) | another team or service owns part of the screen | configuration | yes |
| 8 | [Custom components and web components](#8-draw-something-new-custom-components) | you need a drawing the catalogue does not have | a renderer per target | **no**, each renderer registers it |
| 9 | [Design systems and theming](#9-change-the-look-design-tokens-and-theming) | the app must look like your brand | tokens, once | per renderer |
| 10 | [Your own renderer](#10-paint-it-somewhere-new-your-own-renderer) | a target or design system Mateu does not paint | a renderer | it *is* the renderer |

Rungs 1 to 7 stay inside the model: what you build is data on the wire, so every renderer paints
it, and it works in a static bundle when it needs no server. Rungs 8 to 10 add rendering code,
which is why they come last.

## 1. Say what you want, explicitly

Before extending anything, check whether you only disagree with an inferred decision. Explicit
declarations always win over inference, and removing them gives inference back: `@Section`,
`@Zones`, `@Tab`, `@Toc`, `@Aside`, `@PageWidth`, `@PageTemplate`, `@Compact`, `@Stereotype`… in
code, and the equivalent keys in YAML. See the
[ladder of control](/the-mateu-way/#the-ladder-of-control) and
[layout inference](/ux-patterns/layout-inference/).

## 2. Name your configuration: semantic annotations

When the same combination of annotations appears again and again, fold it into one annotation
that speaks your domain:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Stereotype(FieldStereotype.money)
@Label("Total amount")
@Help("Taxes included")
public @interface TotalAmount {}

@TotalAmount BigDecimal total;
```

Every field, method and class annotation of Mateu can be composed this way. No new code path is
involved, only a name. See [semantic annotations](/java-ui-definition/annotations/semantic-annotations/)
and [build your domain vocabulary](/java-ui-definition/domain-vocabulary/).

## 3. Name your domain concepts: field types

The data-side equivalent: declare `OrderStatus` once (label, data type, stereotype, options,
status tones, alignment) and reference it with `fieldType:` from any field or column, in YAML or in
code (`FieldTypeCatalogSupplier`). What the field declares itself still wins.

```yaml
# specs/ui/types.yaml
type: Types
types:
  - id: OrderStatus
    dataType: status
    options:
      - {value: OPEN, label: Open}
      - {value: SHIPPED, label: Shipped}
    tones: {OPEN: warning, SHIPPED: success}
```

See [field types](/java-ui-definition/field-types/).

**A new kind of field.** There is no registry for new stereotypes. When a field needs a widget the
catalogue does not have, make the field hold a component (a `CustomField`, or in code a field typed
as a component) and put a [custom component](#8-draw-something-new-custom-components) or a web
component in it.

## 4. Reuse a piece: partials and business components

- A [**partial**](/define/yaml/partials/) is a named piece of layout spliced into any page by
  `ref`. It is resolved before the wire, so no renderer knows about it.
- A [**business component**](/java-ui-definition/component-catalogue/) is a named composition
  *bound to a data source* (an agency selector = a select + a source), declared in
  `components.yaml` or a `ComponentCatalogSupplier` and used with `ComponentRef`.

Both are made of catalogue components, so they port to every renderer and run with no backend.
When in doubt between a business component and a custom component, it is almost always a business
component.

## 5. Compose the page yourself

When the whole screen is none of the [six page types](/ux/page-types/), build the tree yourself:
in YAML a definition already *is* a tree; in code implement `ComponentTreeSupplier` and return
it. You keep state, actions, validation, routing and the surrounding shell, and you can still
declare the page's type. See
[when a screen does not fit](/java-user-manual/advanced/escaping-the-framework/) and the
[component tree](/java-ui-definition/the-component-tree/).

## 6. Render a foreign object: ComponentAdapter

A plain or legacy domain object with no Mateu annotations can be rendered by registering a
`ComponentAdapter<T>`: it turns the object into components, state and actions, and rebuilds the
object from the state when an action comes back. It works for a whole page and for a nested field,
which becomes its own island. See [ComponentAdapter](/java-ui-definition/interfaces/component-adapter/).

## 7. Embed another UI: micro-frontends and federation

- [`MicroFrontend`](/java-ui-definition/components/micro-frontend/) embeds a route of another Mateu
  UI inside a page, as an independent island.
- A [`RemoteMenu`](/mateu-about/shell-and-remote-menus/) brings another service's menu into the
  shell, so independently deployed UIs form one console.
- The reverse, a Mateu screen inside React, Angular, Vue, Visual Builder or plain HTML, is
  [embedding](/mateu-about/embed/).

See [UI federation](/mateu-about/ui-federation/) for the whole picture.

## 8. Draw something new: custom components

When nothing in the catalogue fits and no composition will do (a seat map, a bespoke
visualisation), declare a `CustomComponent` with a `name`, `props` and slotted `content`, and
register a renderer for that name in each renderer that should draw it. On the web:

```ts
import { registerCustomComponent } from "mateu";
import { html } from "lit";

registerCustomComponent("seat-map", (props, children) =>
  html`<my-seat-map rows=${props.rows as number}>${children}</my-seat-map>`);
```

A renderer that has not registered the name shows a visible *unsupported* placeholder, never a
broken screen. See [custom components](/java-ui-definition/custom-components/).

For an existing **web component** (a 3D viewer, a third-party widget), the web renderers also
accept an [`Element`](/java-ui-definition/components/element/) with any tag name, its attributes
and event bindings, plus a script to load it. See
[custom web components](/java-user-manual/advanced/custom-web-components/).

## 9. Change the look: design tokens and theming

A brand is a **token layer** set once (colours, typography, radii, density), not per-screen
styling. Each renderer exposes its design system's tokens; the shell adds an
[accent colour and strip](/design-systems/accent-strip/). Per-page density is `@Compact`; per-page
width is `@PageWidth`. Inline `style`/`cssClasses` exist on every component, but they are a
renderer-specific escape and do not travel well. See
[branding and design tokens](/design-systems/branding-and-design-tokens/) and, for designers, the
[Figma pipeline](/design-systems/figma/).

## 10. Paint it somewhere new: your own renderer

A renderer receives the wire's UI increments and paints them with its own widgets. The
[renderer contract](/design-systems/renderer-contract/) says what it must do and defines three
conformance levels (**Core**, **Standard**, **Full**) measured by a shared fixture suite, so
"done" is a number, not a feeling. Start from
[bring your own design system](/design-systems/bring-your-own-design-system/) and the
[reference renderer](/design-systems/reference-renderer/).

## Which rung?

| Your situation | Rung |
|---|---|
| "The form puts these fields in tabs, I want them stacked" | 1 |
| "Every supplier field has the same four annotations" | 2 |
| "`Money` is right-aligned with two decimals everywhere" | 3 |
| "Every order page has the same customer block" | 4 |
| "This screen is a custom console, not a list or a record" | 5 |
| "I must show a legacy DTO I can't annotate" | 6 |
| "The billing team owns that panel and deploys it separately" | 7 |
| "We need an interactive seat map" | 8 |
| "It has to look like our corporate design" | 9 |
| "We want it in our in-house component library" | 10 |
