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
    // Skip the data-sharing consent + trust-project prompts on a fresh dev sandbox, and disable the
    // IDE "internal error" notification balloon (a product shouldn't surface IntelliJ stack traces).
    jvmArgs(
        "-Djb.consents.confirmation.enabled=false",
        "-Didea.trust.all.projects=true",
        "-Didea.fatal.error.notification=disabled",
    )

    // The plugin boots per-project, so a project must be open — open a throwaway project directly
    // instead of landing on the Welcome/"select project" screen. The directory name becomes the
    // project name, so name it after the product (not "workspace") to keep the standalone look.
    // Override with -Pmateu.productName=…; gitignored under run/.
    val productName = (findProperty("mateu.productName") as String?)?.ifBlank { null } ?: "Mateu"
    val workspace = layout.projectDirectory.dir("run/$productName").asFile
    doFirst {
        workspace.mkdirs()
        File(workspace, "README.txt").writeText(
            "$productName — opened automatically by ./gradlew runIde.\n"
        )
    }
    systemProperty("mateu.productName", productName)
    args(workspace.absolutePath)
}

// ── Installer: a self-contained "plugin + IntelliJ" distribution ──────────────────────────────
// ./gradlew buildInstaller [-Pinstaller.platform=linux|windows|macos] [-Pinstaller.arch=aarch64|intel]
//                          [-Pmateu.registryUrl=… -Pmateu.appId=…]   (baked into the launcher VM options)
//
// linux/windows → build/installer/mateu-desktop-<version>-<platform>.tar.gz|.zip: IntelliJ IDEA
// Community with the Mateu plugin preinstalled, PORTABLE config/system dirs, a bundled workspace and
// a `mateu` launcher that opens it directly.
// macos → build/installer/Mateu.app (+ .zip): the Community .app rebranded "Mateu" (name + icon),
// plugin preinstalled, a launcher wrapper that opens the bundled workspace on double-click, re-signed
// ad-hoc. Unsigned → first launch needs right-click ▸ Open (or clear the quarantine xattr).
tasks.register("buildInstaller") {
    group = "distribution"
    description = "Builds a portable IntelliJ IDEA Community + Mateu plugin bundle"
    dependsOn(tasks.buildPlugin)
    doLast {
        val platform = (findProperty("installer.platform") as String?) ?: "linux"
        require(platform in setOf("linux", "windows", "macos")) {
            "installer.platform must be linux, windows or macos"
        }
        fun run(vararg cmd: String, dir: File) {
            val p = ProcessBuilder(*cmd).directory(dir).redirectErrorStream(true).start()
            val out = p.inputStream.readBytes().decodeToString()
            check(p.waitFor() == 0) { "command failed: ${cmd.joinToString(" ")}\n$out" }
        }
        fun capture(vararg cmd: String, dir: File): String {
            val p = ProcessBuilder(*cmd).directory(dir).redirectErrorStream(true).start()
            val out = p.inputStream.readBytes().decodeToString()
            check(p.waitFor() == 0) { "command failed: ${cmd.joinToString(" ")}\n$out" }
            return out
        }

        // ── macOS: build "Mateu.app" from the Community .dmg (Mateu-branded, plugin preinstalled) ──
        if (platform == "macos") {
            val arch = (findProperty("installer.arch") as String?) ?: "aarch64"
            val dmgName = if (arch == "intel") "ideaIC-$ideVersion.dmg" else "ideaIC-$ideVersion-aarch64.dmg"
            val installerDir = layout.buildDirectory.dir("installer").get().asFile
            val downloads = File(installerDir, "downloads").apply { mkdirs() }
            val dmg = File(downloads, dmgName)
            if (!dmg.exists()) {
                logger.lifecycle("Downloading https://download.jetbrains.com/idea/$dmgName …")
                run("curl", "-fL", "-o", dmg.absolutePath, "https://download.jetbrains.com/idea/$dmgName", dir = downloads)
            }
            val work = File(installerDir, "work/macos").apply { deleteRecursively(); mkdirs() }
            val mnt = File(work, "mnt").apply { mkdirs() }
            val app = File(work, "Mateu.app")
            logger.lifecycle("Mounting the IDE image…")
            run("hdiutil", "attach", dmg.absolutePath, "-nobrowse", "-readonly", "-mountpoint", mnt.absolutePath, dir = work)
            try {
                val srcApp = mnt.listFiles()!!.first { it.name.endsWith(".app") }
                logger.lifecycle("Copying ${srcApp.name} → Mateu.app…")
                run("cp", "-R", srcApp.absolutePath, app.absolutePath, dir = work)
            } finally {
                run("hdiutil", "detach", mnt.absolutePath, "-quiet", dir = work)
            }

            val contents = File(app, "Contents")
            val plist = File(contents, "Info.plist")
            fun plistSet(key: String, value: String) {
                // Set updates an existing key; keys that don't exist yet (e.g. CFBundleDisplayName) need Add.
                val updated = runCatching {
                    run("/usr/libexec/PlistBuddy", "-c", "Set :$key $value", plist.absolutePath, dir = work)
                }.isSuccess
                if (!updated) run("/usr/libexec/PlistBuddy", "-c", "Add :$key string $value", plist.absolutePath, dir = work)
            }

            // Branding: app name + icon.
            plistSet("CFBundleName", "Mateu")
            plistSet("CFBundleDisplayName", "Mateu")
            val icns = layout.projectDirectory.file("branding/mateu.icns").asFile
            check(icns.exists()) { "missing branding/mateu.icns — build it first" }
            icns.copyTo(File(contents, "Resources/mateu.icns"), overwrite = true)
            plistSet("CFBundleIconFile", "mateu.icns")

            // Stage the plugin INSIDE the bundle (not Contents/plugins — that dir only loads the
            // manifest-declared bundled plugins, so an added folder there is ignored). The launcher
            // wrapper copies it to the custom plugins dir (idea.plugins.path) on first run, where it
            // loads as a custom plugin.
            logger.lifecycle("Staging the Mateu plugin…")
            val pluginZip = tasks.buildPlugin.get().outputs.files.singleFile
            val pluginStage = File(contents, "Resources/mateu-plugin").apply { deleteRecursively(); mkdirs() }
            run("unzip", "-q", "-o", pluginZip.absolutePath, "-d", pluginStage.absolutePath, dir = work)

            // Portable data dirs, skip first-boot prompts, product name, error balloon off.
            File(contents, "bin/idea.properties").appendText(
                "\n# ── Mateu ──\n" +
                    "idea.config.path=\${user.home}/Library/Application Support/Mateu/config\n" +
                    "idea.system.path=\${user.home}/Library/Caches/Mateu/system\n" +
                    "idea.plugins.path=\${user.home}/Library/Application Support/Mateu/plugins\n" +
                    "idea.log.path=\${user.home}/Library/Logs/Mateu\n" +
                    "idea.fatal.error.notification=disabled\n",
            )
            val registryProps = listOfNotNull(
                (findProperty("mateu.registryUrl") as String?)?.let { "-Dmateu.registryUrl=$it" },
                (findProperty("mateu.appId") as String?)?.let { "-Dmateu.appId=$it" },
            )
            File(contents, "bin/idea.vmoptions").appendText(
                (listOf(
                    "-Djb.consents.confirmation.enabled=false",
                    "-Didea.trust.all.projects=true",
                    "-Dmateu.productName=Mateu",
                ) + registryProps).joinToString("\n", prefix = "\n", postfix = "\n"),
            )

            // Bundled workspace + launcher wrapper: double-clicking the app opens Mateu directly
            // (the plugin boots per-project) instead of the Welcome / "open project" screen.
            val workspace = File(contents, "Resources/workspace").apply { mkdirs() }
            File(workspace, "README.txt").writeText("Mateu — opened automatically by the app.\n")
            val macos = File(contents, "MacOS")
            val execName = capture("/usr/libexec/PlistBuddy", "-c", "Print :CFBundleExecutable", plist.absolutePath, dir = work).trim()
            run("mv", File(macos, execName).absolutePath, File(macos, "$execName-original").absolutePath, dir = work)
            val d = "${'$'}"
            val wrapper = File(macos, execName)
            wrapper.writeText(
                "#!/bin/sh\n" +
                    "HERE=\"${d}(cd \"${d}(dirname \"${d}0\")\" && pwd)\"\n" +
                    "SUPPORT=\"${d}HOME/Library/Application Support/Mateu\"\n" +
                    // Pre-create the config dir so the first run skips the IDE "Import Settings" dialog.
                    "[ -d \"${d}SUPPORT/config\" ] || mkdir -p \"${d}SUPPORT/config/options\"\n" +
                    // Install the staged Mateu plugin into the custom plugins dir on first run.
                    "if [ ! -d \"${d}SUPPORT/plugins/mateu-intellij-plugin\" ]; then\n" +
                    "  mkdir -p \"${d}SUPPORT/plugins\"\n" +
                    "  cp -R \"${d}HERE/../Resources/mateu-plugin/\"* \"${d}SUPPORT/plugins/\"\n" +
                    "fi\n" +
                    "exec \"${d}HERE/$execName-original\" \"${d}HERE/../Resources/workspace\" \"${d}@\"\n",
            )
            wrapper.setExecutable(true)

            // Modifying the bundle invalidates the original signature — re-sign. With a Developer ID
            // (-Pmacos.sign.identity="Developer ID Application: Name (TEAMID)") sign with the hardened
            // runtime + a secure timestamp (both required for notarization); otherwise ad-hoc, which
            // at least launches locally (first launch needs right-click ▸ Open).
            val signId = findProperty("macos.sign.identity") as String?
            val notaryProfile = findProperty("macos.notarize.profile") as String?
            if (signId != null) {
                logger.lifecycle("Signing with Developer ID (hardened runtime)…")
                run("codesign", "--force", "--deep", "--options", "runtime", "--timestamp", "--sign", signId, app.absolutePath, dir = work)
            } else {
                logger.lifecycle("Re-signing (ad-hoc)…")
                run("codesign", "--force", "--deep", "--sign", "-", app.absolutePath, dir = work)
            }

            // Double-click .dmg: Mateu.app beside a drag-to-/Applications shortcut. Move (not copy) the
            // work .app into the staging dir — same filesystem, so it's free.
            logger.lifecycle("Creating .dmg…")
            val dmgStage = File(work, "dmg").apply { deleteRecursively(); mkdirs() }
            val stagedApp = File(dmgStage, "Mateu.app")
            run("mv", app.absolutePath, stagedApp.absolutePath, dir = work)
            run("ln", "-s", "/Applications", File(dmgStage, "Applications").absolutePath, dir = work)
            val dmgOut = File(installerDir, "mateu-desktop-${project.version}-macos.dmg")
            dmgOut.delete()
            run("hdiutil", "create", "-volname", "Mateu", "-srcfolder", dmgStage.absolutePath, "-ov", "-format", "UDZO", dmgOut.absolutePath, dir = work)

            // Notarize the .dmg and staple the ticket onto both the .dmg and the .app, so Gatekeeper
            // passes offline (normal double-click, no right-click). Needs a Developer ID signature and
            // a notarytool keychain profile (-Pmacos.notarize.profile=<profile>, created once via
            // `xcrun notarytool store-credentials`).
            val notarized = signId != null && notaryProfile != null
            when {
                notarized -> {
                    logger.lifecycle("Notarizing (submitting to Apple — can take a few minutes)…")
                    run("xcrun", "notarytool", "submit", dmgOut.absolutePath, "--keychain-profile", notaryProfile, "--wait", dir = work)
                    logger.lifecycle("Stapling the notarization ticket…")
                    run("xcrun", "stapler", "staple", dmgOut.absolutePath, dir = work)
                    run("xcrun", "stapler", "staple", stagedApp.absolutePath, dir = work)
                }
                notaryProfile != null ->
                    logger.lifecycle("Skipping notarization: -Pmacos.sign.identity is required (an ad-hoc signature can't be notarized).")
            }

            // Ship the .app and a zip of it — from the staged (possibly stapled) copy.
            val out = File(installerDir, "Mateu.app")
            out.deleteRecursively()
            run("cp", "-R", stagedApp.absolutePath, out.absolutePath, dir = work)
            val zip = File(installerDir, "mateu-desktop-${project.version}-macos.zip")
            zip.delete()
            run("ditto", "-c", "-k", "--keepParent", out.absolutePath, zip.absolutePath, dir = work)

            logger.lifecycle("Installer ready: $out")
            logger.lifecycle("  $zip (${zip.length() / (1024 * 1024)} MB)")
            logger.lifecycle("  $dmgOut (${dmgOut.length() / (1024 * 1024)} MB)")
            if (notarized) logger.lifecycle("Signed + notarized — launches with a normal double-click.")
            else logger.lifecycle("Unsigned/ad-hoc — first launch: right-click ▸ Open (or xattr -dr com.apple.quarantine).")
            return@doLast
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

        // Install into the CUSTOM plugins dir (data/plugins = idea.plugins.path below), NOT the
        // bundled `plugins` dir — a folder added there is ignored (only manifest-declared bundled
        // plugins load), so a third-party plugin must live on idea.plugins.path to load.
        logger.lifecycle("Installing the Mateu plugin…")
        val pluginZip = tasks.buildPlugin.get().outputs.files.singleFile
        val pluginsDir = File(root, "data/plugins").apply { mkdirs() } // unzip -d won't create nested parents
        run("unzip", "-q", "-o", pluginZip.absolutePath, "-d", pluginsDir.absolutePath, dir = root)

        // Portable mode: config/system/log live INSIDE the bundle, isolated from any installed IDE.
        File(root, "bin/idea.properties").appendText(
            """

            # ── Mateu portable bundle ──
            idea.config.path=${'$'}{idea.home.path}/data/config
            idea.system.path=${'$'}{idea.home.path}/data/system
            idea.plugins.path=${'$'}{idea.home.path}/data/plugins
            idea.log.path=${'$'}{idea.home.path}/data/log
            idea.fatal.error.notification=disabled
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
