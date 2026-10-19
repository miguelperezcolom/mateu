---
title: "Lookups backed by query services"
---

`@Lookup` fields let users search and select a related entity. The options and labels come from supplier beans — query services, remote APIs, or in-memory lists — without coupling the ViewModel to any particular data source.

**Prerequisite:** lookups are part of the read side. The same query-service pattern used for [listings and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/) applies here.

---

## The pattern

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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
    public ListingData<Option> search(
            String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(productQueryService.search(searchText, pageable.size())
                .stream()
                .map(dto -> new Option(dto.id(), dto.name()))
                .toList());
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
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return productQueryService.findById((String) id)
                .map(ProductDto::name)
                .orElse(String.valueOf(id));
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
    public ListingData<Option> search(
            String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        String jwt = httpRequest.getHeaderValue("Authorization");
        return ListingData.of(productApiClient.search(searchText, jwt)
                .stream()
                .map(dto -> new Option(dto.id(), dto.name()))
                .toList());
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

- [Query services and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/) — the same pattern applied to listing rows
- [Mateu in hexagonal architecture](/java-user-manual/real-world/mateu-in-hexagonal-architecture/) — where supplier beans fit in the architecture
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — how `@Lookup` appears in CRUD editors
