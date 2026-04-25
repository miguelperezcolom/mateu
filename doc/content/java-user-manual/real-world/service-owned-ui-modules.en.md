---
title: "Service-owned UI modules"
weight: 2
---

# Service-owned UI modules

Each service exposes its own UI using:

```java
@UI("/_content-service")
```

Navigation is defined locally:

- menu classes
- orchestrators
- routes

---

## Benefits

- independent deployment
- clear boundaries
- no shared frontend code
