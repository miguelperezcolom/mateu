---
title: "Micronaut"
---

## Step 1: Have a Micronaut project

Obviously you need a valid Micronaut project. If you do not have it already, you should create it from IntelliJ.

## Step 2: Add Mateu dependencies

In case you are using maven:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>micronaut-core</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
  <!-- you need the one below if you want to also serve the static content -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
<!--
available artifacts are: redhat-lit, sapui5-lit, redwood-oj-lit and  vaadin-lit 
-->
    <version>MATEU_VERSION</version>
</dependency>

```

You also need to add the annotation processor:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <annotationProcessorPaths combine.children="append">
                    <path>
                        <groupId>io.mateu</groupId>
                        <artifactId>annotation-processor-micronaut</artifactId>
                        <version>MATEU_VERSION</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build> 
```

Or, in case you are using Gradle:

```kotlin
    implementation("io.mateu:micronaut-core:MATEU_VERSION")
    implementation("io.mateu:vaadin-lit:MATEU_VERSION")
    annotationProcessor("io.mateu:annotation-processor-micronaut:MATEU_VERSION")
```

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


<p align="center"><img src="../../../images/helloworld.png?raw=true" width="600"/></p>
