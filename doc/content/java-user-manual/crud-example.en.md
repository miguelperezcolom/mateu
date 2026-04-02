---
title: "A real CRUD example"
weight: 11
---

# A real CRUD example

## View model excerpt

```java
@NotEmpty
String name;

@Button
public Message save() {
  return new Message("Saved successfully");
}
```

Mateu handles:

- UI rendering  
- validation  
- interaction  
- user feedback  
