---
title: "Quarkus"
---

## Step 1: Have a Quarkus project

Obviously you need a valid Quarkus project.

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
    <artifactId>mateu-quarkus</artifactId>
</dependency>
<!-- serves the built-in frontend; choose one: mateu-vaadin (Vaadin), mateu-redwood (Oracle Redwood / Visual Builder) -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-vaadin</artifactId>
</dependency>
<!-- the Mateu wire is Jackson: mateu-quarkus uses Quarkus REST with Jackson, and declares both
     `provided` so the versions are the ones of YOUR Quarkus platform -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-jackson</artifactId>
</dependency>
```

And the annotation processor, on the processor path:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <!-- list Lombok, MapStruct… here too if you use them -->
            <path>
                <groupId>io.mateu</groupId>
                <artifactId>mateu-annotation-processor-quarkus</artifactId>
                <version>MATEU_VERSION</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

> The annotation processor (`mateu-annotation-processor-quarkus`) goes on the **annotation processor path only** — never as a
> regular `<dependency>`: it is a compile-time code generator, and as a dependency it would ship its
> own libraries (FreeMarker, Guava) inside your application. Its jar declares itself to Gradle as an
> incremental (aggregating) processor.

Or, with Gradle:

```kotlin
implementation(platform("io.mateu:mateu-bom:MATEU_VERSION"))
annotationProcessor(platform("io.mateu:mateu-bom:MATEU_VERSION"))
implementation("io.mateu:mateu-quarkus")
implementation("io.mateu:mateu-vaadin")
annotationProcessor("io.mateu:mateu-annotation-processor-quarkus")
implementation("io.quarkus:quarkus-rest-jackson")
```

> **Upgrading from `v3.0-alpha.406` or older:** `mateu-quarkus` no longer brings
> `quarkus-resteasy-reactive-jackson` and `quarkus-spring-di` along (they came in at fixed, mismatched
> versions). Declare `quarkus-rest-jackson` as above. Mateu itself no longer needs Spring-DI support;
> add `quarkus-spring-di` yourself only if YOUR beans use Spring annotations or are `@Named` without a
> scope.

See [Configuration properties](/java-create-your-project/configuration/) for what you can tune —
notably cross-origin access (off unless you list the origins) and the MCP endpoint (off unless enabled).

## Step 3: Create your Mateu UI

Nothing special is required. Just annotate your class with `@UI`:

```java

package com.example.demo;

import io.mateu.uidl.annotations.UI;

@UI("")
public class HelloWorld {

}

```

When you run your Quarkus application, you will find your ui at [http://localhost:8080](http://localhost:8080) (for the code above) as expected:


An empty class renders an empty page. For a complete project on this runtime — a model, a store and
a full CRUD, with this exact build setup — copy the [`starters/quarkus`](https://github.com/miguelperezcolom/mateu/tree/master/starters/quarkus) project; CI
compiles and boots it on every change.

## Troubleshooting

In case you are using a maven project and you are setting custom annotation processor paths (e.g. because you are using mapstruct) you must add the annotation processor from Mateu, in your pom.xml:

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>21</source>
                    <target>21</target>
                    <annotationProcessorPaths>
                        <path> <!-- when using mapstruct -->
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${org.mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>io.mateu</groupId>
                            <artifactId>mateu-annotation-processor-quarkus</artifactId>
                            <version>MATEU_VERSION</version>
                        </path>
                        <!-- other annotation processors -->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
```
