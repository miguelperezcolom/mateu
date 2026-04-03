---
title: "Navigation and menus"
weight: 10
---

# Navigation and menus

Navigation in Mateu comes from your object model.

## Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

## Remote menus (microservices)

```java
@Menu
RemoteMenu users = new RemoteMenu("/_users");
```

## Breadcrumbs

Mateu supports both static and dynamic breadcrumbs.

👉 [Learn about breadcrumbs →](/java-user-manual/breadcrumbs)
