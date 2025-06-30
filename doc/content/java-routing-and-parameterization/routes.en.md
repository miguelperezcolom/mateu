---
title: "Routes"
weight: 4
---

With **Mateu** you do not technically need to define routes (they are transparently defined for you, from your java code), but it's a good practice.

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
