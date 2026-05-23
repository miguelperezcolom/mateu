---
title: "Validation"
---

Mateu enforces standard Java Bean Validation annotations automatically. Rules defined in your ViewModel are reflected in the UI without any additional configuration.

---

## Basic annotations

```java
@NotBlank
String name;

@NotNull
Status status;

@Email
String contactEmail;

@Size(min = 2, max = 200)
String description;

@Min(0)
int stockCount;
```

Mateu uses these annotations to:

- display validation errors next to the affected field
- prevent form submission when validation fails
- keep backend and UI validation consistent with a single source of truth

---

## Triggering validation from an action

By default, actions run regardless of validation state. To require valid input before an action executes, use `@Action(validationRequired = true)`:

```java
@Button
@Action(validationRequired = true)
public URI create() {
    String id = productRepository.create(name, status);
    return URI.create("/products/" + id);
}
```

If any field fails validation, the method is not called. Errors appear next to the affected fields.

---

## Full example

```java
@UI("/products/new")
public class NewProductForm {

    @NotBlank(message = "Name is required")
    String name;

    @NotNull(message = "Status is required")
    @Stereotype(FieldStereotype.radio)
    Status status;

    @Size(max = 500)
    @Stereotype(FieldStereotype.textarea)
    String description;

    @Min(value = 0, message = "Stock cannot be negative")
    int stockCount;

    @Button
    @Action(validationRequired = true)
    public List<?> save() {
        String id = productRepository.create(name, status, description, stockCount);
        return List.of(
            new Message("Product created"),
            URI.create("/products/" + id)
        );
    }

}
```

---

## Why this matters

In traditional architectures, validation is duplicated:

- frontend validation (JavaScript)
- backend validation (Java)

With Mateu, validation is defined once in Java and applied in both places. There is no risk of the two diverging.

---

## Custom validators

Standard Bean Validation custom constraints work as expected. Any `@Constraint` annotation on a field is picked up automatically.

```java
@ValidProductName   // custom constraint
String name;
```

---

## Next

- [Action behavior](/java-user-manual/concepts/action-behavior/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)
