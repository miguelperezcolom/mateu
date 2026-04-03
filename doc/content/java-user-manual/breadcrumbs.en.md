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
@Route("/breadcrumbs")
@io.mateu.uidl.annotations.Breadcrumbs({
    @Breadcrumb(label = "Home", url = "/"),
    @Breadcrumb(label = "Users", url = "/users"),
    @Breadcrumb(label = "Detail", url = "/users/123")
})
public class Breadcrumbs {}
```

## Imperative breadcrumbs

```java
@Route("/breadcrumbs")
public class Breadcrumbs implements BreadcrumbsSupplier {

    @Override
    public List<io.mateu.uidl.data.Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        return List.of(
            new io.mateu.uidl.data.Breadcrumb("Home", "/"),
            new io.mateu.uidl.data.Breadcrumb("Users", "/users"),
            new io.mateu.uidl.data.Breadcrumb("Miguel", "")
        );
    }
}
```

## When to use

- static → annotations  
- dynamic → supplier
