import java.text.SimpleDateFormat
import java.util.Date

plugins {
    id("io.github.gradle-nexus.publish-plugin") version "1.3.0"
}

//Note: See library-publishing-conventions.gradle.kts for group and version definition

//Small hack to override release related properties to prevent accidental production release if called interactively
//Intended to fail if required (non-optional) values are not provided
if (!project.hasProperty("disableE2EOverriding")) {
    val propertiesToOverride = listOf("sonatypeUsername", "sonatypePassword")
    val optionalPropertiesToOverride = listOf("signingKey", "signingPassword", "signing.gnupg.keyName", "signing.gnupg.homeDir", "signing.gnupg.passphrase")
    logger.lifecycle("Overriding properties ${propertiesToOverride + optionalPropertiesToOverride} to use *E2E (non-production) values. Can be disbled with '-PdisableE2EOverriding'")
    overridePropertiesForE2E(propertiesToOverride)
    overrideOptionalPropertiesForE2E(optionalPropertiesToOverride)
}
fun overridePropertiesForE2E(propertyToOverrideNames: List<String>) {
    propertyToOverrideNames.forEach { propertyNameToOverride ->
        project.extra[propertyNameToOverride] = project.properties["${propertyNameToOverride}E2E"]
    }
}
fun overrideOptionalPropertiesForE2E(propertyToOverrideNames: List<String>) {
    propertyToOverrideNames.forEach { propertyNameToOverride ->
        val e2ePropertyNameToOverride = "${propertyNameToOverride}E2E"
        when {
            project.hasProperty(e2ePropertyNameToOverride) -> {
                project.extra[propertyNameToOverride] = project.properties[e2ePropertyNameToOverride]
            }
            project.hasProperty(propertyNameToOverride) -> {
                logger.info("Nullifying $propertyNameToOverride")
                project.extra[propertyNameToOverride] = null  //to ask for e2e passphrase using gpg-agent if executed interactively, even if production passprease is defined
            }
            else -> logger.info("Ignoring not set twice $propertyNameToOverride")
        }
    }
}

nexusPublishing {
    repositories {
        sonatype {
            stagingProfileId.set("248647f1a45ed6") //can reduce execution time by even 10 seconds
        }
    }
}

//do not generate extra load on Nexus with new staging repository if signing fails
val initializeSonatypeStagingRepository by tasks.existing
subprojects {
    initializeSonatypeStagingRepository {
        shouldRunAfter(tasks.withType<Sign>())
    }
}