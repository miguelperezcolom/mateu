---
title: "Master-detail (Process + Steps)"
weight: 7
---

# Master-detail (Process + Steps)

This example shows how to build a real master-detail UI in Mateu.

Instead of relying on `List<Entity>`, we explicitly embed a child CRUD.

---

## Goal

We want:

- a Process (parent)
- a list of Steps (children)
- full CRUD on Steps inside the Process screen

---

## Process (parent)

```java
@Route("/processes/:id")
@Style(StyleConstants.CONTAINER)
public class ProcessPage {

    String id;

    String name;

    Callable<?> steps = () -> MateuBeanProvider
        .getBean(Steps.class)
        .withProcessId(id);

}
```

### Key idea

- `steps` is NOT `List<Step>`
- it is a dynamic UI block
- resolved after the viewmodel is hydrated

---

## Steps (child CRUD)

```java
public class Steps extends AutoListOrchestrator<Step> {

    String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

}
```

---

## Step model

```java
record Step(
    String id,
    String processId,
    String name
) {}
```

---

## What Mateu generates

Inside the Process screen:

- list of steps
- create step
- edit step
- delete step

All scoped by `processId`

---

## Why this approach

This is preferred over:

```java
List<Step> steps;
```

Because:

- `List<Step>` becomes a simple editable structure
- it does NOT provide full CRUD behavior
- it couples UI to domain structure

---

## Mental model

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
