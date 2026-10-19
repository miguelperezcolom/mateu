# Extending Mateu — adapters, web components, CSS

## ComponentAdapter — render a domain object you can't (or won't) annotate

Teach Mateu to render and rebuild a plain object, **outside** the class. Register the
adapter as a bean (`@Service`/`@Component` — it holds no per-user state, so a singleton is
fine); Mateu indexes adapters by `type()`.

```java
@Service
public class PedidoAdapter implements ComponentAdapter<Pedido> {

    @Override public Class<Pedido> type() { return Pedido.class; }

    @Override
    public AdaptedView adapt(Pedido model, HttpRequest req) {
        var form = FormLayout.builder()   // io.mateu.uidl.data.FormLayout (not the annotation).autoResponsive(true).content(List.of(
            FormField.builder().id("code").label("Code").dataType(FieldDataType.string).build(),
            FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build()
        )).build();
        var page = PageView.builder()
            .title("Pedido")
            .contentItem(form)
            .toolbarItem(new Button("Save", "save"))   // io.mateu.uidl.data.Button
            .build();
        Map<String, Object> state = new HashMap<>();   // Map.of rejects null values
        state.put("code", model.code);
        state.put("name", model.name);
        return AdaptedView.of(page, state, List.of("save"));
    }

    @Override
    public Pedido deserialize(Map<String,Object> state, HttpRequest req) {
        var m = new Pedido();   // also called with an EMPTY state to build the first instance:
        if (state.containsKey("code")) m.code = (String) state.get("code");   // guard every read,
        if (state.containsKey("name")) m.name = (String) state.get("name");   // or initializers are lost
        return m;
    }
}
```

`adapt` returns components + state + the action ids; `deserialize` rebuilds the model
from the state the frontend sends back. The domain class stays free of UI annotations; give it
`@UI("/route")` only if it is a routed screen (the adapter owns its whole UI). `PageView` is
`io.mateu.uidl.fluent.PageView`.

## Web components (custom client-side pieces)

For a piece Mateu doesn't ship, put an `Element` (`io.mateu.uidl.data.Element`) in the tree
naming your custom element; an `import` attribute loads its JavaScript module, and attribute
values may be `${state.x}` expressions so they update on every `State`:

```java
Element diagram = Element.builder()
    .name("workflow-graph")
    .attributes(Map.of("import", "/js/workflow-graph.js", "value", "${state.topology}"))
    .style("height: 60vh;")
    .build();
```

Events and script injection (`UICommandType.AddContentToHead`):
https://mateu.io/java-user-manual/advanced/custom-web-components/. Use this when CSS isn't
enough but you don't want a whole new renderer.

## CSS & density

| Tool | Use |
|---|---|
| `@Style("…")` | inline CSS / custom properties on a class or field |
| `@CssClasses("…")` | attach your own CSS classes |
| `@Compact` | high-density backoffice mode |
| `StyleConstants.CONTAINER` / `FULL_WIDTH` / `COMPACT` | reusable presets via `@Style(...)` |

```java
@UI("/panel")
@Style(StyleConstants.CONTAINER)
@Compact
public class Panel { /* ... */ }
```

Three levels of escape, smallest first: **CSS** for looks → **web component** for one
piece → **a different renderer** for the whole look & feel.
