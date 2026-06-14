---
title: "SimpleView"
description: "The type placeholder used by auto orchestrators as the View, Editor, and CreationForm type in CrudOrchestrator."
---

`SimpleView<T>` is an internal interface that the auto orchestrators plug into `CrudOrchestrator` as the `View`, `Editor`, and `CreationForm` type parameters. You will see it in the class signatures of `AutoCrudOrchestrator`, `AutoListOrchestrator`, `FilteredAutoCrudOrchestrator`, and `FilteredAutoListOrchestrator`, but you never implement it directly.

```java
public interface SimpleView<T extends Identifiable>
    extends Entity<String>, CrudEditorForm<String>, CrudCreationForm<String> {

    String name();
}
```

---

## Why it exists

`CrudOrchestrator` requires concrete types for `View`, `Editor`, and `CreationForm`:

```java
CrudOrchestrator<View, Editor extends CrudEditorForm<IdType>, CreationForm extends CrudCreationForm<IdType>, ...>
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
| `AutoCrudOrchestrator<T>` | `CrudOrchestrator<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String>` |
| `AutoListOrchestrator<T>` | Same — read-only, so Editor/CreationForm are unused |
| `FilteredAutoCrudOrchestrator<F,R>` | `CrudOrchestrator<SimpleView<R>, SimpleView<R>, SimpleView<R>, F, R, String>` |
| `FilteredAutoListOrchestrator<F,R>` | Same — read-only |

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

- [NamedView](/java-user-manual/build/named-view/) — the runtime implementation of `SimpleView`, returned by the auto adapters
- [AutoListAdapter and AutoCrudAdapter](/java-user-manual/build/auto-adapters/) — where `AutoNamedView` is constructed
- [Full control with CrudOrchestrator](/java-user-manual/build/full-control-crud-orchestrator/) — when you provide your own View/Editor/CreationForm types instead of `SimpleView`
