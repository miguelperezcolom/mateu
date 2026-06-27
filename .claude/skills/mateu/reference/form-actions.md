# Mateu forms & actions

## A form

Fields are the state; Bean Validation declares the rules; a `@Button`/`@Action`
method makes it a form. Mateu paints the controls, labels and validation errors.

```java
@UI("/alta")
public class AltaCliente {
    @NotEmpty String nombre;
    @NotEmpty @Email String email;
    @Stereotype(FieldStereotype.textarea) String notas;

    @Button Object guardar() {
        clientes.alta(nombre, email);   // call a use case / service
        return new Message("Cliente creado");
    }
}
```

## Read-only vs editable

- No action ⇒ read-only view. Add `@Button` ⇒ editable form.
- `@ReadOnly` on a field (or the class) keeps it visible but not editable.
- `@PlainText` renders text without an input control (good for result/summary screens).

## Effects (action return values)

Return one, or a `List.of(...)` of several, applied in one round-trip:

| Return | Meaning |
|---|---|
| `void` / `null` | stay on the current page, just re-render |
| `new Message("…")` | toast / notification (variants: info, success, warning, error) |
| `new State(this)` | re-hydrate and re-render the current view-model (no navigation) |
| `URI.create("/route")` | navigate to a route |
| any Java object | open that object as a new view |
| `PageBanner` / `List<PageBanner>` | show a banner on the current page |

There is **no `Navigation` type** — navigate with a `URI` or by returning the object.

```java
@Button Object save() {
    repo.save(this);
    return List.of(new Message("Saved"), new State(this));   // toast + re-render
}

@Button Object saveAndGo() {
    repo.save(this);
    return URI.create("/clientes");                          // navigate
}
```

## Action options

`@Action` (and `@Button`/`@Toolbar`) accept: `validationRequired`,
`confirmationRequired` + `confirmationTitle/Message/Text`, `background` (run async),
`sse` (stream progress), `rowsSelectedRequired`, `shortcut`, `href`, `js`, `order`,
`group`, `separatorBefore`. Place buttons with `@Button` (bottom) or `@Toolbar` (top).

## Buttons / placement

```java
@Toolbar(buttonColor = ButtonColor.contrast) void exportar() { /* ... */ }
@Button void cancelar() { /* ... */ }
```

## Layout

Group fields with `@Section("Datos")`, `@Tabs` + `@Tab("…")`, `@Zones` (side-by-side
columns), `@SplitLayout`. Use `@Compact` (or `@Style(StyleConstants.COMPACT)`) for
dense backoffice forms. `@Colspan(n)` / `@Weight(n)` tune field width.
