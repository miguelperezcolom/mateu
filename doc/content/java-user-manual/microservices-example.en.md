---
title: "Microservices example"
weight: 8
---

# Microservices example

Mateu allows each microservice to define and expose its own UI.

## Example

```java
@UI("/_users")
public class UsersHome {

    @Menu
    UsersMenu users;
}
```

```java
public class UsersMenu {

    @Menu
    UsersCrud users;

    @Menu
    RolesCrud roles;
}
```

## What this shows

- services own their UI
- UI is not centralized
- no duplicated frontend layer

## Key idea

Backend ownership = UI ownership
