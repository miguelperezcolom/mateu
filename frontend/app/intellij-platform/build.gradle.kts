plugins {
    kotlin("jvm") version "2.1.0"
    application
}

group = "io.mateu"
version = "0.0.1-MATEU"

// IntelliJ Platform build we compile/run against (2024.2.x line). Bumping this = change one string.
val platformVersion = "242.26775.15"

repositories {
    mavenCentral()
    // Published IntelliJ Platform module artifacts (com.jetbrains.intellij.platform:*).
    maven("https://www.jetbrains.com/intellij-repository/releases")
    // JetBrains-forked transitive deps of the platform (kotlinx-coroutines-*-intellij, etc.)
    // — same repo the Jewel/Compose desktop build already relies on.
    maven("https://cache-redirector.jetbrains.com/intellij-dependencies")
    // The platform POMs also reference plain JetBrains-hosted artifacts.
    maven("https://cache-redirector.jetbrains.com/maven-central")
}

// test-framework transitively drags in the spellchecker + Grazie NLP libraries (ai.grazie.*), whose
// artifacts are not published to the platform repos and which we never need to boot a UI Application.
configurations.all {
    exclude(group = "ai.grazie.spell")
    exclude(group = "ai.grazie.nlp")
    exclude(group = "ai.grazie.utils")
    exclude(group = "ai.grazie.model")
    exclude(group = "ai.grazie.emb")
    exclude(group = "com.jetbrains.intellij.spellchecker")
    exclude(group = "org.jetbrains.teamcity") // CI test-reporting service messages, unused
}

dependencies {
    // Kotlin UI DSL v2 (com.intellij.ui.dsl.builder) + JB Swing components (JBTable, JBTabbedPane,
    // OnePixelSplitter, JBTextField…) live in platform-impl → the `ide-impl` artifact, which
    // transitively pulls core / core-ui / util / util-ui.
    implementation("com.jetbrains.intellij.platform:ide-impl:$platformVersion")
    implementation("com.jetbrains.intellij.platform:util-ui:$platformVersion")
    implementation("com.jetbrains.intellij.platform:core-ui:$platformVersion")
    // Registers com.intellij.platform.settings.SettingsController, required by the Application's
    // configuration-store init during boot.
    // L&F implementations (DarculaLaf/IntelliJLaf).
    implementation("com.jetbrains.intellij.platform:ide:$platformVersion")
    // Bundles the theme JSONs (themes/darcula.theme.json, …) DarculaLaf loads from the classpath,
    // plus icons — required for the L&F to install standalone.
    implementation("com.jetbrains.intellij.platform:resources:$platformVersion")

    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")
}

java {
    toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }
}

kotlin {
    jvmToolchain(21)
}

application {
    mainClass.set("io.mateu.ijp.MainKt")
    // The platform accesses JDK internals (sun.*), both reflectively and via direct bytecode
    // references, so it needs the same --add-opens / --add-exports set the IntelliJ launcher passes.
    applicationDefaultJvmArgs = listOf(
        "--add-opens=java.base/java.io=ALL-UNNAMED",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/java.lang.ref=ALL-UNNAMED",
        "--add-opens=java.base/java.lang.reflect=ALL-UNNAMED",
        "--add-opens=java.base/java.net=ALL-UNNAMED",
        "--add-opens=java.base/java.nio=ALL-UNNAMED",
        "--add-opens=java.base/java.nio.charset=ALL-UNNAMED",
        "--add-opens=java.base/java.text=ALL-UNNAMED",
        "--add-opens=java.base/java.time=ALL-UNNAMED",
        "--add-opens=java.base/java.util=ALL-UNNAMED",
        "--add-opens=java.base/java.util.concurrent=ALL-UNNAMED",
        "--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED",
        "--add-opens=java.base/jdk.internal.vm=ALL-UNNAMED",
        "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt.event=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt.image=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt.peer=ALL-UNNAMED",
        "--add-opens=java.desktop/javax.swing=ALL-UNNAMED",
        "--add-opens=java.desktop/javax.swing.plaf.basic=ALL-UNNAMED",
        "--add-opens=java.desktop/javax.swing.text.html=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.awt=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.awt.image=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.font=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.java2d=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.swing=ALL-UNNAMED",
        "--add-exports=java.desktop/sun.awt=ALL-UNNAMED",
        "--add-exports=java.desktop/sun.font=ALL-UNNAMED",
        "--add-exports=java.desktop/sun.java2d=ALL-UNNAMED",
        "--add-exports=java.desktop/sun.swing=ALL-UNNAMED",
        "--add-exports=java.base/sun.nio.ch=ALL-UNNAMED",
    )
}
