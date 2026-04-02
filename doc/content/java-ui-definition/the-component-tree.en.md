---
title: "The component tree"
weight: 20
---

# The component tree

Mateu can build UIs declaratively or imperatively.

Under the hood, both approaches produce a component tree that the frontend renderer turns into a real UI.

## Imperative / fluent example

```java
@UI("")
public class Counter implements ComponentTreeSupplier {

  int count = 0;

  @Override
  public Component getComponent(HttpRequest httpRequest) {
    return new VerticalLayout(
      new Text("" + count),
      new Button("Increment", (Runnable) () -> count++)
    );
  }

}
```

This explicitly builds a component tree.

## Declarative example

If the class does not implement `ComponentTreeSupplier`, Mateu can infer the tree from the class structure.

```java
@UI("")
public class Counter {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

## State

The server-side object acts as the UI state.

On each interaction, the state is sent back to the backend so the component can be rehydrated and the next UI update can be computed.

## Why this matters

This means you can:

- define UIs with plain Java classes
- build custom trees with fluent components
- mix declarative and imperative styles
- reuse code through inheritance and packaging

## Reuse and composition

Because Mateu uses plain Java:

- you can extend UIs
- package reusable components
- use dependency injection
- compose local and remote UI modules

The component tree is the bridge between your backend model and the rendered UI.
