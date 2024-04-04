import java.text.SimpleDateFormat
import java.util.*

plugins {
    id("java-library")
    id("maven-publish")
    id("signing")
}

group = "io.github.gradle-nexus-e2e"
val versionTimestamp = SimpleDateFormat("yyyyMMdd-HHmmss").format(Date()) //See: https://issues.sonatype.org/browse/OSSRH-86532
var versionSuffix = if (isOnCIServer()) { "ci${System.getenv("GITHUB_RUN_NUMBER") ?: ""}-${versionTimestamp}" } else "local"
version = if (project.hasProperty("overriddenVersion")) { "${project.property("overriddenVersion")}" } else { "0.0.1-$versionSuffix" }

repositories {
    mavenCentral()
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    withJavadocJar()
    withSourcesJar()
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])
            pom {
                name.set("Minimal Nexus Publish E2E project")
                description.set("Minimal project publishing artifacts to Nexus for E2E testing in gradle-nexus-publish-plugin")
                url.set("https://github.com/gradle-nexus-e2e/nexus-publish-e2e-minimal")
                inceptionYear.set("2020")
                licenses {
                    license {
                        name.set("The Apache License, Version 2.0")
                        url.set("http://www.apache.org/licenses/LICENSE-2.0.txt")
                    }
                }
                developers {
                    developer {
                        id.set("szpak")
                        name.set("Marcin Zajączkowski")
                    }
                    developer {
                        id.set("marcphilipp")
                        name.set("Marc Philipp")
                    }
                }
                scm {
                    connection.set("scm:https://github.com/gradle-nexus-e2e/nexus-publish-e2e-minimal.git")
                    developerConnection.set("scm:git@github.com:gradle-nexus-e2e/nexus-publish-e2e-minimal.git")
                    url.set("https://github.com/gradle-nexus-e2e/nexus-publish-e2e-minimal")
                }
            }
        }
    }
}

signing {
    setRequired { !project.version.toString().endsWith("-SNAPSHOT") && !project.hasProperty("skipSigning") }
    if (project.hasProperty("signingKey")) {
        useInMemoryPgpKeys(properties["signingKey"].toString(), properties["signingPassword"].toString())
    } else {
        useGpgCmd()
    }
    sign(publishing.publications["mavenJava"])
}

tasks.javadoc {
    if(JavaVersion.current().isJava9Compatible) {
        (options as StandardJavadocDocletOptions).apply {
            addBooleanOption("html5", true)
        }
    }
}

fun isOnCIServer() = System.getenv("CI") == "true"