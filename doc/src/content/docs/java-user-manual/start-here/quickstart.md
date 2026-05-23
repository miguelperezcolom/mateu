---
title: "Quickstart"
---

Build a complete admin panel in minutes.

No frontend required.

## What you'll build

- product list
- create / edit forms
- validation
- status badges
- delete confirmation

## 1. Add Mateu to your project

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mvc-core</artifactId>
  <version>0.0.1-MATEU</version>
</dependency>

<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>annotation-processor-mvc</artifactId>
  <version>0.0.1-MATEU</version>
</dependency>
```

## 2. Define your model

```java
enum ProductStatus {
  Available, OutOfStock
}

record Product(
  @NotEmpty String id,
  @NotEmpty String name,
  @NotNull ProductStatus status
) implements Identifiable {}
```

## 3. Connect Mateu to your data

```java
class ProductAdapter extends AutoCrudAdapter<Product> {
  @Override
  public CrudRepository<Product> repository() {
    return new ProductRepository();
  }
}
```

## 4. Create the UI

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {
  @Override
  public AutoCrudAdapter<Product> simpleAdapter() {
    return new ProductAdapter();
  }
}
```

## 5. Run

```bash
mvn spring-boot:run
```

Open `http://localhost:8080/products`

## Result

![Products list](/images/docs/admin-panel/products-list.jpeg)

## Multi-module setup

If your `@UI` classes live in a separate Java library module (not in the same module as the
Spring Boot app), you also need to add `annotation-processor-indexer` to that library so
Mateu can discover its UI classes across the module boundary:

```xml
<!-- in the library module's pom.xml -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-indexer</artifactId>
    <version>${mateu.version}</version>
    <scope>provided</scope>
</dependency>
```

And add the library to `<annotationProcessorPaths>` in the app module.

See [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) for the
full setup.

## Next

- [Admin panel](/java-user-manual/use-cases/admin-panel/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
