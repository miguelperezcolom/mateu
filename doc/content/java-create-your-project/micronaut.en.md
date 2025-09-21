---
title: "Micronaut"
weight: 6
---

## Step 1: Have a Micronaut project

Obviously you need a valid Micronaut project. If you do not have it already, you should create it from IntelliJ.

## Step 2: Add Mateu dependencies

In case you are using maven:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>micronaut-core</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
  <!-- you need the one below if you want to also serve the static content -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
<!--
available artifacts are: redhat-lit, sapui5-lit, redwood-lit and  vaadin-lit 
-->
    <version>{{< java-artifact-version >}}</version>
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
                        <version>{{< java-artifact-version >}}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build> 
```

Or, in case you are using Gradle:

```kotlin
    implementation("io.mateu:micronaut-core:{{< java-artifact-version >}}")
    implementation("io.mateu:vaadin-lit:{{< java-artifact-version >}}")
    annotationProcessor("io.mateu:annotation-processor-micronaut:{{< java-artifact-version >}}")
```

## Step 3: Add some configuration

And add the following annotations to your application:

```java
@Introspected(packages = "io.mateu.dtos")
@SerdeImport(packageName = "io.mateu.dtos")
@Import(packages = {
        "io.mateu",
        "io.mateu.core.application",
        "io.mateu.core.application.getui",
        "io.mateu.core.application.createjourney",
        "io.mateu.core.application.runaction",
        "io.mateu.core.domain",
        "io.mateu.core.domain.fragmentmapper",
        "io.mateu.core.domain.reflection"
},
        annotated = "*")
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
```

Also, in case you added the frontend dependency, in the application.properties file you need to add the following properties:

```properties
micronaut.router.static-resources.assets.mapping=/**
micronaut.router.static-resources.assets.paths=classpath\:static
```


## Step 4: Create your Mateu UI

Nothing special is required. Just annotate your class with `@MateuUI`:

```java

package com.example.demo;

import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;

@MateuUI("")
public class HelloWorld {

}

```

When you run you spring boot application, you will find your ui at [http:localhost:8080](http:localhost:8080) (for the code above) as expected:


<p align="center"><img src="../../../images/helloworld.png?raw=true" width="600"/></p>
