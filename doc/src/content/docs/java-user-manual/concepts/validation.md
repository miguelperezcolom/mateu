---
title: "Validation"
---

Mateu enforces standard Java Bean Validation annotations automatically. Rules defined in your ViewModel are reflected in the UI without any additional configuration.

---

## Basic annotations

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).

The `@Size` constraint is Bean Validation's (`jakarta.validation.constraints.Size`). Mateu has an
unrelated `io.mateu.uidl.annotations.Size` (how a component sizes itself), so import the jakarta one
explicitly, as the samples below do.
:::

```java
import jakarta.validation.constraints.Size;

@NotBlank
String name;

@NotNull
ProductStatus status;

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

### The constraints Mateu reads

Mateu reads these Bean Validation constraints, and only these: `@NotNull`, `@NotEmpty`,
`@NotBlank`, `@Size`, `@Min`, `@Max`, `@Pattern`, `@Email`, `@Positive`, `@PositiveOrZero`,
`@Negative`, `@NegativeOrZero`, `@DecimalMin` and `@DecimalMax`. Each one becomes a condition the
browser checks, and the server checks the same thing again before it runs the action, with the same
message. They are read the way Bean Validation reads them:

- `@NotNull` and `@NotEmpty` need a value. `0` and `false` count as values. An empty input, a
  missing value and an empty list do not.
- `@NotBlank` also refuses text that is only whitespace: `"   "` fails, `" Ana "` passes.
- An empty optional value passes every bound (`@Min`, `@Max`, `@Size`, `@Pattern`, `@Email`, the
  sign and decimal bounds). Add `@NotNull` to require it.

Any other constraint, such as `@Past`, `@Future` or a custom one, is not checked in the browser or
before an action runs. See [Custom validators](#custom-validators).

---

## Triggering validation from an action

A `@Button` or `@Toolbar` action, and a CRUD save, check the form before they run. Any other action
runs whatever the form holds, unless you ask for the check with `@Action(validationRequired = true)`.
`@Action(validationRequired = false)` turns the check off for a button, for example a "Save draft"
button:

```java
@Button
@Action(validationRequired = true)
public URI create() {
    String id = productRepository.create(name, status);
    return URI.create("/products/" + id);
}
```

If any field fails validation, the method is not called. Errors appear next to the affected fields.
The server checks too, so a request that skips the browser's check is refused with the same
messages.

---

## Full example

```java
import jakarta.validation.constraints.Size;

@UI("/products/new")
public class NewProductForm {

    @NotBlank(message = "Name is required")
    String name;

    @NotNull(message = "Status is required")
    @Stereotype(FieldStereotype.radio)
    ProductStatus status;

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

A custom Bean Validation constraint (your own `@Constraint` annotation) is **not** picked up. Mateu
does not run a Bean Validation provider on a view's form: it reads only the constraints listed
[above](#the-constraints-mateu-reads), so a `@ValidProductName` is neither checked in the browser
nor before the action runs. The one exception is a CRUD record edited in a drawer
(`editInDrawer()`): its save runs the full validator, custom constraints included.

To check a rule of your own:

- If it can be written as an expression over the form, use `@Validation` on the class. The browser
  checks it. See [Validation annotations](/java-ui-definition/annotations/validation/).
- If it needs the server, check it in the action and refuse with a `UserFacingException`. Its
  message is shown to the user as written:

```java
@Button
public Message save() {
    if (!productNames.isValid(name)) {
        throw new UserFacingException("Invalid product name", "Use letters, digits and spaces only");
    }
    productRepository.rename(id, name);
    return new Message("Saved");
}
```

---

## Next

- [Action behavior](/java-user-manual/concepts/action-behavior/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)

**See it live in the Explorer:** [Validation (client + server)](https://explorer.mateu.io/behaviour/forms/validation)
