---
title: "SimpleView"
description: "The type placeholder used by auto orchestrators as the View, Editor, and CreationForm type in Crud."
---

`SimpleView<T>` is an internal interface that the auto orchestrators plug into `Crud` as the `View`, `Editor`, and `CreationForm` type parameters. You will see it in the class signatures of `AutoCrud`, `AutoCrud`, `FilteredAutoCrud`, and `FilteredAutoCrud`, but you never implement it directly.

```java
public interface SimpleView<T extends Identifiable>
    extends Entity<String>, CrudEditorForm<String>, CrudCreationForm<String> {

    String name();
}
```

---

## Why it exists

`Crud` requires concrete types for `View`, `Editor`, and `CreationForm`:

```java
Crud<View, Editor extends CrudEditorForm<IdType>, CreationForm extends CrudCreationForm<IdType>, ...>
```

The auto orchestrators use the same entity type `T` for all three screens, but they still need a type that satisfies the `CrudEditorForm` and `CrudCreationForm` bounds. `SimpleView<T>` is that placeholder — it declares the required interface methods without providing an implementation.

The actual implementation is `AutoNamedView<T>`, which implements `SimpleView<T>` and is returned at runtime by the auto adapters.

---

## Inherited contracts

| Interface | What it contributes |
|---|---|
| `Entity<String>` | `id()` — the entity identifier |
| `CrudEditorForm<String>` | `save(httpRequest)` and `id()` |
| `CrudCreationForm<String>` | `create(httpRequest)` |
| `name()` | The screen title |

---

## Where it appears

| Orchestrator | How SimpleView is used |
|---|---|
| `AutoCrud<T>` | `Crud<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String>` |
| `AutoCrud<T>` | Same — read-only, so Editor/CreationForm are unused |
| `FilteredAutoCrud<F,R>` | `Crud<SimpleView<R>, SimpleView<R>, SimpleView<R>, F, R, String>` |
| `FilteredAutoCrud<F,R>` | Same — read-only |

---

## The concrete implementation: AutoNamedView

At runtime, the auto adapters always return `AutoNamedView<T>` — not a `SimpleView<T>` instance. `AutoNamedView<T>` implements `NamedView<T>`, which extends `SimpleView<T>` and adds `EditableFieldsProvider` and `StateSupplier`.

You only interact with `AutoNamedView` directly when overriding `getView()`, `getEditor()`, or `getCreationForm()` in an auto adapter:

```java
return new AutoNamedView<>(entityClass, entity, repository());
```

See [NamedView](/java-user-manual/build/named-view/) for the full picture.

---

## Next

- [NamedView](/java-user-manual/build/named-view/) — the runtime implementation of `SimpleView`, returned by the auto orchestrators
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — when you provide your own View/Editor/CreationForm types instead of `SimpleView`
