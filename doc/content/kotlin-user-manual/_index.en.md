---
title: "Kotlin"
#icon: "/images/icons/start.svg" # https://fonts.google.com/icons
#icon_bg: ""
description: "amet nisl tempus convlis quis ac lectus. Vivsdv amus mana justo, lacinia eget"
weight: 2

# don't create a separete form
type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

You can obviously use Mateu with Kotlin. The only thing you have to take care of is about configuring the annotation processor in the kotlin plugin.

```xml
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <configuration>
            <args>
                <arg>-Xjsr305=strict</arg>
            </args>
            <compilerPlugins>
                <plugin>spring</plugin>
            </compilerPlugins>
        </configuration>
        <dependencies>
            <dependency>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-allopen</artifactId>
                <version>${kotlin.version}</version>
            </dependency>
        </dependencies>
        <executions>
            <execution>
                <id>kapt</id>
                <goals>
                    <goal>kapt</goal> <!-- You can skip the <goals> element
if you enable extensions for the plugin -->
                </goals>
                <configuration>
                    <sourceDirs>
                        <sourceDir>src/main/kotlin</sourceDir>
                        <sourceDir>src/main/java</sourceDir>
                    </sourceDirs>
                    <annotationProcessorPaths>
                        <!-- Specify your annotation processors here -->
                        <annotationProcessorPath>
                            <groupId>io.mateu</groupId>
                            <artifactId>annotation-processor-mvc</artifactId>
                            <version>0.0.1-MATEU</version>
                        </annotationProcessorPath>
                    </annotationProcessorPaths>
                </configuration>
            </execution>
        </executions>
    </plugin>

```

Other than that, you just need your java classes with Mateu's annotations:

```kotlin
  @MateuUI("")
  class Hello {
  }
```

You have a sample project in https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-vaadin-kotlin-mvc
