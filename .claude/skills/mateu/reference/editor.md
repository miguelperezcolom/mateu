# Mateu editor view (partial forms / read ⇄ edit)

When a single entity needs a **read view** and an **edit view** composed under one
route (internal sub-routes `/view` and `/edit`), extend `AutoEditableView<T>`.

```java
@UI("/persona")
public class PersonaView extends AutoEditableView<Persona> {

    @Override
    public Persona load(HttpRequest req) {
        return repo.get(req);            // load for both view and edit
    }

    @Override
    public void persist(Persona entity, HttpRequest req) {
        repo.save(entity);               // called on "save"
    }
}
```

`AutoEditableView<T>` is the simple case where read and edit use the **same type** `T`.
It is a specialisation of `EditableView<V, E>` (different view/editor types) which is a
specialisation of `MultiView`.

## When read and edit differ

Use `EditableView<V, E>` and implement:

- `V view(HttpRequest req)` — the read model
- `E editor(HttpRequest req)` — the edit model
- `void save(HttpRequest req)` — persist (read the bubbled editor state via
  `req.getInitiatorState(EditorType.class)`)

The orchestrator handles the `edit` / `save` / `cancel-edit` actions and routes
between `/view` and `/edit` without losing context.

## MultiView (compose sub-screens)

`MultiView` is the base for a screen that **composes several sub-forms and routes
between them**. Override `resolveInternalRoute(route, req)` to return the component
for each internal route, `handleAction(actionId, req)` for actions, and call
`setRouteTo(route)` to navigate internally. Use it for master-detail and custom
multi-pane editors that the higher-level orchestrators don't cover.
