---
title: "Routing and parameters"
---

Mateu binds URL parameters directly to ViewModel fields. There are no controllers, no manual parsing, and no mapping layer.

The URL is just another input to your UI state.

---

## Path parameters

Define placeholders in the route using `:name` syntax. Mateu maps them to fields with matching names.

```java
@Route("/products/:id")
public class ProductForm {

    String id;   // receives the value from the URL

}
```

Navigating to `/products/abc-123` sets `id = "abc-123"` before any action runs.

---

## Query parameters

Fields not covered by path parameters are populated from the query string automatically.

```java
@Route("/products/:id")
public class ProductForm {

    String id;       // from path
    int version;     // from query string

}
```

Navigating to `/products/abc-123?version=2` sets:

- `id = "abc-123"`
- `version = 2`

Mateu handles type conversion. A missing parameter uses the field's default Java value.

---

## Full example

```java
@Route("/products/:id")
public class ProductForm {

    String id;
    int version;

    @NotBlank
    String name;

    @Stereotype(FieldStereotype.radio)
    Status status;

    @ReadOnly
    String audit;

    @Button
    void inspect() {
        audit = "id=" + id + ", version=" + version + ", name=" + name;
    }

}
```

URL:

```
http://localhost:8080/products/abc-123?version=2
```

Result before the user acts:

- `id = "abc-123"`
- `version = 2`
- `name` and `status` are populated from whatever the browser sent as form state

---

## What this enables

Traditional architectures require:

1. Controller receives request
2. Controller parses parameters
3. Controller maps to a DTO
4. DTO is passed to the UI layer

With Mateu:

1. URL maps directly to the ViewModel

No intermediate layer. No boilerplate.

---

## Notes

- Field names must match parameter names exactly (case-sensitive)
- Type conversion is automatic for primitives and common types (`String`, `int`, `long`, `boolean`, `LocalDate`, etc.)
- Missing parameters leave fields at their Java default value

---

## Next

- [UI vs Route](/java-user-manual/concepts/ui-vs-route/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Action behavior](/java-user-manual/concepts/action-behavior/)
