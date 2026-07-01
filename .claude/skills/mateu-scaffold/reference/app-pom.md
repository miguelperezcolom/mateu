# App pom (Spring Boot MVC)

Two flavors. The **single-module** flavor has the `@UI` classes in the app itself. The
**consuming** flavor depends on a separate UI module ([ui-module-pom.md](ui-module-pom.md)).

## Common parts (both flavors)

- Parent: `spring-boot-starter-parent` (samples use 3.5.x / 4.0.x).
- Web starter (`spring-boot-starter-web` or `-webmvc`), Lombok (optional).
- Mateu runtime + renderer: `io.mateu:mvc-core` + `io.mateu:vaadin-lit`.
- `spring-boot-maven-plugin` with Lombok excluded.

## Flavor A — single-module app (`@UI` in the app)

Annotation processor path needs **lombok + `annotation-processor-mvc`** only (the `@UI`
classes are local sources). Model on `demo/demo-vaadin-mvc/pom.xml`.

```xml
<dependencies>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>

  <dependency><groupId>io.mateu</groupId><artifactId>mvc-core</artifactId><version>0.0.1-MATEU</version></dependency>
  <dependency><groupId>io.mateu</groupId><artifactId>vaadin-lit</artifactId><version>0.0.1-MATEU</version></dependency>

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
          <path><groupId>io.mateu</groupId><artifactId>annotation-processor-mvc</artifactId><version>0.0.1-MATEU</version></path>
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

  <dependency><groupId>io.mateu</groupId><artifactId>mvc-core</artifactId><version>${mateu.version}</version></dependency>
  <dependency><groupId>io.mateu</groupId><artifactId>vaadin-lit</artifactId><version>${mateu.version}</version></dependency>

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
          <path><groupId>io.mateu</groupId><artifactId>annotation-processor-mvc</artifactId><version>${mateu.version}</version></path>
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
