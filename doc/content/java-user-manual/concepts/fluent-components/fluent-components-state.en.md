---
title: "Using state in fluent components"
weight: 3
---

# Using state in fluent components

When embedding fluent components inside a declarative page, there are multiple ways to use ViewModel state.

## 1. Direct component field (static content)

```java
Component header = new Badge("Static");
```

Use this when the content does not depend on runtime state.

---

## 2. Deferred component with `Callable<?>` (recommended)

```java
Callable<?> headerStats = () -> new HorizontalLayout(
    new Avatar(name),
    new Badge("v" + version)
);
```

Use this when the fluent content depends on hydrated ViewModel state.

This is the most natural approach in Java, since evaluation happens after the ViewModel has been hydrated.

---

## 3. State expressions

```java
Component headerStats = new HorizontalLayout(
    new Avatar("${state.name}"),
    new Badge("v${state.version}")
);
```

Use this when the component supports state-based expressions directly.

---

## Mental model

- `Component` → static content  
- `Callable<?>` → dynamic content based on state  
- `${state...}` → declarative binding inside components
