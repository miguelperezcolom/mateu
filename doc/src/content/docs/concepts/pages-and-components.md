---
title: "Pages and components"
description: "A page is what a route renders: a layout definition — a tree of components — plus, optionally, a view model that supplies state, behaviour and validation."
---

A **page** is what a [route](/concepts/routes-and-mounts/) renders. It has up to two parts, and you
can author each one separately:

| Part | What it says | Authored as |
|---|---|---|
| **Layout** (the definition) | *what the screen looks like*: a tree of components | a YAML file under `specs/ui/`, the visual editor, or a component tree built in code |
| **View model** (optional) | *what the screen does*: state, actions, validation, data access | a class in Java, C# or Python |

A page can have only a layout. That page runs entirely in the browser, which is what a
[static bundle](/deploy/static-bundle/) ships. It can have only a view model, in which case Mateu
**derives** the layout from the class's fields and methods. Or it can have both: a YAML layout
bound to a class by the route, which is described in [Mixing YAML and code](/define/mixing/).

This page is one of the [building blocks](/concepts/building-blocks/). The running example is the
product catalogue.

## A page as data

A definition is one component at the root, with the components it contains nested under it:

```yaml
# specs/ui/product.yaml — the record page, route products/:id
type: Form
title: ${state.name}
subtitle: Product
toolbar:
  - type: Button
    label: Edit
    buttonStyle: primary
    actionable:
      type: RouteLink
      route: products/${state.id}/edit
content:
  - type: FormLayout
    content:
      - {type: FormField, id: name, label: Name, readOnly: true}
      - type: Partial
        ref: price-block            # price + status, shared with the edit page
buttons:
  - type: Button
    label: Discontinue
    actionId: discontinue           # from this page's actions:, or actions.yaml
actions:
  - id: discontinue
    confirmationRequired: true
    restAction:
      source: {ref: product-discontinue}
      successMessage: Discontinued
```

The route supplies the record. `data: product` on the `products/:id` entry fetches it from the
[data source](/concepts/data-sources/) into the page state, so the fields show `state.name`,
`state.price` and the rest.

Beside the component itself, a definition can carry:

| Key | Meaning |
|---|---|
| `actions` | Actions this page owns: flows (`steps`) and REST calls (`restAction`). See [Actions](/concepts/action-catalogue/). |
| `triggers` | Actions that run without a click. See [triggers](/concepts/state-and-triggers/#triggers). |
| `viewModel` | The class this layout binds to. Omit it on a layout shared by several routes, and let each [route entry](/concepts/routes-and-mounts/#the-definition-is-layout-only) bind its own. |
| `layout` / `layoutDelta` | `layout:` wraps the component when you want the keys above beside it. `layoutDelta:` records human edits on top of a layout Mateu still infers from the view model. See [Pages in YAML](/define/yaml/pages/#layoutdelta--keep-inference-alive). |

## A page as code

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

In Java, C# and Python the view model *is* the page, and Mateu derives the layout from it:

```java
@Title("Product")
public class ProductPage {
  String id;                        // from the :id path parameter
  @NotEmpty String name;
  @Stereotype(FieldStereotype.money) double price;
  ProductStatus status;

  @Button
  public Message discontinue() {
    ProductStore.INSTANCE.discontinue(id);
    return new Message("Discontinued");
  }
}
```

The fields become a form, the method becomes a button, and the bean validation becomes validation in
both the browser and the server. When you need full control, the same class can implement
`ComponentTreeSupplier` and return the component tree itself, using the same components a YAML file
names. Archetypes such as `AutoCrud`, `Wizard` and `Dashboard` give you whole page families from one
base class. See [The Mateu Way](/the-mateu-way/) and
[choosing a page template](/ux-patterns/choosing-a-page-template/).

C# and Python have the same shape: `[UI]` / `@ui` view models, `Crud<T>` / `Crud[T]`, and the
[Language Rosetta](/reference/language-rosetta/) maps the annotations.

## Components

Every layout, whether it is written in YAML, built fluently in code or derived from a class, is made
of components from **one catalogue**: layouts (`VerticalLayout`, `FormLayout`, `TabLayout`…), fields
(`FormField`), listings (`Listing`, `GridColumn`), display components (`Text`, `Badge`,
`MetricCard`…), overlays (`Dialog`, `Drawer`) and navigation (`RouteLink`, `Menu`…). The `type:` in
YAML is the record's class name, and the catalogue's JSON Schema is generated from those records.
Because of that, the schema, the visual editor's palette and the renderers can't disagree.

- [Supported components](/java-ui-definition/supported-components/) and the
  [component tree](/java-ui-definition/the-component-tree/).
- Reuse within the model: [partials](/define/yaml/partials/) (a named piece of layout) and
  [business components](/java-ui-definition/component-catalogue/) (a named piece of layout bound to a
  source, referenced with `ComponentRef`).
- New rendering: [custom components](/java-ui-definition/custom-components/), the per-renderer escape
  hatch.

## Served vs static

| The page has… | With a server | As a static bundle |
|---|---|---|
| only a layout | rendered through the normal sync path | pre-rendered at build time, or shipped raw (`specsOnly`) and expanded in the browser |
| a view model | instantiated fresh on every request | needs a server. A `staticOnly` build refuses it |

## See also

- [Page types](/ux/page-types/) and [components by role](/ux/components/), in the UX guide.
- [Pages in YAML](/define/yaml/pages/): file format, IntelliSense and `layoutDelta`.
- [The visual editor](/define/yaml/visual-editor/), which writes these files.
- [What a Mateu UI is made of](/concepts/building-blocks/).
