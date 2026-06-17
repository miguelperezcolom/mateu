---
title: "NamedView"
description: "The interface that wraps an entity for use as a view, editor, or creation form in a CrudAdapter."
---

`NamedView<T>` is the return type of `AutoCrudAdapter`'s `getView()`, `getEditor()`, and `getCreationForm()` methods. It combines all the contracts a CRUD screen needs into one interface: it knows its title, its id, how to render its fields, how to provide its state to the client, and how to save or create the underlying entity.

```java
public interface NamedView<T extends Identifiable>
    extends Identifiable,
            CrudEditorForm<String>,
            CrudCreationForm<String>,
            EditableFieldsProvider,
            StateSupplier {

    String name();
}
```

---

## Inherited contracts

| Interface | What it contributes |
|---|---|
| `Identifiable` | `id()` — the entity's identifier, used for navigation after save |
| `CrudEditorForm<String>` | `save(httpRequest)` — persists the edited entity |
| `CrudCreationForm<String>` | `create(httpRequest)` — creates and persists a new entity, returns its id |
| `EditableFieldsProvider` | `allEditableFields()` — the list of `Field` objects rendered as form inputs |
| `StateSupplier` | `state(httpRequest)` — the object serialised as component state for the client |
| `name()` | The string shown as the detail view / form title |

---

## AutoNamedView — the built-in implementation

You rarely implement `NamedView` directly. `AutoNamedView<T>` is the pre-built implementation used by `AutoCrudAdapter` and `FilteredAutoCrudAdapter`. It wraps any `T extends Identifiable` and wires all the contracts to the entity and the repository:

```java
new AutoNamedView<>(entityClass, entity, repository)
```

| Constructor parameter | Purpose |
|---|---|
| `entityClass` | Determines which fields to render (`allEditableFields()`) |
| `entity` | The object serialised as state and used for `id()` and `name()` |
| `repository` | Called by `save()` and `create()` to persist the entity |

### What AutoNamedView does for each method

| Method | Behaviour |
|---|---|
| `id()` | Returns `entity.id()` |
| `name()` | Returns `entity.toString()`, or `Named.name()` if the entity implements `Named` |
| `state(httpRequest)` | Returns the entity object — serialised as the form's initial field values |
| `allEditableFields()` | Reflects over `entityClass` to find all editable fields |
| `save(httpRequest)` | Deserialises the submitted form state back into `T`, calls `repository.save()` |
| `create(httpRequest)` | Same as `save()`, returns the new entity's id |

---

## When to use NamedView directly

You only need to implement `NamedView` (or return a custom object that implements it) when:

- The view/editor/creation form is a different class from the entity (e.g. a DTO or projection).
- You need custom save logic that cannot be expressed by delegating to `repository.save()`.
- The form fields differ between view and edit (different `allEditableFields()` implementations).

In those cases, implement `CrudEditorForm` and `CrudCreationForm` separately on the form classes and return them from `getEditor()` / `getCreationForm()` in the adapter — you do not need to implement `NamedView` at all. See [CrudEditorForm and CrudCreationForm](/java-user-manual/build/crud-forms/) for that pattern.

---

## Example — custom AutoNamedView with pre-populated fields

```java
@Override
public NamedView<Order> getCreationForm(HttpRequest httpRequest) {
    var order = new Order();
    order.setDate(LocalDate.now());
    order.setStatus(OrderStatus.DRAFT);
    return new AutoNamedView<>(Order.class, order, repository());
}
```

The fields `date` and `status` are pre-filled; everything else is blank.

---

## Next

- [AutoCrudAdapter](/java-user-manual/build/auto-adapters/) — where `NamedView` and `AutoNamedView` are returned
- [CrudEditorForm and CrudCreationForm](/java-user-manual/build/crud-forms/) — the lighter alternative when you don't need the full `NamedView` contract
- [Identifiable, Named, and Searchable](/java-user-manual/build/entity-interfaces/) — the entity interfaces that `NamedView` builds on
