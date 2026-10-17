---
title: "Java imports"
description: "Which package each sample's types come from, and why wildcard imports of io.mateu.uidl packages break with \"reference is ambiguous\"."
---

The Java samples in these docs leave the `import` lines out to stay short. They compile with
**single-type imports** — one `import io.mateu.uidl.annotations.Menu;` per type — and your IDE
adds those for you. They do **not** compile with wildcard imports of two Mateu packages at once:

```java
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.*;     // ← `Menu`, `Button`, `Text`… now exist twice

public class Shell {
    @Menu Products products;     // error: reference to Menu is ambiguous
}
```

The reason is deliberate: an **annotation** and the **data record** it stands for share a name
(`@Button` on a method vs a fluent `Button` you put in a component tree). If you prefer wildcards,
import one package with a wildcard and the clashing types from the other one by name — a
single-type import wins over a wildcard.

## Names that exist in more than one package

| Simple name | Where | Which one a sample means |
|---|---|---|
| `Action` | `annotations`, `fluent` | `@Action` on a method → `annotations`; an `Action` in `actions()` → `fluent` |
| `App` | `annotations`, `interfaces` | `@App(...)` on the shell class → `annotations` |
| `Avatar`, `Badge`, `Breadcrumb`, `Breadcrumbs`, `BulletedList`, `Details`, `Icon`, `KPI`, `Notice`, `Status`, `Tab`, `Text`, `Tooltip` | `annotations`, `data` | on a field → `annotations`; built with `new`/`.builder()` in a component tree → `data` |
| `Button`, `Menu`, `FormLayout`, `RestAction`, `Rule`, `Validation` | `annotations`, `data` | same rule: annotation vs record |
| `Filterable`, `Searchable` | `annotations`, `interfaces` | `implements Filterable<F>` / `Searchable` on a listing → `interfaces`; `@Searchable` on a lookup field → `annotations` |
| `Listing` | `fluent`, `interfaces` | `implements Listing<Row>` → `interfaces`; a fluent listing component → `fluent` |
| `Page` | `data`, `interfaces` | `Page<T>` returned by `CrudStore.find` → `data` |
| `Step` | `data`, `fluent` | a flow step returned by an action → `fluent` |
| `Trigger` | `annotations`, `fluent` | `@Trigger` on a class → `annotations`; a trigger in `triggers()` → `fluent` |
| `UI` | `annotations`, `fluent` | `@UI("/route")` → `annotations` |

All packages above are under `io.mateu.uidl`.

## Names that clash with the JDK

| Mateu type | Clashes with | Tip |
|---|---|---|
| `io.mateu.uidl.annotations.List` | `java.util.List` | import `java.util.List` by name; the annotation is rarely needed |
| `io.mateu.uidl.data.Map` (the map component) | `java.util.Map` | refer to one of them by its full name |
| `io.mateu.uidl.data.Image` | `java.awt.Image` | only matters if you also import `java.awt.*` |
