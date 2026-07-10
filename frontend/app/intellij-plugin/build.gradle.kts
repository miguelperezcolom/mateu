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

// ── Installer: a self-contained "plugin + IntelliJ" distribution ──────────────────────────────
// ./gradlew buildInstaller [-Pinstaller.platform=linux|windows]
//                          [-Pmateu.registryUrl=… -Pmateu.appId=…]   (baked into the launcher VM options)
//
// Produces build/installer/mateu-desktop-<version>-<platform>.tar.gz|.zip: IntelliJ IDEA Community
// with the Mateu plugin preinstalled, PORTABLE config/system dirs (data/ inside the bundle — it
// never touches an existing IDE install), a bundled workspace project, and a `mateu` launcher that
// opens it directly. macOS is not supported from this task (JetBrains ships it only as .dmg).
tasks.register("buildInstaller") {
    group = "distribution"
    description = "Builds a portable IntelliJ IDEA Community + Mateu plugin bundle"
    dependsOn(tasks.buildPlugin)
    doLast {
        val platform = (findProperty("installer.platform") as String?) ?: "linux"
        require(platform in setOf("linux", "windows")) {
            "installer.platform must be linux or windows (macOS ships only as .dmg — install the plugin zip there instead)"
        }
        fun run(vararg cmd: String, dir: File) {
            val p = ProcessBuilder(*cmd).directory(dir).redirectErrorStream(true).start()
            val out = p.inputStream.readBytes().decodeToString()
            check(p.waitFor() == 0) { "command failed: ${cmd.joinToString(" ")}\n$out" }
        }

        val installerDir = layout.buildDirectory.dir("installer").get().asFile
        val downloads = File(installerDir, "downloads").apply { mkdirs() }
        val archiveName = if (platform == "linux") "ideaIC-$ideVersion.tar.gz" else "ideaIC-$ideVersion.win.zip"
        val archive = File(downloads, archiveName)
        if (!archive.exists()) {
            logger.lifecycle("Downloading https://download.jetbrains.com/idea/$archiveName …")
            run("curl", "-fL", "-o", archive.absolutePath, "https://download.jetbrains.com/idea/$archiveName", dir = downloads)
        }

        val work = File(installerDir, "work/$platform")
        work.deleteRecursively()
        work.mkdirs()
        val bundleName = "mateu-desktop-${project.version}"
        val root = File(work, bundleName)

        logger.lifecycle("Unpacking the IDE…")
        if (platform == "linux") {
            run("tar", "-xzf", archive.absolutePath, dir = work)
            val ideDir = work.listFiles()!!.single { it.isDirectory }
            check(ideDir.renameTo(root)) { "could not rename ${ideDir.name}" }
        } else {
            root.mkdirs()
            run("unzip", "-q", archive.absolutePath, dir = root) // the win zip has no top-level dir
        }

        logger.lifecycle("Installing the Mateu plugin…")
        val pluginZip = tasks.buildPlugin.get().outputs.files.singleFile
        run("unzip", "-q", "-o", pluginZip.absolutePath, "-d", File(root, "plugins").absolutePath, dir = root)

        // Portable mode: config/system/log live INSIDE the bundle, isolated from any installed IDE.
        File(root, "bin/idea.properties").appendText(
            """

            # ── Mateu portable bundle ──
            idea.config.path=${'$'}{idea.home.path}/data/config
            idea.system.path=${'$'}{idea.home.path}/data/system
            idea.plugins.path=${'$'}{idea.home.path}/data/plugins
            idea.log.path=${'$'}{idea.home.path}/data/log
            """.trimIndent() + "\n",
        )

        // Skip first-boot prompts; optionally bake the app-registry coordinates into the VM options.
        val vmOptionsFile = File(root, if (platform == "linux") "bin/idea64.vmoptions" else "bin/idea64.exe.vmoptions")
        val registryProps = listOfNotNull(
            (findProperty("mateu.registryUrl") as String?)?.let { "-Dmateu.registryUrl=$it" },
            (findProperty("mateu.appId") as String?)?.let { "-Dmateu.appId=$it" },
        )
        vmOptionsFile.appendText(
            (listOf("-Djb.consents.confirmation.enabled=false", "-Didea.trust.all.projects=true") + registryProps)
                .joinToString("\n", prefix = "\n", postfix = "\n"),
        )

        // Bundled workspace the launcher opens (the plugin boots per-project, so a project must open).
        File(root, "workspace").mkdirs()
        File(root, "workspace/README.txt").writeText("Mateu desktop workspace — opened automatically by the launcher.\n")

        if (platform == "linux") {
            File(root, "mateu.sh").apply {
                writeText("#!/bin/sh\nDIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"\nexec \"\$DIR/bin/idea.sh\" \"\$DIR/workspace\" \"\$@\"\n")
                setExecutable(true)
            }
        } else {
            File(root, "mateu.bat").writeText("@echo off\r\nstart \"\" \"%~dp0bin\\idea64.exe\" \"%~dp0workspace\"\r\n")
        }

        logger.lifecycle("Packing the bundle…")
        val out = File(
            installerDir,
            "$bundleName-$platform." + if (platform == "linux") "tar.gz" else "zip",
        )
        out.delete()
        if (platform == "linux") {
            run("tar", "-czf", out.absolutePath, bundleName, dir = work)
        } else {
            run("zip", "-qr", out.absolutePath, bundleName, dir = work)
        }
        logger.lifecycle("Installer ready: $out (${out.length() / (1024 * 1024)} MB)")
    }
}

// Dev-only: exercise the app-registry client (entry URL, fetch/parse, version gate) headlessly.
tasks.register<JavaExec>("registryProbe") {
    classpath = sourceSets.main.get().output + sourceSets.main.get().compileClasspath
    mainClass.set("io.mateu.ijp.debug.RegistryProbeKt")
}

// Dev-only: render a captured UIIncrement JSON through the real pipeline without booting an IDE —
// prints the resulting Swing tree and writes a PNG. See io.mateu.ijp.debug.RenderProbe.
tasks.register<JavaExec>("renderProbe") {
    // The intellij-platform plugin wires the IDE jars into compileClasspath only, so compose the
    // exec classpath from output + compileClasspath (runtimeClasspath lacks the platform).
    classpath = sourceSets.main.get().output + sourceSets.main.get().compileClasspath
    mainClass.set("io.mateu.ijp.debug.RenderProbeKt")
    (findProperty("probe.json") as String?)?.let { systemProperty("probe.json", it) }
    (findProperty("probe.png") as String?)?.let { systemProperty("probe.png", it) }
    (findProperty("probe.nativeToolbar") as String?)?.let { systemProperty("probe.nativeToolbar", it) }
    (findProperty("probe.followUp") as String?)?.let { systemProperty("probe.followUp", it) }
    jvmArgs(
        "--add-exports=java.desktop/sun.swing=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.awt=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.font=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.java2d=ALL-UNNAMED",
        "--add-opens=java.desktop/sun.swing=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt=ALL-UNNAMED",
        "--add-opens=java.desktop/javax.swing=ALL-UNNAMED",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/java.util=ALL-UNNAMED",
    )
}
