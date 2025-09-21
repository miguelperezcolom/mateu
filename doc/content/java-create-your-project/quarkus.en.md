---
title: "Quarkus"
weight: 8
---

## Step 1: Have a Quarkus project

Obviously you need a valid Quarkus project.

## Step 2: Add Mateu dependencies

In case you are using maven:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>quarkus-core</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-quarkus</artifactId>
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

Or, in case you are using Gradle:

```kotlin
    implementation("io.mateu:quarkus-core:{{< java-artifact-version >}}")
    implementation("io.mateu:vaadin-lit:{{< java-artifact-version >}}")
    annotationProcessor("io.mateu:annotation-processor-quarkus:{{< java-artifact-version >}}")
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

When you run you spring boot application, you will find your ui at [http:localhost:8080](http:localhost:8080) (for the code above) as expected:


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
                            <artifactId>annotation-processor-quarkus</artifactId>
                            <version>{{< java-artifact-version >}}</version>
                        </path>
                        <!-- other annotation processors -->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
```
