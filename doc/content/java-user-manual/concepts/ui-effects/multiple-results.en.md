---
title: "Returning multiple results"
weight: 3
---

# Returning multiple results

Actions can return multiple results in a single response.

## Example

```java
@Button
public Object save() {
    summary = "User " + name + " saved";
    return List.of(
        new Message("User saved"),
        new State(this)
    );
}
```

## What happens

- `Message` → shows feedback to the user  
- `State(this)` → sends the updated ViewModel state to the frontend  

Both are processed in the same request.

---

## Mental model

An action can:

- mutate state  
- return UI effects  
- return updated state  

All of these can be combined in a single response.
