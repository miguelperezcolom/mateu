---
title: Custom components (the per-renderer escape hatch)
description: Register a genuinely new rendering the platform does not ship, and use it by name.
---

A **custom component** is a genuinely new piece of UI the platform does not ship — an org chart, a
seat map, a bespoke visualization. It is the deliberate, relegated **escape hatch**: reach for it
only when nothing in the catalog fits and no composition of existing pieces will do.

It is the opposite of a [business component](/java-ui-definition/component-catalogue/) in one
decisive way. A business component composes pieces every renderer already paints, so it **ports for
free** and **runs with no backend**. A custom component is a **new rendering**, so it does **not**
port for free: each renderer must register a renderer for it, and a renderer that has none degrades
to a visible `<mateu-unsupported>` placeholder rather than breaking the screen.

> Decision rule: an agency selector is a `dropdown + source` → a **business** component. An org chart
> is a new drawing with no equivalent in the catalog → a **custom** component. When in doubt, it is
> almost always a business component.

## Declaring one

The model only **declares** the component: a type `name` a renderer registers against, a bag of
`props` the renderer reads, and slotted `content` (ordinary components, so a custom shell can wrap
known children). Everything else — the actual drawing — lives in the renderer.

```java
@UI("/org")
public class OrgScreen implements ComponentTreeSupplier {
  public Component component(HttpRequest r) {
    return CustomComponent.builder()
        .name("org-chart")
        .props(Map.of("orientation", "vertical", "levels", 3))
        .content(List.of(new Text("Chart unavailable")))   // slotted fallback / children
        .build();
  }
}
```

The wire carries exactly that as data, so the three backends (Java, C#, Python) emit it identically:

```csharp
new CustomComponent("org-chart") {
    Props = new Dictionary<string, object> { ["orientation"] = "vertical", ["levels"] = 3 },
    Content = new IComponent[] { new Text("Chart unavailable") },
}
```

```python
CustomComponent(name="org-chart",
                props={"orientation": "vertical", "levels": 3},
                content=(Text("Chart unavailable"),))
```

## Rendering one

On the web, register a renderer against the type `name` from your app's entry point. It receives the
declared `props` and the already-rendered slotted `children`:

```ts
import { registerCustomComponent } from "mateu";
import { html } from "lit";

registerCustomComponent("org-chart", (props, children) =>
  html`<my-org-chart
        orientation=${props.orientation as string}
        levels=${props.levels as number}
      >${children}</my-org-chart>`
);
```

Where **no** renderer is registered for the name, the shared dispatch renders the
`<mateu-unsupported>` placeholder — the gap is shown on screen and counted by the conformance suite,
never hidden. This is by design: a custom component is a new rendering, so an un-taught renderer is a
real gap, not a silent fallthrough.

## No backend

Because a custom component is plain data on the wire, the [client-side
expander](/java-user-manual/build/derived-openapi/) treats it like any container: `name`/`props` stay
in metadata and the slotted `content` lifts to children. A statically deployed bundle renders a
custom component exactly as a backend-driven app would — provided the shipped renderer has registered
the type.
