---
title: Examples
---

# Examples

## Counter

```java
@UI("")
public class Counter {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

---

## Form

```java
@UI("")
public class PersonForm {

  String name;
  int age;

  @Button
  Runnable save = () -> {
    // persist data
  };

}
```

---

## Table

```java
@UI("")
public class Users {

  List<User> users = userService.findAll();

}
```

---

## CRUD

You define:

- fields
- actions

Mateu generates:

- forms
- validation
- interactions

---

More examples coming soon.
