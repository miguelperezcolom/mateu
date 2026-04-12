---
title: "Distributed backoffice"
weight: 2
---

# Distributed backoffice

Build one UI from multiple microservices.

Each service owns its own UI.  
A shell composes everything into one application.

---

## Why this case matters

This is one of Mateu's most distinctive strengths.

Instead of building:

- a central frontend that integrates every service
- duplicated models across backend and frontend
- coordination-heavy UI ownership

you can let each service define its own UI and contribute it to a shared shell.

That gives you:

- clearer ownership by bounded context
- less frontend integration work
- one unified experience for the user

For the architectural background, see:
- [UI federation →](/mateu-about/ui-federation)
- [Shell and remote menus →](/mateu-about/shell-and-remote-menus)
- [Mateu in microservices →](/mateu-about/microservices)

---

## What this case teaches

- shell composition
- distributed UI ownership
- centralized navigation with decentralized modules
- no traditional frontend integration layer

---

## 1. Login and shell

Authentication can be handled centrally in the shell.

![Login](/images/docs/distributed/distributed-login.jpeg)

After login, users enter a single unified backoffice.

![Home](/images/docs/distributed/distributed-home.jpeg)

The important point is not just the styling.

It is that the user experiences **one application**, even though different parts come from different services.

---

## 2. Navigation across services

The shell exposes a single navigation system, but each section can come from a different service.

### Users menu

![Users menu](/images/docs/distributed/distributed-users-menu.jpeg)

### Content menu

![Content menu](/images/docs/distributed/distributed-content-menu.jpeg)

### Control plane menu

![Control plane menu](/images/docs/distributed/distributed-control-plane-menu.jpeg)

### Workflow menu

![Workflow menu](/images/docs/distributed/distributed-workflow-menu.jpeg)

### Forms menu

![Forms menu](/images/docs/distributed/distributed-forms-menu.jpeg)

This is the key architectural point:

- the shell owns the composition
- each domain owns its own UI module

---

## 3. Example modules

Each module is owned by a different service but rendered inside the same shell.

### Users module

![Users CRUD](/images/docs/distributed/distributed-users-crud.jpeg)

### Content module

![Content CRUD](/images/docs/distributed/distributed-content-sample-crud.jpeg)

### Control plane module

![Control plane view](/images/docs/distributed/distributed-control-plane-sample-view.jpeg)

### Forms module

![Forms CRUD](/images/docs/distributed/distributed-forms-sample-crud.jpeg)

### Workflow module

![Workflow CRUD](/images/docs/distributed/distributed-workflow-sample-crud.jpeg)

These screenshots matter because they show the actual outcome:

- one shell
- many domains
- consistent user experience
- independent module ownership

---

## Minimal shell example

```java
@UI("")
@PageTitle("Backoffice")
public class ShellHome {

  RemoteMenu users = new RemoteMenu("Users", "http://localhost:8081", "/users");
  RemoteMenu content = new RemoteMenu("Content", "http://localhost:8082", "/content");

}
```

The shell defines the entry points and composes remote modules.

---

## Minimal service example

```java
@UI("/users")
public class Users extends AutoCrudOrchestrator<User> {

  @Override
  public AutoCrudAdapter<User> simpleAdapter() {
    return new UsersAdapter();
  }

}
```

Each service exposes its own UI in the same way it would expose its own business logic.

---

## Ownership model

| Concern | Owner |
|---|---|
| Users UI | users-service |
| Content UI | content-service |
| Workflow UI | workflow-service |
| Forms UI | forms-service |
| Navigation | shell |
| Security | shell |

This is one of the best ways to explain the benefit to a team.

Mateu lets UI ownership follow service ownership.

---

## Mental model

- each service = UI + logic
- shell = composition + navigation
- user sees one app
- organization keeps multiple owners

---

## When to use this

This pattern is a strong fit for:

- microservices architectures
- large teams
- bounded contexts
- enterprise backoffices
- platforms where different domains evolve independently

---

## Next

- [Application shell in Mateu](/java-user-manual/build/application-shell/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
