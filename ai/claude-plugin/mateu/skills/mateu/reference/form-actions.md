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
| `new Message("…")`, `Message.success/warning/error("…")` | toast (an error toast stays until closed) |
| `new State(this)` | re-hydrate and re-render the current view-model (no navigation) |
| `URI.create("/route")` | navigate to a route |
| any Java object | open that object as a new view |
| `PageBanner` / `List<PageBanner>` | show a banner on the current page |
| `UICommand.dispatchEvent(…)`, `UICommand.closeModal(…)`, `UICommand.markAsClean()` | client commands |
| a `Drawer` / `Dialog` | open it as an overlay over the page |

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

`@Action` accepts: `validationRequired`, `confirmationRequired` +
`confirmationTitle/Message/Text/DenialText`, `background` (fire-and-forget: hide the busy
indicator), `sse` (stream over SSE), `rowsSelectedRequired`, `shortcut` (`"ctrl+s"`), `href`,
`js`, `timeoutMillis`, `idempotent` (safe to retry). `@Button`/`@Toolbar` place the button and
take `buttonStyle` (one `ButtonStyle.primary` per screen), `buttonColor`, `buttonSize`, `order`,
`group`, `separatorBefore`; put `@Action(...)` on the same method for the options above.
Place buttons with `@Button` (form footer) or `@Toolbar` (page toolbar).

## Streaming & long-running work

To stream a sequence of updates (progress, live results) instead of one response,
**return a `Flux<?>`** — that auto-enables `sse`, so you rarely set `sse=true` by hand:

```java
@Button
Flux<?> importar() {
    return LongTask.create("Importando…")        // modal progress dialog
        .withProgressBar()
        .done("Hecho", "Importación completa")
        .run(progress -> servicio.filas()
            .map(f -> progress.step("Fila " + f.id(), f.indice() / (double) f.total())));
}
```

`background` is **orthogonal**: it only hides the busy indicator (fire-and-forget) and
does not stream. Use a raw `Flux<?>` of `Message`/`State`/components when you want full
control instead of the `LongTask` dialog.

## Buttons / placement

```java
@Toolbar(buttonColor = ButtonColor.contrast) void exportar() { /* ... */ }
@Button void cancelar() { /* ... */ }
```

## Layout

Group fields with `@Section("Datos")`, `@Tab("…")`, `@Zones` (side-by-side
columns), `@FoldedLayout`. Use `@Compact` (or `@Style(StyleConstants.COMPACT)`) for
dense backoffice forms. `@Colspan(n)` / `@Weight(n)` tune field width.
