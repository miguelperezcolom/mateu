---
title: "Execution model"
---

Mateu follows a fully stateless execution model. Every request is self-contained and reproducible.

## Lifecycle per request

For each request:

1. Determine the ViewModel type from the route
2. Instantiate the ViewModel
3. Hydrate it with path parameters, query parameters, and form state sent by the browser
4. Execute the requested action (if any)
5. Serialize the result
6. Return the HTTP response
7. Discard the ViewModel

```mermaid
flowchart TD
    A[HTTP request] --> B[Determine ViewModel type]
    B --> C[Instantiate ViewModel]
    C --> D[Hydrate with request data\npath params · query params · state]
    D --> E[Execute action]
    E --> F[Serialize result]
    F --> G[HTTP response]
    G --> H[ViewModel discarded]
```

## No server-side state

There is no persistent UI state between requests.

The browser holds the form state. On each interaction, it sends the current state to the server. The server hydrates a fresh ViewModel with that state, runs the action, and returns the result.

This means:

- you cannot store UI state in instance fields across requests
- there are no sessions to replicate
- any two server instances produce identical results for the same request

## What this enables

- Horizontal scalability with no constraints — any instance can handle any request
- No session management or replication infrastructure
- Resilience to restarts and pod replacements
- Consistent behavior across environments (local, staging, production)

## Spring beans and services

ViewModels are instantiated by Mateu, not by Spring, but they can still inject services:

```java
@UI("/products/new")
public class NewProductForm {

    @Autowired
    ProductRepository productRepository;

    @NotBlank
    String name;

    @Button
    public Message save() {
        productRepository.save(name);
        return new Message("Saved");
    }

}
```

Because the ViewModel is discarded after each response, injected beans are only used within that single request.

### Registering the ViewModel as a bean: use prototype scope

You can also register the ViewModel itself as a container-managed bean, for example to use
constructor injection. If you do, it **must** be prototype-scoped:

```java
@Component
@Scope("prototype")
@Route("/products/new")
public class NewProductForm {

    private final ProductRepository productRepository;

    @NotBlank
    String name;

    public NewProductForm(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

:::caution
A **singleton** ViewModel breaks the stateless model: its mutable form fields are shared by
every user and request, so one user's half-typed form leaks into another user's screen.
Either leave the class unannotated (Mateu instantiates it per request and still injects
`@Autowired` fields), or make the bean `@Scope("prototype")`.

Stateless classes are fine as singletons — e.g. a CRUD orchestrator (`AutoCrud` subclass)
whose only fields are `final` injected services.
:::

## Mental model

Think of Mateu as:

> UI = pure function (request state → response)

No hidden lifecycle. No long-lived server objects. No shared mutable state.

---

## Next

- [ViewModel lifecycle](/java-user-manual/concepts/viewmodel-lifecycle/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
