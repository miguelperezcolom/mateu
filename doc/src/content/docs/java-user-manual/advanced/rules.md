---
title: "Rules"
---

Mateu lets you define dynamic client-side behavior declaratively, directly on field annotations.

Rules are evaluated in the browser and can control field visibility and value display without a round-trip to the server.

---

## Conditional visibility with `@Hidden`

`@Hidden` accepts an expression that is evaluated in the browser against the current form state.

```java
public record ProductComponent(
        String code,
        int quantity,
        boolean special,
        @Hidden("!state['special']")
        String comment
) {}
```

When `special` is `false`, `comment` is hidden. When `special` becomes `true`, `comment` appears immediately — no server call needed.

### Expression syntax

The expression is evaluated against `state`, which is a map of the current field values:

- `state['fieldName']` — accesses a field by name (bracket notation)
- `state.fieldName` — accesses a field by name (dot notation, also valid)
- Standard boolean operators apply: `!`, `&&`, `||`

```java
// Hidden when 'nombre' is empty/null
@Hidden("!state.nombre")
String email;

// Hidden when 'special' is false
@Hidden("!state['special']")
String comment;
```

### Hiding on a type

You can also hide an entire class (hide the whole form or section):

```java
@Hidden
public class InternalPage { ... }
```

### Always hidden

An empty expression hides the field unconditionally. Use this to carry data in form state without showing it:

```java
@Hidden
String id;
```

---

## Status badges with `@Status` and `@StatusMapping`

`@Status` renders a field as a colored badge instead of plain text. Use `@StatusMapping` to map specific values to visual status types.

```java
@Status(
    defaultStatus = StatusType.NONE,
    mappings = {
        @StatusMapping(from = "Available", to = StatusType.SUCCESS),
        @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
    }
)
ProductStatus status;
```

This works with both enums and strings.

### Status types

| `StatusType` | Visual meaning |
|---|---|
| `SUCCESS` | Green — positive, active, released |
| `DANGER` | Red — error, out of stock, blocked |
| `WARNING` | Yellow — attention needed |
| `NONE` | Neutral — no special meaning |
| `PRIMARY` | Blue — informational |
| `CONTRAST` | Dark — emphasized |

### Example with strings

```java
@Status(
    defaultStatus = StatusType.NONE,
    mappings = {
        @StatusMapping(from = "si", to = StatusType.SUCCESS),
        @StatusMapping(from = "no", to = StatusType.DANGER)
    }
)
String status;
```

---

## Value display mapping with `@MappedValue`

`@MappedValue` maps the stored value of a field to a different display string.

This is purely a display transformation — the stored value is unchanged.

```java
@MappedValue(
    defaultValue = "x",
    mappings = {
        @ValueMapping(from = "true", to = "si!!!"),
        @ValueMapping(from = "false", to = "no!!!!")
    }
)
boolean main;
```

When `main` is `true`, the UI shows `si!!!`. When it is `false`, it shows `no!!!!`. The underlying value is still a boolean.

Use `@MappedValue` when:
- you want human-friendly labels for boolean or enum fields
- the stored value and the display label are different

---

## Combining rules

Rules compose naturally:

```java
public record Grupo(
    @NotEmpty String id,
    @NotEmpty String nombre,
    @Status(defaultStatus = StatusType.NONE, mappings = {
        @StatusMapping(from = "si", to = StatusType.SUCCESS),
        @StatusMapping(from = "no", to = StatusType.DANGER)
    })
    String status,
    @MappedValue(defaultValue = "x", mappings = {
        @ValueMapping(from = "true", to = "si!!!"),
        @ValueMapping(from = "false", to = "no!!!!")
    })
    boolean main,
    @Colspan(2) @Hidden("!state.nombre") String email,
    @Colspan(2) List<Miembro> miembros
) implements Identifiable {}
```

- `email` is only visible when `nombre` has a value
- `status` shows as a colored badge
- `main` shows as `si!!!` or `no!!!!` in the UI

---

## Mental model

- `@Hidden("expression")` — dynamic visibility, evaluated in the browser
- `@Hidden` — always hidden (no expression)
- `@Status` + `@StatusMapping` — colored badge for enum or string fields
- `@MappedValue` + `@ValueMapping` — display transformation for any field value
- All rules are declarative: no custom JavaScript needed

---

## Next

- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)
- [UI effects](/java-user-manual/concepts/ui-effects/)
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/)
