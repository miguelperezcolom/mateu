---
title: "Breadcrumbs"
---

Breadcrumbs give users navigation context: the sequence of pages leading to the current one.

Mateu supports two approaches: declarative annotations for static paths, and a supplier interface for paths that depend on runtime data.

**When to use:** add breadcrumbs whenever a page is reachable from multiple parent contexts, or when users need to understand where they are within a hierarchy.

---

## Declarative breadcrumbs

Use `@Breadcrumbs` and `@Breadcrumb` when the path is always the same regardless of the current record:

```java
@Route("/users/123")
@Breadcrumbs({
    @Breadcrumb(label = "Home", url = "/"),
    @Breadcrumb(label = "Users", url = "/users"),
    @Breadcrumb(label = "Detail", url = "/users/123")
})
public class UserDetail {}
```

This is the simplest option. Use it for fixed hierarchy levels where the labels and URLs do not depend on data.

---

## Imperative breadcrumbs

Implement `BreadcrumbsSupplier` when the breadcrumb labels depend on the current record — for example, showing the entity name instead of a generic "Detail":

```java
@Route("/users/:id")
public class UserDetail implements BreadcrumbsSupplier {

    @Override
    public List<Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        String id = httpRequest.getPathVariable("id");
        String name = userQueryService.findNameById(id).orElse("User " + id);
        return List.of(
            new Breadcrumb("Home", "/"),
            new Breadcrumb("Users", "/users"),
            new Breadcrumb(name, "")   // empty URL = current page (not clickable)
        );
    }
}
```

The `HttpRequest` gives access to path variables, query parameters, and request headers, so you can look up any data needed to build the labels.

---

## Which to use

| Situation | Approach |
|---|---|
| Labels are always the same | `@Breadcrumbs` annotation |
| Labels depend on path variables or data | `BreadcrumbsSupplier` |

---

## Next

- [Layout and composition](/java-user-manual/advanced/layout-and-composition/) — control page structure and styling
- [Rules](/java-user-manual/advanced/rules/) — client-side field behavior
- [Security](/java-user-manual/advanced/security/) — restrict access to pages and menu entries
