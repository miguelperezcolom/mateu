# Mateu starters

The smallest complete Mateu app on each supported runtime: **one `@UI` class**, a CRUD over a
`Product` record backed by an in-memory store. Copy one directory out of the repository and it builds
on its own — nothing is inherited from this folder.

| Starter | Runtime | Run | Open |
|---|---|---|---|
| [`spring-mvc`](spring-mvc) | Spring Boot 4 (MVC), Java 21 | `mvn spring-boot:run` | http://localhost:8080 |
| [`spring-webflux`](spring-webflux) | Spring Boot 4 (WebFlux), Java 21 | `mvn spring-boot:run` | http://localhost:8080 |
| [`quarkus`](quarkus) | Quarkus 3, Java 21 | `mvn quarkus:dev` | http://localhost:8080 |
| [`micronaut`](micronaut) | Micronaut 4, Java 21 | `mvn mn:run` | http://localhost:8080 |
| [`helidon-mp`](helidon-mp) | Helidon MP 4, Java 21 | `mvn package && java -jar target/mateu-starter-helidon-mp.jar` | http://localhost:8080 |
| [`dotnet`](dotnet) | ASP.NET Core 8 (C#) | `dotnet run` | sync API on http://localhost:8080 |
| [`python`](python) | FastAPI (Python 3.11+) | `PYTHONPATH=../../backend/python uvicorn main:app --port 8080` | sync API on http://localhost:8080 |

The Java starters are the [quickstart](https://mateu.io/java-user-manual/start-here/quickstart/)
of the documentation, file for file.

## Which Mateu version

The Java starters depend on the **latest release on Maven Central** through the `mateu.version`
property. To try them against your local checkout of this repository:

```bash
cd backend && mvn install -DskipTests          # installs 0.0.1-MATEU into your local repository
cd ../starters && mvn package -Dmateu.version=0.0.1-MATEU
```

The .NET and Python starters build against the sources in `backend/dotnet` and `backend/python`.

## What CI checks

`.github/workflows/starters.yml` compiles every Java starter against the reactor build, boots each
one (`smoke-test.sh`) and checks the CRUD answers on the Mateu action endpoint; it also builds the
.NET starter and runs the Python starter's test. A starter that stops compiling fails the PR.

## The three files that matter

- `Product.java` — the model: a record with bean-validation annotations, `Identifiable`.
- `ProductStore.java` — the `CrudStore<Product>`: where the data lives (swap it for your database).
- `Products.java` — the UI: `@UI("") class Products extends AutoCrud<Product>` + `store()`.

And in the `pom.xml`, the one thing people get wrong: the Mateu **annotation processor** in
`maven-compiler-plugin`'s `annotationProcessorPaths`, next to Lombok's. Without it nothing is
generated and every route answers 404.
