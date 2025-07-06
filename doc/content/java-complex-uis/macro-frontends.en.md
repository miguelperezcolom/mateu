---
title: "Macro frontends"
weight: 13
---

As Mateu UIs are described using just plain java we can just leverage Maven dependencies to split our UIs in simple java modules which we can later add as dependencies in any project.

Just as simple as that.

This is the `pom.xml` file that you would typically write to define a module containing UI classes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.mateu</groupId>
    <artifactId>demo-app-definition</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>


    <dependencies>
        <dependency>
            <groupId>io.mateu</groupId>
            <artifactId>core</artifactId>
            <version>0.0.1-MATEU</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webflux</artifactId>
            <version>6.2.1</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.2.1</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>jakarta.annotation</groupId>
            <artifactId>jakarta.annotation-api</artifactId>
            <version>3.0.0</version>
            <scope>provided</scope>
        </dependency>

    </dependencies>

</project>
```

While this would be what you would write to add the dependency to another module/project:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <!-- ... -->


    <dependencies>

        <!-- ... -->

        <dependency>
            <groupId>io.mateu</groupId>
            <artifactId>demo-app-definition</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>

    <!-- ... -->
</project>

```

So you can just use the Maven dependency mechanism for building modular UIs. Obviously the same applies to any Gradle project.



