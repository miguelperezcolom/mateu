---
title: "Lookups backed by query services"
---

`@Lookup` fields let users search and select a related entity. The options and labels can come from any source — a query service, a remote API, or an in-memory list — without coupling the ViewModel to the domain.

---

## The pattern

```java
@Lookup(
        search = ProductOptionsSupplier.class,
        label  = ProductLabelSupplier.class
)
String productId;
```

- `search` — a class that returns a list of `Option` objects given a search string
- `label` — a class that resolves a stored id to a display label

---

## Options supplier (search)

```java
@Service
public class ProductOptionsSupplier implements LookupOptionsSupplier {

    private final ProductQueryService productQueryService;

    public ProductOptionsSupplier(ProductQueryService productQueryService) {
        this.productQueryService = productQueryService;
    }

    @Override
    public List<Option> getOptions(String search, HttpRequest httpRequest) {
        return productQueryService.search(search, 20)
                .stream()
                .map(dto -> new Option(dto.id(), dto.name()))
                .toList();
    }
}
```

`Option(value, label)` — the `value` is stored in the field; the `label` is what users see.

---

## Label supplier (resolve stored id)

```java
@Service
public class ProductLabelSupplier implements LookupLabelSupplier {

    private final ProductQueryService productQueryService;

    public ProductLabelSupplier(ProductQueryService productQueryService) {
        this.productQueryService = productQueryService;
    }

    @Override
    public String getLabel(String value, HttpRequest httpRequest) {
        return productQueryService.findById(value)
                .map(ProductDto::name)
                .orElse(value);
    }
}
```

This is called when an existing record is loaded to show the label of the stored id.

---

## Remote lookup

The options supplier can call a remote service:

```java
@Service
public class RemoteProductOptionsSupplier implements LookupOptionsSupplier {

    private final ProductApiClient productApiClient;

    @Override
    public List<Option> getOptions(String search, HttpRequest httpRequest) {
        String jwt = httpRequest.getHeaderValue("Authorization");
        return productApiClient.search(search, jwt)
                .stream()
                .map(dto -> new Option(dto.id(), dto.name()))
                .toList();
    }
}
```

The `HttpRequest` provides access to request headers (including the JWT) so the options supplier can forward authentication.

---

## Bubble (nested lookup)

For lookups inside nested list fields, add `bubble = true` to forward the parent's context:

```java
@Lookup(
        search = ComponentOptionsSupplier.class,
        label  = ComponentLabelSupplier.class,
        bubble = true
)
String componentId;
```

---

## Why query services instead of repositories

| Approach | Problem |
|---|---|
| Inject JPA repository | ViewModel couples to persistence; cannot use non-JPA sources |
| Query service interface | Decoupled; implementation can be JPA, Elasticsearch, HTTP, in-memory |

The options and label suppliers are Spring beans, so they can inject any service. The ViewModel that uses `@Lookup` never sees the data source.

---

## Next

- [Users CRUD use case](/java-user-manual/use-cases/users-crud/)
- [Admin panel](/java-user-manual/use-cases/admin-panel/)
- [Query services and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/)
