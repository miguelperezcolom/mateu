---
title: "Lookups backed by query services"
weight: 4
---

# Lookups backed by query services

```java
@Lookup(
    search = LabelOptionsSupplier.class,
    label = LabelLabelSupplier.class
)
```

---

## Pattern

- options supplier → search results
- label supplier → resolve id to label

Backed by query services.

---

## Benefit

No coupling with domain entities.
