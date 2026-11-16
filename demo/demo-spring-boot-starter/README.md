# demo-spring-boot-starter

The smallest Mateu application on Spring Boot, set up the way a start.spring.io project is:

- **one dependency**: `io.mateu:mateu-spring-boot-starter` (Spring MVC + Mateu's MVC runtime + the
  Vaadin web renderer);
- **one annotation processor**: `io.mateu:mateu-annotation-processor-mvc`, on the processor path
  like Lombok;
- **no Spring version** anywhere but the Spring Boot parent / plugin.

`Home.java` is the whole UI. Build and run it with either tool:

```bash
mvn spring-boot:run          # http://localhost:8089
gradle bootRun               # same app, build.gradle
```

It tracks `master` (`0.0.1-MATEU`): build the backend first (`cd backend && mvn install
-DskipTests`), or pass a release that contains the starter (`-Dmateu.version=…` /
`-PmateuVersion=…`). CI (`.github/workflows/examples.yml`, "Spring Boot compatibility") builds and
tests it with Maven and Gradle on every change and checks that every Spring Boot artifact it
resolves is the parent's version.
