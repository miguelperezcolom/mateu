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

// Platform to build/run against. By default we download IntelliJ IDEA **Community** — it has no
// remote-dev backend (rdserver), so JBPopupFactory & friends resolve to their normal *local*
// variants (pure local mode). Override with -Pmateu.idePath=/path to reuse a LOCAL install instead
// (faster, no download — but Ultimate boots in a remote-dev-aware mode).
val idePath = findProperty("mateu.idePath") as String?
val ideVersion = (findProperty("mateu.ideVersion") as String?) ?: "2025.2.5"

dependencies {
    intellijPlatform {
        // Either way this gives the full product-modules layout (modules/module-descriptors.dat) the
        // loose Maven jars lacked — the whole platform Application boots, so all services are available.
        if (idePath != null) {
            local(idePath)
        } else {
            intellijIdeaCommunity(ideVersion)
        }
    }
}

intellijPlatform {
    pluginConfiguration {
        name = "Mateu"
        ideaVersion {
            sinceBuild = "252"
            untilBuild = provider { null }
        }
    }
}

kotlin {
    jvmToolchain(21)
}

// `./gradlew runIde` launches the IDE (from the configured platform) with the Mateu plugin — open
// the "Mateu" tool window (View ▸ Tool Windows ▸ Mateu, or the Mateu menu). The consent flag just
// skips the data-sharing prompt on a fresh dev sandbox.
tasks.runIde {
    // Skip the data-sharing consent + trust-project prompts on a fresh dev sandbox.
    jvmArgs("-Djb.consents.confirmation.enabled=false", "-Didea.trust.all.projects=true")
}
