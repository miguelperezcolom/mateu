---
title: "Springboot MVC"
---

## Step 1: Have a Spring Boot web project

You need a valid Spring Boot project with **Web (MVC)** enabled. If you do not have one, create it
from IntelliJ or from [Spring Boot Initializr](https://start.spring.io/) selecting the **Spring Web**
dependency. Use **Java 21** and **Spring Boot 4.x**.

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
    <artifactId>mateu-mvc</artifactId>
</dependency>
<!-- serves the built-in frontend; choose one: mateu-vaadin (Vaadin), mateu-redwood (Oracle Redwood / Visual Builder) -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-vaadin</artifactId>
</dependency>
```

> The annotation processor (`mateu-annotation-processor-mvc`) goes on the **annotation processor path only** — never as a
> regular `<dependency>`: it is a compile-time code generator, and as a dependency it would ship its
> own libraries (FreeMarker, Guava) inside your application. Its jar declares itself to Gradle as an
> incremental (aggregating) processor.

Or, with Gradle:

```kotlin
implementation(platform("io.mateu:mateu-bom:MATEU_VERSION"))
annotationProcessor(platform("io.mateu:mateu-bom:MATEU_VERSION"))
implementation("io.mateu:mateu-mvc")
implementation("io.mateu:mateu-vaadin")
annotationProcessor("io.mateu:mateu-annotation-processor-mvc")
```

See [Configuration properties](/java-create-your-project/configuration/) for what you can tune —
notably cross-origin access (off unless you list the origins) and the MCP endpoint (off unless enabled).

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
                                <artifactId>mateu-annotation-processor-mvc</artifactId>
                                <version>MATEU_VERSION</version>
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
                                <artifactId>mateu-annotation-processor-mvc</artifactId>
                                <version>MATEU_VERSION</version>
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

An empty class renders an empty page. For a complete project on this runtime — a model, a store and
a full CRUD, with this exact build setup — copy the [`starters/spring-mvc`](https://github.com/miguelperezcolom/mateu/tree/master/starters/spring-mvc) project; CI
compiles and boots it on every change.

---

## Multi-module projects

If your `@UI` classes live in a **separate library module** (not in the same Maven module as the
Spring Boot app), you need a two-part setup so Mateu can discover them across the module boundary.

### UI library module

The library module that contains your `@UI` classes must depend on `mateu-uidl` and run
`mateu-annotation-processor-indexer` at compile time. This processor writes an index of all `@UI` classes
into the JAR so that the app module can find them later.

```xml
<properties>
    <mateu.version>MATEU_VERSION</mateu.version>
</properties>

<dependencies>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>mateu-uidl</artifactId>
        <version>${mateu.version}</version>
    </dependency>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>mateu-annotation-processor-indexer</artifactId>
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
                        <artifactId>mateu-annotation-processor-indexer</artifactId>
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
processor path**. The second entry lets `mateu-annotation-processor-mvc` read the index that was baked
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
        <artifactId>mateu-mvc</artifactId>
        <version>${mateu.version}</version>
    </dependency>
    <dependency>
        <groupId>io.mateu</groupId>
        <artifactId>mateu-vaadin</artifactId>
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
                                <artifactId>mateu-annotation-processor-mvc</artifactId>
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
                                <artifactId>mateu-annotation-processor-mvc</artifactId>
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
