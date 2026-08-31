---
title: "Partials"
---

A **partial** is a page-shaped thing with no page. It holds one component, or a list of them, and
nothing else — no route, no title, no chrome — and it can be used anywhere a component can.

Where a page answers *"what does this URL show"*, a partial answers *"what does this **piece** look
like, wherever it appears"*.

## Defining one

Exactly as you would define a page, in a YAML file under `specs/ui/partials/`:

```yaml
# src/main/resources/specs/ui/partials/address-block.yaml
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

When the partial is a single component, the file *is* that component — no envelope:

```yaml
# src/main/resources/specs/ui/partials/legal-notice.yaml
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
  - type: Partial
    ref: address-block
```

or from Java:

```java
FormLayout.builder()
    .content(List.of(
        FormField.builder().id("name").label("Name").build(),
        new Partial("address-block")))
    .build();
```

Partials compose: a partial may use another. A cycle is reported in the log and rendered as
nothing, rather than taken as an invitation to recurse.

## It splices, it does not wrap

A partial standing for **several** components is spliced into its parent's content:

| Authored | Rendered |
|---|---|
| `FormLayout[ name, Partial(address-block) ]` | `FormLayout[ name, street, city ]` |

This is the property that makes "usable anywhere a component is" true rather than aspirational. A
wrapper would put two fields into one grid cell — so the places reuse matters most, forms and grids,
would be exactly the places partials could not go.

The one exception is a slot that holds a single component by construction, such as
`Container.content`. There is nowhere to splice into, so a multi-component partial is stacked in a
bare `VerticalLayout`. Give such a partial its own root when you care about the container.

## Binding

There is **no parameter-passing mechanism**, and that is deliberate. A partial is inlined *before*
binding, so its fields bind against the page that used it, by the same convention as everywhere
else: a `FormField id="street"` inside a partial binds to the hosting ModelView's `street`
property, and a `Button actionId="save"` to its `save()` method.

The consequence to know: a partial is a piece of **layout vocabulary**, not a component with its
own private state. Two pages using `address-block` each bind it to their own `street` and `city`.

## Where partials live at runtime: nowhere

Partials are resolved and inlined **server-side, before anything is mapped to DTOs**. They never
appear on the wire.

That is not an implementation detail — it is why the feature works everywhere at once:

- No renderer has to learn the concept. Vaadin, Redwood, React Native and both IDE plugins support
  partials without a line of renderer code, and a renderer added next year does too.
- A [static bundle](/java-user-manual/build/static-bundle/) stays self-contained. A partial node
  on the wire would be a reference the bundle has no server to follow.

## Partials in Java

`ref` may also name a class:

```yaml
- type: Partial
  ref: com.acme.ui.AddressBlock
```

A `ComponentTreeSupplier` contributes the tree it returns — resolved per request, which is the
reason to author a partial in Java rather than in a file. A plain `Component` contributes itself.

Partials can also be registered in code, and a registration wins over a file of the same name:

```java
PartialRegistry.instance().register("legal-notice", List.of(new Text("…")));
```

## When a ref resolves to nothing

The partial renders as no content, and the miss is logged. A page is not worth taking down over
one piece of it: the alternative turns a typo in one ref into a 500 on every request to every page
that mentions it.

## Why "partial" and not "fragment"

The obvious name was taken. `UIFragmentDto` is the wire's name for an *increment of UI* returned by
an action — a different layer, and one this concept never reaches, but one word meaning two things
in the same codebase is a tax paid by every reader forever.

## Availability

| Port | Partials |
|---|---|
| Java | ✅ |
| .NET | ✅ |
| Python | ✅ |

All three servers resolve `type: Partial` while building the tree, from
`<specs>/partials/<ref>.yaml` (or an explicit `.yaml` path), splice multi-component partials into
the parent's content, stack them where there is no list to splice into, drop a missing ref, and
break a cycle. Registration in code is available in all three.

One difference: **a `ref` that names a class works only on the Java server**. The ports carry the
declarative form only — the same split as `@Overline` vs `OverlineSupplier`.
