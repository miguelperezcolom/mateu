---
title: "Micronaut"
---

## Step 1: Have a Micronaut project

Obviously you need a valid Micronaut project. If you do not have it already, you should create it from IntelliJ.

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
    <artifactId>micronaut-core</artifactId>
</dependency>
<!-- serves the built-in frontend; choose one: vaadin-lit (Vaadin), redwood (Oracle Redwood / Visual Builder) -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
</dependency>
```

And the annotation processor, on the processor path (appended to the Micronaut ones):

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths combine.children="append">
            <!-- list Lombok, MapStruct… here too if you use them -->
            <path>
                <groupId>io.mateu</groupId>
                <artifactId>annotation-processor-micronaut</artifactId>
                <version>MATEU_VERSION</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

> The annotation processor (`annotation-processor-micronaut`) goes on the **annotation processor path only** — never as a
> regular `<dependency>`: it is a compile-time code generator, and as a dependency it would ship its
> own libraries (FreeMarker, Guava) inside your application. Its jar declares itself to Gradle as an
> incremental (aggregating) processor.

Or, with Gradle:

```kotlin
implementation(platform("io.mateu:mateu-bom:MATEU_VERSION"))
annotationProcessor(platform("io.mateu:mateu-bom:MATEU_VERSION"))
implementation("io.mateu:micronaut-core")
implementation("io.mateu:vaadin-lit")
annotationProcessor("io.mateu:annotation-processor-micronaut")
```

See [Configuration properties](/java-create-your-project/configuration/) for what you can tune —
notably cross-origin access (off unless you list the origins) and the MCP endpoint (off unless enabled).

## Step 3: Create your Mateu UI

Nothing special is required. Your application class stays as usual:

```java
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
```

Mateu's beans, bean introspections and JSON serialization ship inside the `micronaut-core` jar and are
discovered from the classpath, and static content is served by micronaut's default static resources,
so no annotations nor extra configuration properties are needed.

Just annotate your class with `@UI`:

```java

package com.example.demo;

import io.mateu.uidl.annotations.UI;

@UI("")
public class HelloWorld {

}

```

When you run your micronaut application, you will find your ui at [http://localhost:8080](http://localhost:8080) (for the code above) as expected:


An empty class renders an empty page. For a complete project on this runtime — a model, a store and
a full CRUD, with this exact build setup — copy the [`starters/micronaut`](https://github.com/miguelperezcolom/mateu/tree/master/starters/micronaut) project; CI
compiles and boots it on every change.
