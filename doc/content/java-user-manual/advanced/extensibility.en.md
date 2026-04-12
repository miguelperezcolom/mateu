---
title: "Extensibility"
weight: 5
aliases:
  - /java-user-manual/extensibility/
---

# Extensibility

Mateu is designed to be extensible at every level.

## Architecture-level extensibility

Mateu is composed of two decoupled parts:

- backend library
- frontend renderer

They communicate through a shared API.

## Framework-level extensibility

You can override internal behavior using Spring beans:

```java
@Primary
@Service
public class MyCustomImplementation implements SomeInterface {}
```

## UI-level extensibility

Mateu supports custom web components.

👉 See: custom web components
