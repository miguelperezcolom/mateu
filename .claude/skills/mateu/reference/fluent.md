# Mateu fluent UI (component tree in code)

When you need a custom or data-dependent layout, `implements ComponentTreeSupplier`
and build the tree in `component(HttpRequest)`. Same server, same pipeline, same UIDL
as the declarative path — you just write the tree yourself.

```java
@UI("/counter")
public class Counter implements ComponentTreeSupplier {

    int count = 0;                                  // field = state (still stateless)
    Counter increment() { count++; return this; }

    @Override
    public Component component(HttpRequest req) {
        return new VerticalLayout(
            new Text("${state.count}"),             // ${state.x} binds to a field
            new Button("Increment", () -> new State(increment()))  // Callable → new State
        );
    }
}
```

Key pieces:
- `${state.fieldName}` interpolates a field into labels/text.
- A `Button`'s `Callable<?>` runs server-side and returns the next effect (usually
  `new State(this)`).
- Components live in `io.mateu.uidl.data` and most expose a Lombok `.builder()`.

## Builders for richer UI

```java
return Listing.builder()
    .title("Reservas")
    .searchable(true)
    .columns(List.of(
        GridColumn.builder().id("localizador").label("Loc.").sortable(true).build(),
        GridColumn.builder().id("hotel").label("Hotel").build()))
    .toolbar(List.of(Button.builder().label("Exportar").actionId("export").build()))
    .build();
```

Common components: `VerticalLayout`, `HorizontalLayout`, `Card`, `Badge`, `Text`,
`Chart`, `Avatar`, `Form`, `Listing`, `PageView`, `MicroFrontend`.

## Mixing fluent into a declarative screen

A declarative class can hold a `Component` field (static) or a `Callable<?>`
(evaluated after hydration) — e.g. embed a chart or avatar inside a normal form:

```java
@UI("/mixed")
@Style(StyleConstants.CONTAINER)
public class MixedPage {
    String name;
    Component stats = new HorizontalLayout(
        Chart.builder().chartType(ChartType.doughnut)./* ... */build(),
        Avatar.builder().name("Mateu").build());
    @Button void save() {}
}
```

Prefer declarative for the 90%; reach for fluent for dashboards, bespoke components,
and runtime-dependent composition.
