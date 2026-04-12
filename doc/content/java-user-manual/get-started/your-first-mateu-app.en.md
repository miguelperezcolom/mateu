---
title: "Your first Mateu app with Spring Boot"
weight: 2
aliases:
  - /java-user-manual/your-first-mateu-app/
---

# Your first Mateu app with Spring Boot

This tutorial is a slower introduction than the quickstart.

If you want to build something real first, go to the [Quickstart](/java-user-manual/get-started/quickstart/).

## 1. Create a UI class

```java
@UI("")
@Title("My first Mateu app")
public class Home {
}
```

Run your app and open:

```text
http://localhost:8080
```

## 2. Add state

```java
String name;
```

Mateu renders a form field automatically.

## 3. Add validation

```java
@NotEmpty
String name;
```

## 4. Add an action

```java
@Button
public Message greet() {
  return new Message("Hello " + name);
}
```

## 5. What happened?

You defined:

- UI
- state
- validation
- behavior

Mateu handled rendering and browser interaction.

## Next

- [Quickstart](/java-user-manual/get-started/quickstart/)
- [State, actions and fields](/java-user-manual/core-concepts/state-actions-and-fields/)
