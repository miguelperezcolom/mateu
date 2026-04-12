---
title: "Distributed backoffice"
weight: 3
---

# Distributed backoffice with Mateu

Build a single UI composed of multiple microservices.

Each service defines its own UI.  
A central shell integrates everything.

---

## Login and shell

![Login](/images/docs/distributed/distributed-login.jpeg)

![Home](/images/docs/distributed/distributed-home.jpeg)

---

## Composed navigation

![Users menu](/images/docs/distributed/distributed-users-menu.jpeg)

![Content menu](/images/docs/distributed/distributed-content-menu.jpeg)

![Control plane menu](/images/docs/distributed/distributed-control-plane-menu.jpeg)

![Workflow menu](/images/docs/distributed/distributed-workflow-menu.jpeg)

![Forms menu](/images/docs/distributed/distributed-forms-menu.jpeg)

---

## Example modules

![Users CRUD](/images/docs/distributed/distributed-users-crud.jpeg)

![Content CRUD](/images/docs/distributed/distributed-content-sample-crud.jpeg)

![Control plane view](/images/docs/distributed/distributed-control-plane-sample-view.jpeg)

![Forms CRUD](/images/docs/distributed/distributed-forms-sample-crud.jpeg)

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
