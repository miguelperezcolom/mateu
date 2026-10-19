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
- A `Button`'s `Callable<?>`/`Runnable` runs server-side and returns the next effect (usually
  `new State(this)`); such a button needs no `@Action` (its handler is the lambda). A button
  built with an `actionId` instead (`new Button("Save", "save")`) needs a method `save` marked
  `@Action`.
- Components live in `io.mateu.uidl.data` (`Text`, `Button`, layouts, `Card`, `Chart`, …) and
  `io.mateu.uidl.fluent` (`Listing`, `Form`, `PageView`…); records with 3+ components have a
  Lombok `.builder()`. Import the record classes by name — `Text`/`Button`/`Badge` also exist as
  annotations.

## Builders for richer UI

```java
// io.mateu.uidl.fluent.Listing — the COMPONENT, not the io.mateu.uidl.interfaces.Listing you implement
return Listing.builder()
    .title("Reservas")
    .searchable(true)
    .columns(List.of(
        GridColumn.builder().id("localizador").label("Loc.").sortable(true).build(),
        GridColumn.builder().id("hotel").label("Hotel").build()))
    .toolbar(List.of(Button.builder().label("Exportar").actionId("export").build()))
    .build();
```

Common components: `VerticalLayout`, `HorizontalLayout`, `Card`, `Badge`, `Text`, `Markdown`,
`Chart`, `Avatar`, `Form`, `Listing`, `PageView`, `MicroFrontend`, `Drawer`, `Dialog`, `Notice`,
`EmptyState`, `Element` (any HTML/custom element). Catalogue: https://mateu.io/java-ui-definition/components/.

Front-office widgets (all `io.mateu.uidl.data`, `.builder()`; clicks dispatch `actionId` with the
listed parameters — the handler must be an `@Action` method; docs: https://mateu.io/ux-patterns/front-office/):

| Component | Key builder fields | Sends |
|---|---|---|
| `TaskQueue` | `actionId`, `groups(List<QueueGroup>)` | `_item` |
| `EntityHeader` | `title`, `subtitle`, `badges(List<Chip>)`, `facts(List<Fact>)`, `metricLabel/Value` | display-only |
| `Ledger` + `PaymentPicker` | `lines(List<LedgerLine>)`, `total` · `methods(List<PaymentMethod>)`, `actionId` | `_method` |
| `ResourceGrid` | `actionId`, `columns`, `items(List<ResourceItem>)` | `_item` |
| `OfferCard` | `title`, `features(List<String>)`, `priceLabel`, `actionLabel`, `actionId` | — |
| `AddOnPicker` | `actionId`, `items(List<AddOn>)`, `currency` | `_item`, `_added`, `_total` |
| `StatusList` | `items(List<StatusItem>)`, `rowActionId` | `_item` |
| `Meter` | `label`, `value`, `max`, `warnAt`, `dangerAt`, `unit` | display-only |
| `TaskProgress` | `label`, `total`, `done`, `actionLabel`, `actionId` | — |
| `ProcessMonitor` | `items(List<ProcessItem>)` (each with its own `actionId`) | — |

## Mixing fluent into a declarative screen

A declarative class can hold a `Component` field (static) or a `Callable<?>`
(evaluated after hydration) — e.g. embed a chart or avatar inside a normal form:

```java
@UI("/mixed")
@Style(StyleConstants.CONTAINER)
public class MixedPage {
    String name;
    Component stats = new HorizontalLayout(
        Chart.builder().chartType(ChartType.doughnut).build(),   // + .chartData(...)
        Avatar.builder().name("Mateu").build());
    @Button void save() {}
}
```

Prefer declarative for the 90%; reach for fluent for dashboards, bespoke components,
and runtime-dependent composition.
