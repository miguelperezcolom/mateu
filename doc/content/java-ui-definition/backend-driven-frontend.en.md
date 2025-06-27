---
title: "Backend-driven frontend"
weight: 2
---

In **Mateu** the frontend is backed by a java class in the server side, like illustrated in the following diagram:

<p align="center"><img src="../../../images/arch-overall-4.svg" width="500"/></p>

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

<p align="center"><img src="../../../images/counter.png" width="500"/></p>



In **Mateu** any class can be a server side component. You link that class to the frontend by:

- Annotating the class with **@MateuUI**.
- Annotating the class with **@Route**.
- Returning an object from another class which is already linked to the frontend, as response to some event in the browser.

That java class can interact with the frontend by:

- Supplying frontend content.
- Supplying data to the frontend.
- Handling requests from the frontend.

All that can be declared in an imperative or a declarative way, so you can explicitly say what must happen or it can 
be inferred from your java code.  
