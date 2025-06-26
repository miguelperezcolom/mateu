---
title: "Pages"
weight: 2
---

In `Mateu` a `Page` means indeed the more general view. It is indeed just a component with an associated route.

As an example, here you have the simplest page definition:

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
