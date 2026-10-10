---
title: "Quickstart"
description: "A complete Mateu CRUD app on Spring Boot in six files — copy, paste, run."
---

A complete admin screen — listing with search, create, detail, edit, delete and validation — from
**one record and one class**. No frontend code.

This page is the [`starters/spring-mvc`](https://github.com/miguelperezcolom/mateu/tree/master/starters/spring-mvc)
project of the repository, file for file; CI compiles and boots it on every change, so what you
paste here builds. Prefer to clone? Copy that directory and run `mvn spring-boot:run`.

You need **Java 21** and **Maven 3.9+**.

![The Products CRUD the quickstart builds](/images/docs/first-app/starter-products.png)

## The project

```
my-app/
├── pom.xml
└── src/main/
    ├── java/com/example/app/
    │   ├── Application.java
    │   ├── Product.java
    │   ├── ProductStatus.java
    │   ├── ProductStore.java
    │   └── Products.java
    └── resources/application.properties
```

## 1. `pom.xml`

The part people get wrong is the **annotation processor**: Mateu generates one Spring MVC controller
per `@UI` class at compile time, so `mateu-annotation-processor-mvc` must be in
`maven-compiler-plugin`'s `annotationProcessorPaths` — next to Lombok, because once that list is
set nothing else on the classpath runs as a processor.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>mateu-starter-spring-mvc</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>mateu-starter-spring-mvc</name>
    <description>Minimal Mateu app on Spring Boot (MVC): one @UI class, a CRUD over a record.</description>

    <properties>
        <java.version>21</java.version>
        <mateu.version>MATEU_VERSION</mateu.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>

        <!-- Mateu runtime for Spring MVC -->
        <dependency>
            <groupId>io.mateu</groupId>
            <artifactId>mateu-mvc</artifactId>
            <version>${mateu.version}</version>
        </dependency>
        <!-- The web renderer (served as static assets by the app) -->
        <dependency>
            <groupId>io.mateu</groupId>
            <artifactId>mateu-vaadin</artifactId>
            <version>${mateu.version}</version>
        </dependency>
        <!-- The generated controllers use Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <!-- REQUIRED: the Mateu annotation processor generates one Spring MVC controller
                         per @UI class. List every processor you use here (Lombok too): once
                         annotationProcessorPaths is set, nothing else on the classpath runs. -->
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>${lombok.version}</version>
                        </path>
                        <path>
                            <groupId>io.mateu</groupId>
                            <artifactId>mateu-annotation-processor-mvc</artifactId>
                            <version>${mateu.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 2. The model — `Product.java` and `ProductStatus.java`

The record is the single source of truth: columns, form fields and validation come from it.

```java
package com.example.app;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * The model, declared once. Mateu derives the listing columns, the form fields and the validation
 * (from the bean-validation annotations) from it. {@link Identifiable} marks the {@code id} field;
 * {@link EditableOnlyWhenCreating} lets you type it on "New" and keeps it read-only afterwards.
 */
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) double price,
    @NotNull ProductStatus status)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New product";
  }
}
```

```java
package com.example.app;

/** A small enum renders as a choice in the form and as text in the listing. */
public enum ProductStatus {
  Available,
  OutOfStock,
  Discontinued
}
```

## 3. The data — `ProductStore.java`

`CrudStore<T>` is the data-access port the CRUD reads and writes through. Four methods; searching,
filtering, sorting and paging have in-memory defaults (override `find(...)` to push them to a
database).

```java
package com.example.app;

import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The data-access port the CRUD reads and writes through. Here it is an in-memory map; in a real
 * app it talks to your database (override {@code find(searchText, filters, pageable)} to push
 * search, sorting and paging down to it).
 *
 * <p>One shared instance: the view model is created fresh on every request, so the data has to
 * live somewhere that outlives it.
 */
public class ProductStore implements CrudStore<Product> {

  public static final ProductStore INSTANCE = new ProductStore();

  private final Map<String, Product> db = new ConcurrentHashMap<>();

  private ProductStore() {
    save(new Product("P-001", "Espresso machine", 249.0, ProductStatus.Available));
    save(new Product("P-002", "Coffee grinder", 89.5, ProductStatus.Available));
    save(new Product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock));
    save(new Product("P-004", "Pour-over kettle", 59.0, ProductStatus.Discontinued));
  }

  @Override
  public Optional<Product> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Product product) {
    db.put(product.id(), product);
    return product.id();
  }

  @Override
  public List<Product> findAll() {
    return db.values().stream().sorted((a, b) -> a.id().compareTo(b.id())).toList();
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }
}
```

## 4. The UI — `Products.java`

```java
package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * The whole UI: a routed view that IS a CRUD over {@link Product}, mounted at the app root. {@code
 * /} is the listing, {@code /new} the create form, {@code /{id}} the detail and {@code /{id}/edit}
 * the editor — all derived. The only code is naming the store.
 */
@UI("")
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Override
  public CrudStore<Product> store() {
    return ProductStore.INSTANCE;
  }
}
```

`store()` is the only thing an `AutoCrud` must provide.

## 5. `Application.java` and `application.properties`

```java
package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Scans only this package: Mateu's own beans come with its adapter jar (an auto-configuration),
 * so there is no need — and no reason — to scan {@code io.mateu}.
 */
@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```

```properties
server.port=8080
spring.application.name=mateu-starter
```

## 6. Run

```bash
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080): the listing above. Click a row for the detail
view, **Edit** for the form, **New** to create — the id is editable only when creating, and `name` and
`status` are required on both sides (browser and server):

![The generated edit form](/images/docs/first-app/starter-product-edit.png)

## Not seeing it?

| Symptom | Cause |
|---|---|
| Every URL answers 404 / "Not found" | the annotation processor did not run: check `annotationProcessorPaths` (and that no other processor list replaced it) |
| Blank page, no errors | the renderer dependency (`mateu-vaadin`) is missing |
| Compiles, but your class is not used | the `@UI` class is outside the packages `@SpringBootApplication` scans |

## Other runtimes

The same app, on each supported runtime, lives next to this one under
[`starters/`](https://github.com/miguelperezcolom/mateu/tree/master/starters): Spring WebFlux,
Quarkus, Micronaut, Helidon MP — only `pom.xml`, the main class and the config file change — plus
a [C#](https://github.com/miguelperezcolom/mateu/tree/master/starters/dotnet) and a
[Python](https://github.com/miguelperezcolom/mateu/tree/master/starters/python) version.

## Multi-module setup

If your `@UI` classes live in a separate library module (not in the Spring Boot app's module), that
library also needs `mateu-annotation-processor-indexer`, and the app lists the library in its
`annotationProcessorPaths` — see [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/).

## Next

- [Your first app, explained](/java-user-manual/start-here/first-app/)
- [Admin panel](/java-user-manual/use-cases/admin-panel/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
