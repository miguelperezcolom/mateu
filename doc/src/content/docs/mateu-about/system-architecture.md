---
title: "Mateu and system architecture"
---

The UI is an inbound adapter. This is the central architectural idea in Mateu, and it has practical consequences for how you structure your application.

## Inbound adapters

In hexagonal architecture, inbound adapters are the entry points into your application:

```text
Infrastructure / inbound
  -> REST controllers
  -> gRPC endpoints
  -> message consumers
  -> scheduled jobs
  -> UI  <-- Mateu belongs here
```

Each adapter translates an external signal into a call to the application core. A REST controller translates an HTTP request. Mateu translates a browser interaction.

This means a Mateu ViewModel can call:

- application use cases directly
- query services
- ports and gateways
- domain services

without any additional API layer in between. The UI is a first-class consumer of the application core, not a downstream client of a REST API.

## What this removes

Traditional internal tools are built with an API in the middle:

```text
Backend -> REST API -> API client -> Frontend model -> Browser
```

That API exists primarily because the frontend is a separate application. When the UI is an inbound adapter, the API between frontend and backend becomes unnecessary for the internal UI. The ViewModel calls the application core directly.

```text
Backend -> Mateu ViewModel (inbound adapter) -> Browser
```

The REST API still exists for external consumers. It is not replaced. It is just no longer the only way for the UI to talk to the backend.

## Domain alignment

Mateu works well with DDD because ViewModels map naturally to domain concepts.

A `ProductEditor` ViewModel calls `SaveProductUseCase`. It does not call a generic `/api/products` endpoint that was designed to serve any consumer. It calls the specific use case that represents the intent.

```java
@Override
public void save(HttpRequest request) {
    saveProductUseCase.handle(
        new SaveProductCommand(id, name, price, status)
    );
}
```

This keeps the ViewModel aligned with the domain, not with a REST contract.

## CQRS alignment

For listings, Mateu connects naturally to query services.

```java
@Override
public ListingData<ProductRow> search(String searchText, ProductFilters filters, Pageable pageable) {
    return productQueryService.findAll(searchText, filters, pageable);
}
```

The list view calls the query side. The edit form calls the command side. The split is clean and explicit.

## Where validation lives

Validation belongs in the domain — in value objects, aggregates, and use cases. Mateu enforces Bean Validation constraints in the browser as a user experience feature, but the authoritative enforcement happens in the application core. The ViewModel does not duplicate validation logic; it delegates to it.

## Microservices

In a distributed system, each service can own its own Mateu UI. Services expose their UI through `@UI` roots. A shell application composes them using `RemoteMenu`.

```java
@UI("/admin")
public class ShellRoot {

    @Menu
    RemoteMenu orders = new RemoteMenu("/_orders-service");

    @Menu
    RemoteMenu products = new RemoteMenu("/_products-service");
}
```

The shell does not know the internal structure of each service's UI. It only knows the remote URL. The service controls what it exposes.

## Summary

| Concern | Owner |
|---|---|
| Domain logic | domain layer (aggregates, value objects) |
| Use cases | application layer |
| Data access | repositories and query services |
| UI definition | Mateu ViewModel (inbound adapter) |
| Rendering | Mateu renderer |

## Next

- [Architecture](/mateu-about/architecture) — how the Mateu system is structured internally
- [Why Mateu](/mateu-about/why-mateu) — what you gain from this approach
- [Mateu in microservices](/mateu-about/microservices) — service-owned UIs and federation
