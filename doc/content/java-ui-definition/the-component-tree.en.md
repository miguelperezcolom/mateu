---
title: "The component tree"
weight: 2
---

You create the UIs by composing any of the 44 available components together. With **Mateu**, you use plain java classes for 
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
      new Text("" + count),
      new Button("Increment", (Runnable) () -> count++)
    );
  }

}
```

The example above will create the following component tree, in the browser:

<p align="center"><img src="../../../images/arch-client-5.svg" width="500"/></p>

Which, in the end, becomes this:

<p align="center"><img src="../../../images/counter.png" width="500"/></p>

## Inheritance, dependency injection and packaging

Please notice you can also leverage java inheritance and maven dependencies for building your UIs with Mateu, so you can
create components which extend other components, create libraries with sets of components, and even use dependency injection 
inside your components.

## Reusing components

As you are defining your UI using plain java classes, inheritance, dependency injection and maven packages can be
used.

This means that you can extend existing UIs, forms or cruds, or create artifacts which contain component libraries
which can be used in another UI built with Mateu.

You can also integrate components from other microservices, as micro frontends in your own UI.

## Bring your own components

You can easily create your own web components and use them, just like any other html element.
