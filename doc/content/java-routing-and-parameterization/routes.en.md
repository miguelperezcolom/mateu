---
title: "Routes"
weight: 4
---

With **Mateu** you do not technically need to define routes (they are transparently defined for you, from your java 
code), but defining routes is a good practice.

So, if you declarative define an app (a class with fields annotated with @Menu) routes will be created from the 
field names. On the other hand, you can annotate any class with @Route to create a route. 

As an example, here you have the simplest route definition:

```java
@Route("/home")
public class Home {
}
```

Please notice that the route is always relative to the UI context path. It would be absolute for a UI defined like this:

```java
@MateuUI("")
public class MyUI {
}
```

In case you have several UIs defined in your micro service and you want one route to be enabled at some specific UIs, 
you can define the route like this:

```java
@Route(value = "/home", uis = {"/ui1", "/ui2"})
public class Home {
}
```
