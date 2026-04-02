---
title: "Action behavior"
weight: 11
---

# Action behavior

Actions can return UI effects such as messages or commands.

```java
@Button
public Message save() {
  return new Message("Saved successfully");
}
```
