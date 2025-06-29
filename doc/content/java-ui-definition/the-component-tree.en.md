---
title: "The component tree"
weight: 4
---

You create the UIs by composing any of the 40 available components together. With **Mateu**, you use plain java classes for 
declaring those components and how they are combined to create your UIs.

You can indeed do it using a declarative way using annotations, in a declarative though more dynamic way implementing 
some interfaces or in an imperative way using fluent code. You can obviously combine all those ways as you want.

## An example

So, this is a simple example which illustrates a component tree creation:

```java
@MateuUI("")
public class Counter implements ComponentSupplier {

  int count = 0;

  @Override
  public Component getComponent(HttpRequest httpRequest) {
    return new VerticalLayout(
      new Text(new Binding("count")),
      new Button("Increment", () -> count++)
    );
  }

}
```

The example above will create the following component tree, in the browser:

<p align="center"><img src="../../../images/arch-client-5.svg" width="500"/></p>

## Inheritance, dependency injection and packaging

Please notice you can also leverage java inheritance and maven dependencies for building your UIs with Mateu, so you can
create components which extend other components, create libraries with sets of components, and even use dependency injection 
inside your components.
