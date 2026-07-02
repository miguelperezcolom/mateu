import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    kotlin("multiplatform") version "2.1.0"
    kotlin("plugin.serialization") version "2.1.0"
    id("org.jetbrains.compose") version "1.7.3"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0"
    id("com.android.application") version "8.7.3"
}

group = "io.mateu"
version = "0.0.1-MATEU"

repositories {
    google()
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    // Jewel's IntelliJ-platform builds (…-243.*) pull JetBrains-forked artifacts
    // (skiko-awt-runtime-all, kotlinx-coroutines-*-intellij) that live here, not on Maven Central.
    maven("https://cache-redirector.jetbrains.com/intellij-dependencies")
}

kotlin {
    jvmToolchain(21)

    jvm("desktop")
    androidTarget()

    // iOS — builds the Kotlin framework consumed by the Xcode app in iosApp/.
    listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "MateuKit"
            isStatic = true
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)

                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")
                implementation("io.ktor:ktor-client-core:3.0.3")
            }
        }
        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
                implementation("io.ktor:ktor-client-cio:3.0.3")
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-swing:1.9.0")

                // Jewel — IntelliJ (Int UI) look & feel for the desktop renderer. This build (…-243.*)
                // is compiled against Compose Multiplatform 1.7.3, matching the version used here.
                // Desktop-only: Jewel is JVM/Compose-Desktop and cannot be used from commonMain
                // (Android/iOS keep the Material 3 renderers in commonMain).
                // jewel-ui / jewel-foundation are pulled by jewel-int-ui-standalone only at `runtime`
                // scope in its POM, so they must be declared explicitly to be on the compile classpath.
                val jewelVersion = "0.28.0-243.27100"
                implementation("org.jetbrains.jewel:jewel-int-ui-standalone:$jewelVersion")
                implementation("org.jetbrains.jewel:jewel-ui:$jewelVersion")
                implementation("org.jetbrains.jewel:jewel-foundation:$jewelVersion")
            }
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:3.0.3")
        }
        androidMain.dependencies {
            implementation("androidx.activity:activity-compose:1.9.3")
            implementation("io.ktor:ktor-client-okhttp:3.0.3")
        }
    }
}

android {
    namespace = "io.mateu.compose"
    compileSdk = 34
    defaultConfig {
        applicationId = "io.mateu.compose"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    // Android emulator reaches the host's localhost at 10.0.2.2; allow cleartext for the demo backend.
    packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }
}

compose.desktop {
    application {
        mainClass = "io.mateu.compose.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "MateuCompose"
            packageVersion = "1.0.0"
        }
    }
}
