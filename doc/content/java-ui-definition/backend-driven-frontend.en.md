---
title: "Backend-driven frontend"
weight: 2
---

In **Mateu** the frontend is backed by an ephemeral java object in the server side, like illustrated in the following diagram:

<p align="center"><img src="../../../images/arch-overall-4.svg" width="500"/></p>

Please notice the java object is instantiated and hydrated on every api request. It does not survive between api calls. 

So, the following java code:

```java
@MateuUI("")
public class Counter {

    @Output
    int count = 0;

    @Button
    Runnable increment = () -> count++;

}
```

Becomes this in the browser:

<p align="center"><img src="../../../images/counter.png" width="400"/></p>

Or, you can say the same in a fluent imperative way:

```java
@MateuUI("")
public class Counter implements ComponentSupplier {

  int count = 0;

  @Override
  public Object getComponent(HttpRequest httpRequest) {
    return new VerticalLayout(
      new Text(new Binding("count")),
      new Button("Increment", () -> count++)
    );
  }

}
```

## Linking backend and frontend

In **Mateu** any class can be a server side component. You link that class to the frontend by:

- Annotating the class with **@MateuUI**.
- Annotating the class with **@Route**.
- Returning an object from another class which is already linked to the frontend, as response to some event in the browser.

## Interact with the frontend

That java class can interact with the frontend by:

- Supplying frontend content.
- Supplying data to the frontend.
- Handling requests from the frontend.
