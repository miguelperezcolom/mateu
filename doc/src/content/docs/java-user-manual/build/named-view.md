---
title: "AutoNamedView"
description: "The concrete class that wraps an entity as a view, editor, or creation form in AutoCrud and FilteredAutoCrud."
---

`AutoNamedView<T>` is the internal wrapper that `AutoCrud<T>` and `FilteredAutoCrud<Filters,T>` use to turn an entity into a fully functional CRUD screen. It implements `Named`, `CrudEditorForm<String>`, `CrudCreationForm<String>`, `EditableFieldsProvider`, and `StateSupplier` — everything a CRUD screen needs.

```java
new AutoNamedView<>(entityClass, entity, repository)
```

| Constructor parameter | Purpose |
|---|---|
| `entityClass` | Determines which fields to render (`allEditableFields()`) |
| `entity` | The object serialised as state and used for `id()` and `name()` |
| `repository` | Called by `save()` and `create()` to persist the entity |

---

## What AutoNamedView does for each method

| Method | Behaviour |
|---|---|
| `id()` | Returns `entity.id()` |
| `name()` | Returns `entity.toString()`, or `Named.name()` if the entity implements `Named` |
| `state(httpRequest)` | Returns the entity object — serialised as the form's initial field values |
| `allEditableFields()` | Reflects over `entityClass` to find all editable fields |
| `save(httpRequest)` | Deserialises the submitted form state back into `T`, calls `repository.save()` |
| `create(httpRequest)` | Same as `save()`, returns the new entity's id |

---

## When you interact with AutoNamedView directly

You only need to construct an `AutoNamedView` when overriding `buildNamedView()` or `buildCreationForm()` in your `AutoCrud` / `FilteredAutoCrud` subclass to pre-populate fields or add custom view logic:

```java
@Override
public AutoNamedView<Order> buildCreationForm(HttpRequest httpRequest) {
    var order = new Order();
    order.setDate(LocalDate.now());
    order.setStatus(OrderStatus.DRAFT);
    return new AutoNamedView<>(Order.class, order, store());
}
```

For fully custom view/editor/creation form types (different DTOs per screen), use `CrudAdapter` directly and return objects implementing `CrudEditorForm` / `CrudCreationForm` — no `AutoNamedView` needed.

---

## Next

- [Customising AutoCrud behaviour](/java-user-manual/build/auto-adapters/) — the override hooks that return `AutoNamedView`
- [CrudEditorForm and CrudCreationForm](/java-user-manual/build/crud-forms/) — the alternative when each screen has a separate DTO
- [Identifiable, Named, and Searchable](/java-user-manual/build/entity-interfaces/) — the entity interfaces `AutoNamedView` builds on
