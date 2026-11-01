---
title: "Quickstart"
description: "A complete Mateu app on Spring Boot — app shell, home page and CRUD — in eight files: copy, paste, run."
---

A complete small app — an **app shell** with a menu, a **home page** and a **CRUD** (listing with
search, create, detail, edit, delete and validation) — from one record and three small classes. No
frontend code.

This page is the [`starters/spring-mvc`](https://github.com/miguelperezcolom/mateu/tree/master/starters/spring-mvc)
project of the repository, file for file; CI compiles and boots it on every change, so what you
paste here builds. Prefer to clone? Copy that directory and run `mvn spring-boot:run`.

You need **Java 21** and **Maven 3.9+**.

:::tip[Generate it instead]
This exact project is one click away: **File › New › Project… › Mateu** in IntelliJ, **Mateu: New
Project…** in VS Code, or `mvn archetype:generate -DarchetypeGroupId=io.mateu
-DarchetypeArtifactId=mateu-archetype -DarchetypeVersion=<release> -DgroupId=com.example
-DartifactId=my-app` — with your package, the latest Mateu release and an `AGENTS.md`/`CLAUDE.md`
for AI assistants. See [Create your project](/java-create-your-project/). Prefer no code at all?
[Quickstart: YAML only](/define/yaml/quickstart/).
:::

:::caution[The archetype needs a JDK 21–25]
Maven's archetype plugin runs a Groovy script that cannot read newer class files: on JDK 26+ it
fails with *"BUG! exception in phase 'semantic analysis' … Unsupported class file major version
70"* and leaves a half-generated folder (`variants/`, `generator/`). Delete that folder and rerun
with `JAVA_HOME` pointing at a JDK 21–25. The IDE wizards have no such limit.
:::

![The home page the quickstart builds](/images/docs/first-app/starter-home.png)

## The project

```
my-app/
├── pom.xml
└── src/main/
    ├── java/com/example/app/
    │   ├── Application.java
    │   ├── Shell.java
    │   ├── Home.java
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
        <version>4.1.1</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>mateu-starter-spring-mvc</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>mateu-starter-spring-mvc</name>
    <description>Minimal Mateu app on Spring Boot (MVC): an app shell, a home page and a CRUD over a record.</description>

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
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * The model, declared once. Mateu derives the listing columns, the form fields and the validation
 * (from the bean-validation annotations) from it. {@link Identifiable} marks the {@code id} field;
 * {@link EditableOnlyWhenCreating} lets you type it on "New" and keeps it read-only afterwards;
 * {@code @Stereotype(money)} shows the price as an amount ("89.50", in the app's locale).
 */
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) @Stereotype(FieldStereotype.money) double price,
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

## 4. The UI — `Shell.java`, `Home.java` and `Products.java`

The **app shell** is the one `@UI` class: mounted at the root, it puts the title and the menu around
every screen. Each `@Menu` field is a menu entry leading to that screen; `HomeRouteSupplier` names
the one the app opens on.

```java
package com.example.app;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The app shell, mounted at the app root: the title and the menu around every screen. Each {@code
 * @Menu} field is a menu entry leading to that screen's route; {@link HomeRouteSupplier} names the
 * one the app opens on.
 */
@UI("")
@Title("My app")
public class Shell implements HomeRouteSupplier {

  @Menu Home home;

  @Menu Products products;

  @Override
  public String homeRoute() {
    return "home";
  }
}
```

The **home page** is a `Welcome`: a hero with a title and an intro, `Button` fields as its calls
to action and `@Panel` fields as tiles. The button runs the `@Action` method named by its id, and
returning a `URI` navigates — here, to the products.

```java
package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Text;
import java.net.URI;

/**
 * The home page, a {@link Welcome}: a hero with a title and an intro, {@link Button} fields as its
 * calls to action and {@code @Panel} fields as tiles below. A button runs the {@code @Action} method
 * named by its id; returning a {@link URI} navigates there. Reached through its menu entry in
 * {@link Shell}, which also makes it the page the app opens on.
 */
public class Home extends Welcome {

  Button browseProducts =
      Button.builder()
          .label("Browse products")
          .actionId("browseProducts")
          .buttonStyle(ButtonStyle.primary)
          .build();

  @Panel(title = "Products")
  Text products =
      new Text("Search, create, edit and delete products: a whole CRUD derived from one record.");

  @Panel(title = "Your next screen")
  Text next = new Text("Write a class for it and add a @Menu field of that class to Shell.");

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Override
  protected String heroSubtitle() {
    return "Every screen here is declared in Java; Mateu renders it.";
  }

  @Action
  URI browseProducts() {
    return URI.create("/products");
  }
}
```

The **CRUD** is a class that extends `AutoCrud` and names its store. It needs no `@UI` of its own:
its menu entry in `Shell` gives it the route `/products`.

```java
package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * A view that IS a CRUD over {@link Product}, reached through its menu entry (a {@code @Menu} field of the Java shell, or a
 * {@code routes.yaml} binding + {@code app.yaml} entry when the shell is YAML):
 * {@code /products} is the listing, {@code /products/new} the create form, {@code /products/{id}}
 * the detail and {@code /products/{id}/edit} the editor — all derived. The only code is naming the
 * store.
 */
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Override
  public CrudStore<Product> store() {
    return ProductStore.INSTANCE;
  }
}
```

`store()` is the only thing an `AutoCrud` must provide.

![The Products CRUD](/images/docs/first-app/starter-products.png)

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

Open [http://localhost:8080](http://localhost:8080): the home page above. **Browse products** (or the
**Products** menu entry) opens the listing. Click a row for the detail view, **Edit** for the form,
**New** to create — the id is editable only when creating, and `name` and `status` are required on
both sides (browser and server):

![The generated edit form](/images/docs/first-app/starter-product-edit.png)

## Not seeing it?

| Symptom | Cause |
|---|---|
| Every URL answers 404 / "Not found", and the log says *"Mateu found no UI to serve"* | the annotation processor did not run: check `annotationProcessorPaths` (and that no other processor list replaced it), then `mvn clean compile` |
| Build fails: *"@UI("") on … uses the same path as …"* | two `@UI` classes declare the same path: give one another path, or make it an inner route in `specs/ui/routes.yaml` |
| Build fails: *"type argument Product is not within bounds of type-variable T"* | the record must `implement Identifiable` (it marks the `id` the CRUD reads and writes by) |
| Build fails: *"… does not override abstract method store()"* | an `AutoCrud` must return its `CrudStore` from `store()` |
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
