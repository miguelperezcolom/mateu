---
title: "Validations"
---

Validations run client-side checks before an action reaches the backend. If any validation fails, the action is not called and the error message is shown next to the field.

Implement `ValidationSupplier` and return a list of `Validation` objects from `validations()`. The action must also declare `validationRequired(true)`.

---

## The pattern

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
public class MyPage implements ComponentTreeSupplier, ActionSupplier, ValidationSupplier {

    @Override
    public Form component(HttpRequest httpRequest) { ... }

    @Override
    public List<Action> actions() {
        return List.of(
            Action.builder()
                    .id("submit")
                    .validationRequired(true)   // run validations before calling backend
                    .build()
        );
    }

    @Override
    public List<Validation> validations() {
        return List.of(
            Validation.builder()
                    .condition("state.name")         // truthy = valid
                    .fieldId("name")
                    .message("Name is required")
                    .build()
        );
    }
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: my-page
    viewModel: com.example.MyPage
```

Each validation:
- `condition` — a JS expression evaluated against the current `state`. **Truthy = valid**, falsy = show error.
- `fieldId` — the field to attach the error to (or empty for form-level errors)
- `message` — the error text shown when `condition` is falsy

---

## Required field

```java
Validation.builder()
        .condition("state.name")
        .fieldId("name")
        .message("Name is required")
        .build()
```

`state.name` is truthy when the field has a non-empty, non-null value.

---

## Conditional validation

Validate a field only when another field has a value.

```java
Validation.builder()
        .condition("!state.name || state.age > 0")
        .fieldId("age")
        .message("Age must be greater than 0 if you fill the name field.")
        .build()
```

The condition reads: "either name is empty (so age doesn't matter) OR age is greater than 0".

---

## Form-level validation

Omit `fieldId` (or set it to `""`) to attach the error to the form rather than a specific field.

```java
Validation.builder()
        .condition("state.name && state.age > 30")
        .message("Name is required and age must be greater than 30")
        .build()
```

The error appears at the top of the form, not on any individual field.

---

## Multi-field validation

Validate across multiple fields in one rule by leaving `fieldId` empty:

```java
Validation.builder()
        .condition("state.startDate <= state.endDate")
        .message("Start date must be before end date")
        .build()
```

---

## Min / max value

```java
Validation.builder()
        .condition("state.age >= 0 && state.age < 100")
        .fieldId("age")
        .message("Age must be between 0 and 99")
        .build()
```

---

## Min / max length

```java
Validation.builder()
        .condition("state.name.length > 2 && state.name.length < 50")
        .fieldId("name")
        .message("Name must be between 3 and 49 characters")
        .build()
```

---

## Pattern (regex)

```java
Validation.builder()
        .condition("/^[a-z]+$/.test(state.name)")
        .fieldId("name")
        .message("Name must contain lowercase letters only")
        .build()
```

Standard JS regex syntax inside the condition expression.

---

## Multiple validations on the same field

Return as many `Validation` objects as needed. All are checked; all failures are shown.

```java
@Override
public List<Validation> validations() {
    return List.of(
        Validation.builder()
                .condition("state.name")
                .fieldId("name")
                .message("Name is required")
                .build(),
        Validation.builder()
                .condition("!state.name || state.name.length >= 3")
                .fieldId("name")
                .message("Name must be at least 3 characters")
                .build(),
        Validation.builder()
                .condition("!state.name || /^[a-zA-Z ]+$/.test(state.name)")
                .fieldId("name")
                .message("Name must contain letters and spaces only")
                .build()
    );
}
```

---

## Server-side validation

The Bean Validation constraints you declare on fields (`@NotEmpty`, `@NotNull`, `@Size`, `@Min`,
`@Max`, `@Pattern`) are checked **twice**: by the browser before it sends an action marked
`validationRequired` (every `@Button` / `@Toolbar`, an `@Action(validationRequired = true)`, a CRUD
save), and again by the server before it runs that action — with the same messages. The browser is
not to be trusted, nor the only client, so a request that skipped the client check is refused with
"There are validation errors". Custom `Validation` conditions (the JavaScript expressions on this
page) and a `ValidationSupplier` are evaluated by the client only.

For checks that require backend logic (uniqueness, business rules), throw a `UserFacingException`
from the action — its title and message are shown to the user as written:

```java
@Button
public Message save(HttpRequest httpRequest) {
    if (userRepository.existsByUsername(username)) {
        throw new UserFacingException("Cannot save", "Username already taken");
    }
    // proceed with save
    return new Message("Saved");
}
```

---

## Validation summary

| Use case | Approach |
|---|---|
| Required field | `condition("state.field")` |
| Conditional required | `condition("!state.other \|\| state.field")` |
| Min/max numeric | `condition("state.n >= min && state.n <= max")` |
| Length constraint | `condition("state.s.length >= min && state.s.length <= max")` |
| Regex pattern | `condition("/pattern/.test(state.field)")` |
| Form-level error | omit `fieldId` |
| Backend rule | throw `UserFacingException` from the action |

---

## Next

- [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/)
- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
