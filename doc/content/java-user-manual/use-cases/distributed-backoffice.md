---
title: "Distributed backoffice"
weight: 3
---

# Distributed backoffice with Mateu

Build a single UI composed of multiple microservices.

Each service defines its own UI.  
A central shell integrates everything.

---

## 💡 The idea

Instead of:

- one frontend
- one team owning everything
- duplicated models across services

You get:

👉 each microservice owns its UI  
👉 the shell composes them into one app  

---

## 🧱 Architecture

```
+----------------------+
|      Shell UI        |
|----------------------|
| Users | Orders | ... |
+----------+-----------+
           |
   ---------------------
   |         |         |
Users UI  Orders UI  Products UI
(service) (service)   (service)
```

---

## 🖥️ 1. The shell

The shell defines navigation and integrates remote UIs.

```java
@UI("")
@PageTitle("Backoffice")
public class ShellHome {

  RemoteMenu users = new RemoteMenu(
    "Users",
    "http://localhost:8081",
    "/users"
  );

  RemoteMenu products = new RemoteMenu(
    "Products",
    "http://localhost:8082",
    "/products"
  );

}
```

---

## 🧠 What this does

- creates a navigation menu
- each entry points to a remote UI
- Mateu loads and integrates them automatically

👉 No frontend composition needed

---

## 🧩 2. A microservice UI

Each service defines its own UI.

Example: `users-service`

```java
@UI("/users")
public class Users extends AutoCrudOrchestrator<User> {

  @Override
  public AutoCrudAdapter<User> simpleAdapter() {
    return new UsersAdapter();
  }

}
```

---

## 🚀 3. Run everything

Start:

- shell → `localhost:8080`
- users-service → `localhost:8081`
- products-service → `localhost:8082`

Open:

```
http://localhost:8080
```

---

## ⚡ Result

You get:

- one unified UI
- navigation across services
- independent deployment per service

---

## 🔥 Why this matters

In a traditional architecture:

- frontend must integrate all services
- teams must coordinate UI changes
- models are duplicated across layers

With Mateu:

👉 each service defines its own UI  
👉 no frontend integration layer  
👉 no duplicated models  

---

## 🧠 Ownership model

| Concern        | Owner              |
|----------------|-------------------|
| UI of users    | users-service     |
| UI of products | products-service  |
| navigation     | shell             |
| security       | shell             |

---

## 🏢 Real-world version

In a real setup, the shell can also define:

```java
@KeycloakSecured
@Logo("/logo.png")
@FavIcon("/favicon.ico")
```

And services can still define their own UI independently.

---

## 🔌 Advanced: embedded UIs

You can also embed parts of UIs:

```java
MicroFrontend dashboard = new MicroFrontend(
  "http://localhost:8081/dashboard"
);
```

---

## 🎯 When to use this

This pattern is ideal for:

- microservices architectures
- large teams
- domain-driven design (bounded contexts)
- backoffice platforms

---

## 🧠 Mental model

- each service = UI + logic
- shell = composition + navigation
- no frontend layer needed

---

## Next

👉 Embedded UI example
