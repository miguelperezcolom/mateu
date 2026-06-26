---
title: "ComponentAdapter"
description: "Render an arbitrary domain object that is not a Mateu component, and round-trip it back from state."
---

`ComponentAdapter<T>` lets you teach Mateu how to render a type it knows nothing about — a
plain domain object that carries **no Mateu annotations** and is not a Mateu component — and
how to rebuild that object from the state the frontend sends back on an action.

It is the extension point for *bridging* foreign models into the Mateu pipeline: you supply
the components + state + data; Mateu reuses its normal rendering, action dispatch and state
round-trip for them.

:::note
For when to reach for an adapter vs. a semantic annotation vs. a custom supplier, see
[Build Your Domain Vocabulary](../domain-vocabulary/).
:::

```java
public interface ComponentAdapter<T> {

  /** The domain type this adapter handles (subtypes match too). */
  Class<T> type();

  /** Render the model as components + state + data. */
  AdaptedView adapt(T model, HttpRequest httpRequest);

  /** Rebuild the model from the state map that the frontend sends back. */
  T deserialize(Map<String, Object> state, HttpRequest httpRequest);
}
```

Register it as a bean (`@Service`, `@Component`, `@Named`…). Mateu indexes every
`ComponentAdapter` bean by `type()`.

## How it works

- `adapt` returns an [`AdaptedView`](#adaptedview) — the components to render, the `state`
  map that backs them (field ids ↔ values) and an optional `data` map, plus the action ids
  the view exposes.
- When any object whose type has a registered adapter flows through the rendering pipeline,
  Mateu bridges it: the adapter's components are rendered, and the **model's own type name**
  is advertised as the component's `serverSideType`.
- On an action, the frontend sends that `serverSideType` plus the (possibly edited) `state`.
  Mateu calls `deserialize(state)` to rebuild the model, then runs the action method on it —
  so the action sees the user's edits.

## Example

A plain `Pedido` (order) — no Mateu annotations:

```java
public class Pedido {
  public String referencia = "PED-2026-0042";
  public String cliente = "Bodegas Riojanas S.A.";
  public int cantidad = 12;
  public BigDecimal total = new BigDecimal("1450.75");

  Object guardar(HttpRequest httpRequest) {              // action method, runs after deserialize
    return Message.success("Pedido guardado: " + referencia + " · " + cliente);
  }
}
```

Its adapter:

```java
@Service
public class PedidoAdapter implements ComponentAdapter<Pedido> {

  @Override public Class<Pedido> type() { return Pedido.class; }

  @Override
  public AdaptedView adapt(Pedido p, HttpRequest httpRequest) {
    var form = FormLayout.builder().autoResponsive(true).content(List.of(
        FormField.builder().id("referencia").label("Referencia").dataType(FieldDataType.string).build(),
        FormField.builder().id("cliente").label("Cliente").dataType(FieldDataType.string).build(),
        FormField.builder().id("cantidad").label("Cantidad").dataType(FieldDataType.integer).build(),
        FormField.builder().id("total").label("Total (€)").dataType(FieldDataType.number).build())).build();

    var page = PageView.builder()
        .title("Pedido (adaptado)")
        .contentItem(form)
        .toolbarItem(new Button("Guardar", "guardar"))   // action id "guardar"
        .build();

    // state keys mirror the FormField ids
    Map<String, Object> state = new LinkedHashMap<>();
    state.put("referencia", p.referencia);
    state.put("cliente", p.cliente);
    state.put("cantidad", p.cantidad);
    state.put("total", p.total);

    return AdaptedView.of(page, state, List.of("guardar"));   // advertise the action id
  }

  @Override
  public Pedido deserialize(Map<String, Object> state, HttpRequest httpRequest) {
    // Only overwrite keys that are present, so field initializers survive an empty initial state.
    var p = new Pedido();
    if (state.containsKey("referencia")) p.referencia = String.valueOf(state.get("referencia"));
    if (state.containsKey("cliente"))    p.cliente    = String.valueOf(state.get("cliente"));
    if (state.containsKey("cantidad"))   p.cantidad   = (int) Double.parseDouble(String.valueOf(state.get("cantidad")));
    if (state.containsKey("total"))      p.total      = new BigDecimal(String.valueOf(state.get("total")));
    return p;
  }
}
```

To show it on a route, give the model a route (`@UI` only registers the route — it adds no
form behaviour, the adapter still owns the whole UI) and seed the initial view with field
initializers:

```java
@UI("/pedido")
public class Pedido { /* … as above … */ }
```

Navigating to `/pedido` renders the adapter's form with the initializer values; editing a
field and pressing **Guardar** round-trips the edited state through `deserialize` and runs
`guardar` on the rebuilt `Pedido`.

:::tip[Preserve initializers in `deserialize`]
The same `deserialize` is used to build the **initial** route instance from an empty state.
Guard each assignment with `state.containsKey(...)` so an empty state keeps the model's field
initializers instead of nulling them.
:::

## Nested fields

An adapted type also works as a **field** of a normal Mateu form. It is rendered as an
independent island that carries its own `serverSideType`, state and actions, so its own
buttons round-trip through the adapter without involving the host form:

```java
@UI("/documento")
public class Documento {
  String documento = "DOC-2026-0007";   // normal Mateu field
  Pedido pedido = new Pedido();          // rendered by PedidoAdapter as an island
}
```

## AdaptedView

`adapt` returns an `AdaptedView` — a record bundling everything the renderer needs. Use its
factory methods:

```java
AdaptedView.of(component, state)                       // single component + state
AdaptedView.of(component, state, actions)              // + advertised action ids
AdaptedView.of(components, state, data, actions)       // full form
```

`actions` lists the action ids the view exposes; Mateu advertises them so a button click is
actually sent to the server (an action is only dispatched if the component claims it).
`data` is the optional data map (e.g. lookup option lists) consumed the same way as for any
other component.
