# UI module pom (framework-agnostic `@UI` classes)

A plain jar that depends **only** on `io.mateu:uidl` and runs the **indexer** AP. No
Spring / Quarkus / framework dependency. On build it writes `META-INF/mateu/ui-registrations`
(and `route-registrations`) into the jar so consuming apps can generate controllers without
the sources.

Model on `e2e/sut/modules/sample1/pom.xml`.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.yourco</groupId>
  <artifactId>myapp-ui</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>jar</packaging>

  <properties>
    <java.version>21</java.version>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <mateu.version>0.0.1-MATEU</mateu.version>
  </properties>

  <dependencies>
    <!-- the ONLY Mateu dependency needed to write @UI classes -->
    <dependency>
      <groupId>io.mateu</groupId>
      <artifactId>uidl</artifactId>
      <version>${mateu.version}</version>
    </dependency>

    <!-- indexer: also on annotationProcessorPaths below -->
    <dependency>
      <groupId>io.mateu</groupId>
      <artifactId>annotation-processor-indexer</artifactId>
      <version>${mateu.version}</version>
      <scope>provided</scope>
    </dependency>

    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <version>1.18.40</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>jakarta.validation</groupId>
      <artifactId>jakarta.validation-api</artifactId>
      <version>3.1.0</version>
      <scope>provided</scope>
    </dependency>
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
            <path>
              <groupId>org.projectlombok</groupId>
              <artifactId>lombok</artifactId>
              <version>1.18.40</version>
            </path>
            <!-- THIS is what writes META-INF/mateu/ui-registrations -->
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
</project>
```

Confirm the index was written after `mvn install`:

```bash
unzip -p target/myapp-ui-1.0.0-SNAPSHOT.jar META-INF/mateu/ui-registrations
```

You should see one `class=…` block per `@UI` class. If the file is missing, the indexer
was not on `annotationProcessorPaths`.
