---
title: "Create your project"
weight: 2
---

## Step 1: Have an Spring Boot web project

Obviously you need a valid spring boot project, with **Reactive Web** (Webflux) enabled. If you do not have it already, you should create it from IntelliJ or go to [Spring Boot Initializr](https://start.spring.io/) and create a new project with the **Reactive Web** dependency.

**As per today only Spring boot 3 is supported.**

## Step 2: Add Mateu dependency

In case you are using maven:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>embedded-front</artifactId>
    <version>3.0-alpha.90</version>
</dependency>
```

Or, in case you are using Gradle:

```kotlin
    implementation("io.mateu:embedded-front:3.0-alpha.90")
    annotationProcessor("io.mateu:annotation-processing:3.0-alpha.90")
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


<p align="center"><img src="../../images/helloworld.png?raw=true" width="600"/></p>

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
                            <artifactId>annotation-processing</artifactId>
                            <version>3.0-alpha.90</version>
                        </path>
                        <!-- other annotation processors -->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
```
