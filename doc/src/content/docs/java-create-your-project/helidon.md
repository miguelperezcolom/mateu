---
title: "Helidon MP"
---

## Step 1: Have a Helidon MP project

You need a valid Helidon MicroProfile project. Create one from IntelliJ or from the [Helidon project starter](https://helidon.io/starter).

## Step 2: Add Mateu dependencies

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>helidon-mp-core</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
<!-- serves the built-in frontend; choose one: vaadin-lit, redhat-lit, sapui5-lit -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

## Step 3: Configure the annotation processor

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <annotationProcessorPaths>
                    <path>
                        <groupId>io.mateu</groupId>
                        <artifactId>annotation-processor-helidon-mp</artifactId>
                        <version>MATEU_VERSION</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Step 4: Create your Mateu UI

```java
package com.example;

import io.mateu.uidl.annotations.UI;

@UI("")
public class HelloWorld {
}
```

## Step 5: Run

```bash
mvn helidon:dev
```

Open `http://localhost:8080` in your browser.

---

## Next

- [Prerequisites](/java-create-your-project/prerequisites/)
- [Spring Boot MVC setup](/java-create-your-project/springboot-mvc/)
- [Quickstart](/java-user-manual/start-here/quickstart/)
