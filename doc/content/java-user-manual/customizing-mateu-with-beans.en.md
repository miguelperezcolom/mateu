---
title: "Customizing Mateu with beans"
weight: 31
---

# Customizing Mateu with beans

Mateu uses interfaces + Spring beans internally.

## Overriding behavior

```java
@Primary
@Service
public class MyCustomImplementation implements SomeInterface {}
```

## Use cases

- custom rendering logic
- alternative data providers
- custom behaviors
