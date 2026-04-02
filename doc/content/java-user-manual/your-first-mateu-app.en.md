---
title: "Your first Mateu app with Spring Boot"
weight: 1
---

# Your first Mateu app with Spring Boot

In this tutorial, you'll build your first Mateu UI using Spring Boot.

By the end, you'll have:

- a running application
- a working UI
- a form with validation
- a button with behavior
- user feedback in the browser

---

## 1. Create a Spring Boot project

Create a standard Spring Boot project.

Minimal dependencies:

- Spring Web
- Mateu dependencies

---

## 2. Create your first UI

```java
@UI("")
@Title("My first Mateu app")
public class Home {
}
```

Run your app and open:

http://localhost:8080

---

## 3. Add state

```java
String name;
```

Mateu renders a form field automatically.

---

## 4. Add validation

```java
@NotEmpty
String name;
```

Validation runs in the browser.

---

## 5. Add an action

```java
@Button
public void greet() {
}
```

---

## 6. Return feedback

```java
@Button
public Message greet() {
  return new Message("Hello " + name);
}
```

---

## 7. Layout

```java
@FormLayout(columns = 2)
public class Home {
  @NotEmpty
  String name;
}
```

---

## 8. Toolbar action

```java
@Toolbar
public Message reset() {
  name = null;
  return new Message("Reset");
}
```

---

## 9. What happened

You defined:

- UI
- state
- validation
- actions
- feedback

Mateu handled everything else.

---

## 10. Next

Continue with:

Build a real CRUD
