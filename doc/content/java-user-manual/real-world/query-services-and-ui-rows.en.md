---
title: "Query services and UI rows"
weight: 3
---

# Query services and UI rows

Mateu works with DTOs, not entities.

```java
new ChangeRow(
    dto.pageId(),
    dto.page(),
    dto.country(),
    dto.language(),
    new Status(...),
    new ColumnAction("compare", "Compare")
)
```

---

## Key idea

> UI rows are explicitly designed.

They can include:

- formatted values
- derived fields
- actions
