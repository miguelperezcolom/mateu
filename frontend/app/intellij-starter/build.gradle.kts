plugins {
    kotlin("jvm") version "2.1.0"
    id("org.jetbrains.intellij.platform") version "2.17.0"
}

group = "io.mateu"
version = "0.1.0"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

// Path to a local IntelliJ IDEA (or any IntelliJ-Platform IDE) install used as the platform — no
// download needed. Override with -Pmateu.idePath=/path or in gradle.properties.
val idePath = (findProperty("mateu.idePath") as String?) ?: "/home/mperezco/idea-IU-252.28238.7"

dependencies {
    intellijPlatform {
        // Using an installed IDE gives the full product-modules layout (modules/module-descriptors.dat)
        // that the loose Maven jars lacked — the whole platform Application boots, so all services
        // (JBPopupFactory, real L&F, …) are available.
        local(idePath)
    }
}

intellijPlatform {
    pluginConfiguration {
        name = "Mateu Renderer (spike)"
        ideaVersion {
            sinceBuild = "252"
            untilBuild = provider { null }
        }
    }
}

kotlin {
    jvmToolchain(21)
}

// Launch the platform straight into our ApplicationStarter command ("mateu") instead of the IDE UI.
tasks.runIde {
    args = listOf("mateu")
}
