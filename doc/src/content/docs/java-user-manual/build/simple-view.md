---
title: "AutoNamedView as generic parameter"
description: "How FilteredAutoCrud and AutoCrud use AutoNamedView<T> directly as the View, Editor, and CreationForm type in Crud."
---

`AutoCrud<T>` and `FilteredAutoCrud<Filters,T>` use `AutoNamedView<T>` directly as the `View`, `Editor`, and `CreationForm` type parameters in the `Crud` base class:

```java
public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<AutoNamedView<T>, AutoNamedView<T>, AutoNamedView<T>, Filters, T, String>
```

`AutoNamedView<T>` satisfies the `CrudEditorForm<String>` and `CrudCreationForm<String>` bounds that `Crud` requires for `Editor` and `CreationForm`. You never instantiate or implement these type parameters yourself — `FilteredAutoCrud` creates `AutoNamedView` instances internally via `buildNamedView()` and `buildCreationForm()`.

---

## Where this matters

You only encounter this directly if you:

- Override `buildNamedView()` or `buildCreationForm()` — return type is `AutoNamedView<T>`.
- Call `adapter()` on a `FilteredAutoCrud` — the returned `CrudAdapter` is parameterised with `AutoNamedView<T>`.

For fully custom view/editor/creation form types, step up to `Crud` directly and supply your own types.

---

## Next

- [AutoNamedView](/java-user-manual/build/named-view/) — what `AutoNamedView` is and what it does
- [Customising AutoCrud behaviour](/java-user-manual/build/auto-adapters/) — the override hooks that return `AutoNamedView`
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — when you provide your own View/Editor/CreationForm types
