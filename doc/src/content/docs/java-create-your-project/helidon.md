---
title: "Helidon MP"
---

## Step 1: Have a Helidon MP project

You need a valid Helidon MicroProfile project. Create one from IntelliJ or from the [Helidon project starter](https://helidon.io/starter). A starter project already gives you the Helidon MP parent, the `helidon-microprofile-core` bundle, a `META-INF/beans.xml`, and a Jandex index — Mateu builds on top of that.

## Step 2: Add Mateu dependencies

Import Mateu's BOM once, so no Mateu artifact needs a version of its own:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.mateu</groupId>
            <artifactId>mateu-bom</artifactId>
            <version>MATEU_VERSION</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Then the runtime dependencies:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-helidon-mp</artifactId>
</dependency>
<!-- serves the built-in frontend; choose one: mateu-vaadin (Vaadin), mateu-redwood (Oracle Redwood / Visual Builder) -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-vaadin</artifactId>
</dependency>
<!-- REQUIRED: use Jackson (not JSON-B) for JAX-RS bodies. Mateu's wire model relies on
     Jackson @JsonTypeInfo "type" discriminators; Helidon's default JSON-B (Yasson) drops
     them and the frontend renders empty components. -->
<dependency>
    <groupId>org.glassfish.jersey.media</groupId>
    <artifactId>jersey-media-json-jackson</artifactId>
    <scope>runtime</scope>
</dependency>
```

`mateu-helidon-mp` already contributes the `MateuService` CDI bean, a Jackson `ContextResolver<ObjectMapper>`, the request/bean-provider glue and the routes for CORS, asset caching, the client error log and MCP, so your application needs no Mateu wiring code. Its Helidon dependencies are `provided`: the Helidon version is the one of your application (it is built and tested against Helidon 4.5).

> The annotation processor (`mateu-annotation-processor-helidon-mp`) goes on the **annotation processor path only** — never as a
> regular `<dependency>`: it is a compile-time code generator, and as a dependency it would ship its
> own libraries (FreeMarker, Guava) inside your application. Its jar declares itself to Gradle as an
> incremental (aggregating) processor.

See [Configuration properties](/java-create-your-project/configuration/) for what you can tune —
notably cross-origin access (off unless you list the origins) and the MCP endpoint (off unless enabled).

## Step 3: Configure the annotation processor

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <parameters>true</parameters>
                <annotationProcessorPaths>
                    <path>
                        <groupId>io.mateu</groupId>
                        <artifactId>mateu-annotation-processor-helidon-mp</artifactId>
                        <version>MATEU_VERSION</version>
                    </path>
                    <!-- If your @UI classes live in a SEPARATE module, add that module here too
                         (compiled with the indexer AP) so its route registrations are read. -->
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Step 4: Serve the frontend assets

The frontend jar bundles its assets under `/static/assets/*` on the classpath and expects them at `/assets/*`. Map them in `src/main/resources/META-INF/microprofile-config.properties`:

```properties
# Serve the bundled Mateu frontend. Mount it under /assets ONLY — a context of "/"
# would shadow every JAX-RS route (the static handler is terminal).
server.static.classpath.context=/assets
server.static.classpath.location=/static/assets
```

Make sure `src/main/resources/META-INF/beans.xml` exists (a Helidon starter includes one) so Weld/Jersey discover the generated controllers:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="https://jakarta.ee/xml/ns/jakartaee"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                           https://jakarta.ee/xml/ns/jakartaee/beans_4_0.xsd"
       version="4.0"
       bean-discovery-mode="annotated">
</beans>
```

## Step 5: Create your Mateu UI

```java
package com.example;

import io.mateu.uidl.annotations.UI;

@UI("")
public class HelloWorld {
}
```

## Step 6: Run

```bash
mvn helidon:dev
```

Open `http://localhost:8080` in your browser.

---

## Next

- [Prerequisites](/java-create-your-project/prerequisites/)
- [Spring Boot MVC setup](/java-create-your-project/springboot-mvc/)
- [Quickstart](/java-user-manual/start-here/quickstart/)
