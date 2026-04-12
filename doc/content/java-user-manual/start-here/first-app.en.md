---
title: "First app"
weight: 2
aliases:
  - /java-user-manual/get-started/your-first-mateu-app/
  - /java-user-manual/your-first-mateu-app/
---

# First app

This tutorial is a slower introduction than the quickstart.

If you want to build something real first, go to the [Quickstart](/java-user-manual/start-here/quickstart/).

## 1. Create a UI class

```java
@UI("")
@Title("My first Mateu app")
public class Home {
}
```

## 2. Add state

```java
String name;
```

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
