---
title: "Helidon MP"
weight: 10
---

## Step 1: Have an Helidon MP web project

Obviously you need a valid Helidon MP project. If you do not have it already, you should create it from IntelliJ or go to https://helidon.io/docs/v4/mp/guides/overview and follow the instructions.

## Step 2: Add Mateu dependencies

In case you are using maven:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-helidon</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>helidon-core</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
<!-- you need the one below if you want to also serve the static content -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
```

Or, in case you are using Gradle:

```kotlin
    annotationProcessor("io.mateu:annotation-processor-helidon:{{< java-artifact-version >}}")
    implementation("io.mateu:helidon-core:{{< java-artifact-version >}}")
    implementation("io.mateu:vaadin-lit:{{< java-artifact-version >}}")
```



## Step 3: Create your Mateu UI

Nothing special is required. Just annotate your class with `@MateuUI`:

```java

package com.example.demo;

import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;

@MateuUI("")
public class HelloWorld {

}

```

When you run you spring mvc application, you will find your ui at [http:localhost:8080](http:localhost:8080) (for the code above) as expected:


<p align="center"><img src="../../../images/helloworld.png?raw=true" width="600"/></p>

## Troubleshooting

In case you are using a maven project and you are setting custom annotation processor paths (e.g. because you are using mapstruct) you must add the annotation processor from Mateu, in your pom.xml:

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source> <!-- depending on your project -->
                    <target>1.8</target> <!-- depending on your project -->
                    <annotationProcessorPaths>
                        <path> <!-- when using mapstruct -->
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${org.mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>io.mateu</groupId>
                            <artifactId>annotation-processor-helidon</artifactId>
                            <version>{{< java-artifact-version >}}</version>
                        </path>
                        <!-- other annotation processors -->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

