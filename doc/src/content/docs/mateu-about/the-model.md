---
title: "The model"
description: "One UI model, several ways to author it and several things that consume it — plus the rules that keep them from drifting apart."
---

A Mateu screen is not the Java class you happened to write it in. The class is **one way of saying
it**. What travels on the wire, what the renderers paint, what the visual editor edits and what the
static bundle exports is always the same thing:

```text
a component tree  +  the routes that reach it  +  the shell around them
```

That is the model. Everything else in this page follows from it being a real model — something with
a schema, several producers, several consumers and written-down rules — rather than a convenient
shape for one library's API.

## Several ways to say the same thing

| You author in | What it looks like |
|---|---|
| **Java / Kotlin** | `@UI` classes, annotations, fluent components |
| **C# / Python** | attributes / decorators over the same catalog ([parity matrix](/reference/parity/)) |
| **YAML** | [pages](/java-ui-definition/yaml-ui-definition/), a [route registry](/java-ui-definition/route-registry/), an [app shell](/java-ui-definition/yaml-app-shell/) |
| **Visually** | the visual editor, which writes YAML back into your repo |
| **Design** | Figma, through the published `contract.json` ([design pipeline](/design-systems/figma/)) |

The same screen, twice. In Java:

```java
@UI("/orders")
@Title("Orders")
public class Orders extends AutoCrud<Order> {}
```

As data — a page definition plus the entry that routes to it:

```yaml
# specs/ui/orders.yaml
type: VerticalLayout
content:
  - type: Text
    text: Orders
    size: xl
```

```yaml
# specs/ui/routes.yaml
routes:
  - route: orders
    definition: orders.yaml
```

Neither is the "real" one. They meet in the same model, and a screen can mix them: `@UISpec` takes
its layout from YAML and its behaviour from Java, and a `layoutDelta:` records what a human
rearranged on top of a layout the framework still infers on every request.

## Several things consume it

- **Three server runtimes** — Java/Kotlin, C# and Python emit the same wire model.
- **Every renderer** — two web design systems (Vaadin, Oracle Redwood), React Native on mobile, the
  IntelliJ plugin on the desktop. None of them knows how the screen was authored.
- **The [static bundle](/java-user-manual/build/static-bundle/)** — `mateu:bundle` renders your
  declared screens at build time into a `manifest.json` a CDN can serve.
- **The [visual editor](/java-ui-definition/yaml-ui-definition/#the-visual-editor-writes-these)** —
  reads the catalog straight from the generated schema, so it offers every component without anyone
  maintaining a second list.
- **External tooling** — the Figma contract ships inside the `io.mateu:uidl` jar at
  `META-INF/mateu/contract.json`, so generators and importers read it from the artifact instead of
  keeping a copy that drifts.
- **`mateu:openapi`** — the same declarations exported as an OpenAPI document.

## What makes it a model and not a config format

A format is a way to write things down. A model has to survive being written down by several people
and read by several tools, which takes rules:

**The catalog has a published schema, generated from the source of truth.**
`uidl-schema.json` and `routes-schema.json` are generated from the records themselves and pinned by
a test, so adding a component without regenerating fails the build instead of shipping a schema that
does not know about it. Editors point their YAML IntelliSense at them.

**Precedence is written down: authored wins.** The annotation processor's index and the authored
`routes.yaml` are two producers of one route table. The authored half replaces the derived entry
outright — and the same order applies on the server, in the browser and in the ports, because route
resolution runs in more than one place.

**Human decisions are stored as deltas, not snapshots.** A `layoutDelta:` anchors to field ids and
is re-applied to a freshly inferred tree on every request, so a field the model grows later still
lands in its inferred place. A `layout:` is a snapshot that takes the screen out of inference for
good — and the editor shows which of the two a page is on, so the moment a screen leaves inference
is visible rather than silent.

**Inference cannot flip in silence.** `PageFingerprint` produces a stable per-class signature meant
for golden tests, so a change to the inference rules shows up as a failing diff instead of a screen
that quietly became a different template.

## Where the model stops

Worth knowing before you plan around it:

- **Rendering still goes through a server.** There is no client-side YAML renderer: a page authored
  as data is served through the ordinary sync path. The static bundle covers the **initial load of
  static routes**, precomputed at build time — live data comes from external endpoints and
  **actions still need a backend**.
- **`layoutDelta:` is served by the Java server.** The C# and Python ports parse the key and decline
  the page rather than rendering it wrongly.
- **The YAML app shell does not carry everything yet** — the flags read reflectively off an `@App`
  class (theme toggle, command center, `@AppContext` selectors, notifications, global search, FABs)
  still need that class. See [App shell as data](/java-ui-definition/yaml-app-shell/).
- **The model is not meant to say everything.** When a screen needs to be something no template
  covers, you drop to a component tree and build it by hand — and what you keep when you drop down
  (state, actions, validation, routing, the surrounding chrome) is pinned by a test, because a
  promise nothing checks degrades.

## Next

- [Mateu vs visual builders](/mateu-about/comparison-low-code/) — how this differs from a low-code platform
- [Mateu vs the traditional stack](/mateu-about/comparison/) — how it differs from a SPA
- [YAML UI definition](/java-ui-definition/yaml-ui-definition/) — authoring pages as data
- [Route registry](/java-ui-definition/route-registry/) — routes as data
