---
title: "Fragments"
---

A **fragment** is a page-shaped thing with no page. It holds one component, or a list of them, and
nothing else — no route, no title, no chrome — and it can be used anywhere a component can.

Where a page answers *"what does this URL show"*, a fragment answers *"what does this **piece** look
like, wherever it appears"*.

## Defining one

Exactly as you would define a page, in a YAML file under `specs/ui/fragments/`:

```yaml
# src/main/resources/specs/ui/fragments/address-block.yaml
content:
  - type: FormField
    id: street
    label: Street
    dataType: string
  - type: FormField
    id: city
    label: City
    dataType: string
```

When the fragment is a single component, the file *is* that component — no envelope:

```yaml
# src/main/resources/specs/ui/fragments/legal-notice.yaml
type: Text
text: "Prices include VAT."
```

## Using one

```yaml
type: FormLayout
content:
  - type: FormField
    id: name
    label: Name
  - type: Fragment
    ref: address-block
```

or from Java:

```java
FormLayout.builder()
    .content(List.of(
        FormField.builder().id("name").label("Name").build(),
        new Fragment("address-block")))
    .build();
```

Fragments compose: a fragment may use another. A cycle is reported in the log and rendered as
nothing, rather than taken as an invitation to recurse.

## It splices, it does not wrap

A fragment standing for **several** components is spliced into its parent's content:

| Authored | Rendered |
|---|---|
| `FormLayout[ name, Fragment(address-block) ]` | `FormLayout[ name, street, city ]` |

This is the property that makes "usable anywhere a component is" true rather than aspirational. A
wrapper would put two fields into one grid cell — so the places reuse matters most, forms and grids,
would be exactly the places fragments could not go.

The one exception is a slot that holds a single component by construction, such as
`Container.content`. There is nowhere to splice into, so a multi-component fragment is stacked in a
bare `VerticalLayout`. Give such a fragment its own root when you care about the container.

## Binding

There is **no parameter-passing mechanism**, and that is deliberate. A fragment is inlined *before*
binding, so its fields bind against the page that used it, by the same convention as everywhere
else: a `FormField id="street"` inside a fragment binds to the hosting ModelView's `street`
property, and a `Button actionId="save"` to its `save()` method.

The consequence to know: a fragment is a piece of **layout vocabulary**, not a component with its
own private state. Two pages using `address-block` each bind it to their own `street` and `city`.

## Where fragments live at runtime: nowhere

Fragments are resolved and inlined **server-side, before anything is mapped to DTOs**. They never
appear on the wire.

That is not an implementation detail — it is why the feature works everywhere at once:

- No renderer has to learn the concept. Vaadin, Redwood, React Native and both IDE plugins support
  fragments without a line of renderer code, and a renderer added next year does too.
- A [static bundle](/java-user-manual/build/static-bundle/) stays self-contained. A fragment node
  on the wire would be a reference the bundle has no server to follow.

## Fragments in Java

`ref` may also name a class:

```yaml
- type: Fragment
  ref: com.acme.ui.AddressBlock
```

A `ComponentTreeSupplier` contributes the tree it returns — resolved per request, which is the
reason to author a fragment in Java rather than in a file. A plain `Component` contributes itself.

Fragments can also be registered in code, and a registration wins over a file of the same name:

```java
FragmentRegistry.instance().register("legal-notice", List.of(new Text("…")));
```

## When a ref resolves to nothing

The fragment renders as no content, and the miss is logged. A page is not worth taking down over
one piece of it: the alternative turns a typo in one ref into a 500 on every request to every page
that mentions it.

## Not to be confused with

`UIFragmentDto` — the wire's name for an *increment of UI* returned by an action. Unrelated. The
fragment on this page is an authoring-time concept and never reaches that layer.

## Availability

| Port | Fragments |
|---|---|
| Java | ✅ |
| .NET | — |
| Python | — |

The ports read the same YAML shapes but do not resolve `Fragment` yet; a page that uses one renders
without it there.
