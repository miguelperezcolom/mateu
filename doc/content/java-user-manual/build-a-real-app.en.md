---
title: "Build a real app"
weight: 22
---

# Build a real app

This tutorial shows how to build a real backoffice application with Mateu and Spring Boot.

We will model a small admin application with:

- users
- roles
- permissions
- relationships
- navigation
- feedback in the browser

The goal is not to show every feature.

The goal is to show the **default way to build a real app** with Mateu.

---

## Navigation after actions

Actions can also navigate directly by returning a `URI`.

```java
@Route("/home")
public class Home {

    @SneakyThrows
    @Button
    URI adminUser() {
        return new URI("/users/admin?version=2772");
    }

}
```

This is useful for:

- redirect after create
- send user to detail page
- jump to filtered or versioned routes

---

## Summary

A real Mateu application usually consists of:

- one application model
- multiple view models
- CRUD orchestrators
- adapters
- query services
- use cases
- suppliers for relationships
- browser feedback through UI effects
- navigation through menus, routes or returned `URI`

This is what Mateu is for.

---

## Next step

👉 [Compose a shell with multiple services →](/java-user-manual/shell-and-federation-tutorial)
