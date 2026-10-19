---
title: "Master-detail (Process + Steps)"
---

A master-detail UI in Mateu is built by embedding a child CRUD orchestrator inside a parent screen, not by using `List<Entity>`.

The pattern applies to any parent-child relationship: Order + OrderLines, Customer + Contacts, Project + Tasks. This page uses a Process + Steps example to show the mechanics clearly. The [golden example](/java-user-manual/build/orders-customers-order-lines/) applies the same pattern to Orders and OrderLines with a full backend stack.

---

## Goal

We want:

- a Process (parent)
- a list of Steps (children)
- full CRUD on Steps inside the Process screen

---

## Process (parent)

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
@Style(StyleConstants.CONTAINER)
public class ProcessPage {

    String id;

    String name;

    Callable<?> steps = () -> MateuBeanProvider
        .getBean(Steps.class)
        .withProcessId(id);

}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: processes/:id
    viewModel: com.example.ProcessPage
```

### Key idea

- `steps` is NOT `List<ProcessStep>`
- it is a dynamic UI block
- resolved after the viewmodel is hydrated

---

## Steps (child CRUD)

```java
public class Steps extends AutoCrud<ProcessStep> {
    @Override
    public CrudStore<ProcessStep> store() {
        return new StepStore(); // your CrudStore<ProcessStep>
    }

    String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

}
```

---

## ProcessStep model

```java
record ProcessStep(
    String id,
    String processId,
    String name
) implements Identifiable {}
```

---

## What Mateu generates

Inside the Process screen:

- list of steps (scoped by `processId`)
- readonly detail view per step

If you need create/edit/delete on the child, extend `AutoCrud` instead.

---

## Why this approach

This is preferred over:

```java
List<ProcessStep> steps;
```

Because:

- `List<ProcessStep>` becomes a simple editable structure
- it does NOT provide full CRUD behavior
- it couples UI to domain structure

---

## Mental model

```mermaid
flowchart TD
    P["ProcessPage\nid · name · Callable&lt;?&gt; steps"]
    P -->|resolves after hydration| S["Steps\nextends AutoCrud&lt;ProcessStep&gt;\nscoped by processId"]
    S --> CR["Read-only on ProcessStep\nlist · view"]
```

- parent → state + composition
- child → independent CRUD
- composition → `Callable<?>`

---

## When to use

Use this pattern when:

- child entities have their own lifecycle
- you need CRUD inside another screen
- you want explicit control over data boundaries

---

## Summary

- do NOT model child collections as `List<Entity>`
- use embedded orchestrators instead
- compose using `Callable<?>`

This is the Mateu way to build master-detail UIs.

---

## Next

- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/) — when to use `@Lookup`, `List<Entity>`, or an embedded orchestrator
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — the same pattern applied with a full adapter and repository stack
