---
title: "Compose a shell with multiple services"
weight: 3
---

# Compose a shell with multiple services

In this tutorial, you'll build a Mateu shell that aggregates UIs from multiple services.

## Goal

- one shell app
- multiple microservices exposing UIs
- unified navigation via RemoteMenu

---

## 1. Create the shell UI

```java
@UI("")
@Title("Console")
public class ShellHome {

  @Menu
  RemoteMenu users = new RemoteMenu("/_users");

  @Menu
  RemoteMenu roles = new RemoteMenu("/_roles");

}
```

---

## 2. Expose UI from a service

```java
@UI("/_users")
@Title("Users")
public class UsersHome {
}
```

Each service exposes its own UI root.

---

## 3. Run services

- shell → localhost:8080  
- users → localhost:8081  
- roles → localhost:8082  

---

## 4. What happens

- shell builds menu
- each menu entry loads remote UI
- navigation is unified

---

## 5. Why this matters

- no frontend integration layer
- each service owns its UI
- shell composes everything

---

## Next

You now have a distributed UI system.
