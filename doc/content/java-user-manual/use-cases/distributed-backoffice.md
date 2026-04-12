---
title: "Distributed backoffice"
weight: 3
---

# Distributed backoffice with Mateu

Build a single UI composed of multiple microservices.

Each service defines its own UI.  
A central shell integrates everything.

---

## What this case teaches

- how a shell composes remote UIs
- how different domains can keep UI ownership
- how Mateu removes the frontend integration layer in distributed systems

---

## Why this matters

In a traditional architecture:

- a central frontend must integrate all services
- teams coordinate changes across multiple layers
- models often get duplicated between service and frontend

With Mateu:

- each service can expose its own UI
- the shell composes them into one application
- ownership follows bounded contexts more naturally

---

## Login and shell

Authentication can be handled centrally in the shell.

![Login](/images/docs/distributed/distributed-login.jpeg)

After login, users enter a single unified backoffice.

![Home](/images/docs/distributed/distributed-home.jpeg)

---

## Composed navigation

The shell exposes one navigation system, but each section can come from a different service.

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

---

## Example modules

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

---

## Who owns what?

| Concern | Owner |
|---|---|
| Users UI | users-service |
| Content UI | content-service |
| Workflow UI | workflow-service |
| Forms UI | forms-service |
| Navigation | shell |
| Security | shell |

---

## Mental model

- each service = UI + logic
- shell = composition + navigation
- one application experience, multiple service owners

---

## Next

- 👉 [Application shell in Mateu](/java-user-manual/application-shell)
- 👉 [Embedded UI](/java-user-manual/use-cases/embedded-ui)
