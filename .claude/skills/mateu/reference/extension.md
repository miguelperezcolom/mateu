# Extending Mateu — adapters, web components, CSS

## ComponentAdapter — render a domain object you can't (or won't) annotate

Teach Mateu to render and rebuild a plain object, **outside** the class. Register the
adapter as a bean (`@Service`/`@Component`); Mateu indexes adapters by `type()`.

```java
@Service
public class PedidoAdapter implements ComponentAdapter<Pedido> {

    @Override public Class<Pedido> type() { return Pedido.class; }

    @Override
    public AdaptedView adapt(Pedido model, HttpRequest req) {
        var form = FormLayout.builder().autoResponsive(true).content(List.of(
            FormField.builder().id("code").label("Code").dataType(FieldDataType.string).build(),
            FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build()
        )).build();
        var page = PageView.builder()
            .title("Pedido")
            .contentItem(form)
            .toolbarItem(new Button("Save", "save"))
            .build();
        Map<String,Object> state = Map.of("code", model.code, "name", model.name);
        return AdaptedView.of(page, state, List.of("save"));
    }

    @Override
    public Pedido deserialize(Map<String,Object> state, HttpRequest req) {
        var m = new Pedido();
        m.code = (String) state.get("code");
        m.name = (String) state.get("name");
        return m;
    }
}
```

`adapt` returns components + state + the action ids; `deserialize` rebuilds the model
from the state the frontend sends back. The domain class stays free of UI annotations.

## Web components (custom client-side pieces)

For a piece Mateu doesn't ship, the server emits a `ClientSideComponentDto` whose
`metadata` names your custom element; the renderer mounts it and passes state/events.
Use this when CSS isn't enough but you don't want a whole new renderer.

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
