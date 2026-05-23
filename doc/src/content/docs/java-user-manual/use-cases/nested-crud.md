---
title: "Nested CRUD"
---

Manage hierarchical data within a single CRUD screen.

This case shows how to embed nested editable collections inside a CRUD form, with each level having its own fields and nested children.

---

## What this case teaches

- how to embed `List<ChildRecord>` fields in a CRUD form
- how `@DetailFormCustomisation` controls how nested collections are edited
- how `@Colspan` spans a field across multiple columns
- how deeply nested structures (4 levels here) are handled the same way at each level
- the Spring injection pattern for CRUD orchestrators

---

## The structure

This example manages entities with 4 levels of nesting:

```
Level1 (has many Level2)
  └── Level2 (has many Level3)
        └── Level3 (has many Level4)
              └── Level4 (leaf)
```

---

## The models

### Level 1 (top-level entity)

```java
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
public record Level1View(
        String id,
        String name,
        @Colspan(2)
        @DetailFormCustomisation(columns = 1, position = FormPosition.modal)
        List<Level2View> level2
) implements Identifiable {

    @Override
    public String toString() {
        return id == null ? "New Level1" : name;
    }
}
```

Key points:

- `@Colspan(2)` makes the `level2` field span the full width when the form has 2 columns
- `@DetailFormCustomisation(columns = 1, position = FormPosition.modal)` opens the detail editor for a Level2 item in a modal dialog with a 1-column layout
- `implements Identifiable` is required for CRUD to work

### Level 2

```java
public record Level2View(
        String name,
        List<Level3View> level3
) {

    @Override
    public String toString() {
        return name == null ? "New Level2" : name;
    }
}
```

### Level 3

```java
public record Level3View(
        String name,
        List<Level4View> level4
) {

    @Override
    public String toString() {
        return name == null ? "New Level3" : name;
    }
}
```

### Level 4 (leaf)

```java
public record Level4View(
        String name,
        int age
) {

    @Override
    public String toString() {
        return name == null ? "New Level4" : name;
    }
}
```

Each level only needs to declare its fields and its children as a `List<ChildRecord>`. Mateu handles the rest.

---

## The infrastructure

### Repository

```java
@Service
public class Level1ViewRepository implements CrudRepository<Level1View> {
    // standard CRUD implementation
}
```

### Adapter

```java
@Service
@RequiredArgsConstructor
public class NestedCrudAdapter extends AutoCrudAdapter<Level1View> {

    final Level1ViewRepository repo;

    @Override
    public CrudRepository<Level1View> repository() {
        return repo;
    }
}
```

### Orchestrator

```java
@Service
@UI("/nested-crud")
@RequiredArgsConstructor
public class NestedCrudOrchestrator extends AutoCrudOrchestrator<Level1View> {

    final NestedCrudAdapter adapter;

    @Override
    public AutoCrudAdapter<Level1View> simpleAdapter() {
        return adapter;
    }
}
```

The orchestrator is registered at `/nested-crud` and uses the full Spring injection pattern.

---

## What `@DetailFormCustomisation` does

```java
@DetailFormCustomisation(columns = 1, position = FormPosition.modal)
List<Level2View> level2
```

This annotation controls how Mateu renders the detail form when the user clicks on a row in the nested list.

| Parameter | Effect |
|-----------|--------|
| `columns = 1` | The detail form uses 1 column layout |
| `position = FormPosition.modal` | The detail form opens in a modal dialog |

Without this annotation, the detail form opens inline below the list row, with the default column count.

---

## How nested collections are rendered

By default, a `List<ChildRecord>` field renders as an editable inline table inside the form.

Each row in the table shows the child's fields.  
Clicking a row opens the detail form (inline or modal, depending on `@DetailFormCustomisation`).  
Add/remove buttons are provided automatically.

This applies at every level: Level2 shows inside Level1's form, Level3 shows inside Level2's form, and so on.

---

## Mental model

- `List<ChildRecord>` in a form = editable nested collection
- `@Colspan(2)` = spans full width in a 2-column layout
- `@DetailFormCustomisation` = controls how the child detail editor opens
- `FormPosition.modal` = opens in a dialog (useful when the child has many fields)
- The top-level entity implements `Identifiable`; children do not need to
- Nesting can go as deep as needed — each level follows the same pattern

---

## Next

- [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/)
- [Master-detail (Process + Steps)](/java-user-manual/build/master-detail/)
- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/)
