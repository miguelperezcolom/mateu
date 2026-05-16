---
title: "Springboot MVC"
weight: 2
---

## Step 1: Have a Spring Boot web project

You need a valid Spring Boot project with **Web (MVC)** enabled. If you do not have one, create it
from IntelliJ or from [Spring Boot Initializr](https://start.spring.io/) selecting the **Spring Web**
dependency. Use **Java 21** and **Spring Boot 4.x**.

## Step 2: Add Mateu dependencies

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mvc-core</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-mvc</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
<!-- serves the built-in frontend (web components); choose one: vaadin-lit, redhat-lit, sapui5-lit -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
    <version>{{< java-artifact-version >}}</version>
</dependency>
```

Or, if you are using Gradle:

```kotlin
annotationProcessor("io.mateu:annotation-processor-mvc:{{< java-artifact-version >}}")
implementation("io.mateu:mvc-core:{{< java-artifact-version >}}")
implementation("io.mateu:vaadin-lit:{{< java-artifact-version >}}")
```

## Step 3: Configure the annotation processor

Mateu uses a Java annotation processor to generate Spring MVC controllers from your `@UI` classes.
You must explicitly register it in the `maven-compiler-plugin` so that Maven uses it.

This is especially important if you also use **Lombok** — both processors must be listed together,
otherwise whichever is missing will stop working.

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
            <executions>
                <execution>
                    <id>default-compile</id>
                    <phase>compile</phase>
                    <goals><goal>compile</goal></goals>
                    <configuration>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                            </path>
                            <path>
                                <groupId>io.mateu</groupId>
                                <artifactId>annotation-processor-mvc</artifactId>
                                <version>{{< java-artifact-version >}}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </execution>
                <execution>
                    <id>default-testCompile</id>
                    <phase>test-compile</phase>
                    <goals><goal>testCompile</goal></goals>
                    <configuration>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                            </path>
                            <path>
                                <groupId>io.mateu</groupId>
                                <artifactId>annotation-processor-mvc</artifactId>
                                <version>{{< java-artifact-version >}}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

> If you are not using Lombok you can remove that `<path>` block. If you are using other
> annotation processors (e.g. MapStruct) add them to the list as well.

## Step 4: Create your Mateu UI

Annotate a class with `@UI` to define a screen:

```java
package com.example.demo;

import io.mateu.uidl.annotations.UI;

@UI("")
public class HelloWorld {
}
```

`@UI("")` registers this class as the root UI, served at `http://localhost:8080`.
Use `@UI("/path")` to serve it at a specific sub-path.

## Step 5: Run

```bash
mvn spring-boot:run
```

Open `http://localhost:8080` in your browser.

<p align="center"><img src="../../../images/helloworld.png?raw=true" width="600"/></p>

---

## Multi-module projects

If your `@UI` classes live in a **separate library module** (not in the same Maven module as the
Spring Boot app), you need a two-part setup so Mateu can discover them across the module boundary.

### UI library module

The library module that contains your `@UI` classes must depend on `uidl` and run
`annotation-processor-indexer` at compile time. This processor writes an index of all `@UI` classes
into the JAR so that the app module can find them later.

```xml
<properties>
    <mateu.version>{{< java-artifact-version >}}</mateu.version>
</properties>

<dependencies>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>uidl</artifactId>
        <version>${mateu.version}</version>
    </dependency>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>annotation-processor-indexer</artifactId>
        <version>${mateu.version}</version>
        <scope>provided</scope>
    </dependency>
    <!-- optional: Lombok, jakarta.validation-api … -->
</dependencies>

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
                    <!-- add Lombok here too if you use it -->
                    <path>
                        <groupId>io.mateu</groupId>
                        <artifactId>annotation-processor-indexer</artifactId>
                        <version>${mateu.version}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Spring Boot app module

The app module must list the UI library JAR **both as a regular dependency and as an annotation
processor path**. The second entry lets `annotation-processor-mvc` read the index that was baked
into the JAR and generate the Spring MVC controllers.

```xml
<dependencies>
    <!-- UI definitions library -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-ui-module</artifactId>
        <version>${project.version}</version>
    </dependency>
    <!-- Mateu MVC runtime + frontend -->
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>mvc-core</artifactId>
        <version>${mateu.version}</version>
    </dependency>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>vaadin-lit</artifactId>
        <version>${mateu.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <executions>
                <execution>
                    <id>default-compile</id>
                    <phase>compile</phase>
                    <goals><goal>compile</goal></goals>
                    <configuration>
                        <annotationProcessorPaths>
                            <!-- add Lombok here too if you use it -->
                            <path>
                                <groupId>io.mateu</groupId>
                                <artifactId>annotation-processor-mvc</artifactId>
                                <version>${mateu.version}</version>
                            </path>
                            <!-- the UI library JAR must be on the processor path -->
                            <path>
                                <groupId>com.example</groupId>
                                <artifactId>my-ui-module</artifactId>
                                <version>${project.version}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </execution>
                <execution>
                    <id>default-testCompile</id>
                    <phase>test-compile</phase>
                    <goals><goal>testCompile</goal></goals>
                    <configuration>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>io.mateu</groupId>
                                <artifactId>annotation-processor-mvc</artifactId>
                                <version>${mateu.version}</version>
                            </path>
                            <path>
                                <groupId>com.example</groupId>
                                <artifactId>my-ui-module</artifactId>
                                <version>${project.version}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

Also make sure `@SpringBootApplication` scans both the Mateu framework packages and your UI package:

```java
@SpringBootApplication(scanBasePackages = {"io.mateu", "com.example.myui"})
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

> For a full worked example see
> [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/#shared-ui-library-single-deployable).
