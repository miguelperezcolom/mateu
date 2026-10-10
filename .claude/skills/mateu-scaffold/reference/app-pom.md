# App pom (Spring Boot MVC)

Two flavors. The **single-module** flavor has the `@UI` classes in the app itself. The
**consuming** flavor depends on a separate UI module ([ui-module-pom.md](ui-module-pom.md)).

## Common parts (both flavors)

- Parent: `spring-boot-starter-parent` 4.0.x, Java 21.
- Web starter `spring-boot-starter-webmvc`, Lombok (the generated controllers use it).
- Mateu runtime + renderer: `io.mateu:mateu-mvc` + `io.mateu:mateu-vaadin`.
- `spring-boot-maven-plugin` with Lombok excluded.

## Flavor A — single-module app (`@UI` in the app)

Annotation processor path needs **lombok + `mateu-annotation-processor-mvc`** only (the `@UI`
classes are local sources). Model on `starters/spring-mvc/pom.xml` (compiled and booted by CI).

```xml
<properties>
  <java.version>21</java.version>
  <mateu.version><!-- latest release on Maven Central --></mateu.version>
</properties>

<dependencies>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webmvc</artifactId></dependency>

  <dependency><groupId>io.mateu</groupId><artifactId>mateu-mvc</artifactId><version>${mateu.version}</version></dependency>
  <dependency><groupId>io.mateu</groupId><artifactId>mateu-vaadin</artifactId><version>${mateu.version}</version></dependency>

  <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <annotationProcessorPaths>
          <path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></path>
          <path><groupId>io.mateu</groupId><artifactId>mateu-annotation-processor-mvc</artifactId><version>${mateu.version}</version></path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <configuration>
        <excludes><exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude></excludes>
      </configuration>
    </plugin>
  </plugins>
</build>
```

## Flavor B — app consuming a UI module

Add the UI module as a **regular dependency** AND on `annotationProcessorPaths` (the golden
rule). Model on `e2e/sut/apps/mvc-app1/pom.xml`.

```xml
<dependencies>
  <!-- the framework-agnostic UI module -->
  <dependency><groupId>com.yourco</groupId><artifactId>myapp-ui</artifactId><version>1.0.0-SNAPSHOT</version></dependency>

  <dependency><groupId>io.mateu</groupId><artifactId>mateu-mvc</artifactId><version>${mateu.version}</version></dependency>
  <dependency><groupId>io.mateu</groupId><artifactId>mateu-vaadin</artifactId><version>${mateu.version}</version></dependency>

  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webmvc</artifactId></dependency>
  <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <configuration>
        <excludes><exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude></excludes>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <annotationProcessorPaths>
          <path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></path>
          <path><groupId>io.mateu</groupId><artifactId>mateu-annotation-processor-mvc</artifactId><version>${mateu.version}</version></path>
          <!-- REQUIRED: the UI module on the AP classpath so its index is read -->
          <path><groupId>com.yourco</groupId><artifactId>myapp-ui</artifactId><version>1.0.0-SNAPSHOT</version></path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
  </plugins>
</build>
```

Add one `<path>` per additional UI module the app consumes.

> Tip: `mvc-app1` splits the compiler config into explicit `default-compile` and
> `default-testCompile` executions with the same `annotationProcessorPaths`. A single
> top-level `<configuration>` also works; use the split form if test compilation needs the
> processors too.
