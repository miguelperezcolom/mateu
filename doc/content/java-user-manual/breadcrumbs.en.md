---
title: "Breadcrumbs"
weight: 13
---

# Breadcrumbs

Mateu supports breadcrumbs in two ways:

- declaratively with `@Breadcrumbs` and `@Breadcrumb`
- imperatively by implementing `BreadcrumbsSupplier`

## Declarative breadcrumbs

```java
@Route("/users/123")
@Breadcrumbs({
    @Breadcrumb(label = "Home", url = "/"),
    @Breadcrumb(label = "Users", url = "/users"),
    @Breadcrumb(label = "Detail", url = "/users/123")
})
public class UserDetail {}
```

## Imperative breadcrumbs

```java
@Route("/users/123")
public class UserDetail implements BreadcrumbsSupplier {

    @Override
    public List<Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        return List.of(
            new Breadcrumb("Home", "/"),
            new Breadcrumb("Users", "/users"),
            new Breadcrumb("Miguel", "")
        );
    }
}
```

## When to use

- static → annotations  
- dynamic → supplier
