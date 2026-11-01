import java.security.MessageDigest

plugins {
    kotlin("jvm") version "2.4.21"
    id("org.jetbrains.intellij.platform") version "2.19.0"
    // Line coverage of the plugin's own code (`koverLog` / `koverXmlReport`, verified by `koverVerify`).
    id("org.jetbrains.kotlinx.kover") version "0.9.11"
}

group = "io.mateu"
version = "0.1.1"

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
// 2025.2.6.3 (not 2025.2.5): the 2025.2.5 macOS-aarch64 distribution fails bundled-plugin resolution
// ("Could not find bundled plugin with ID: 'com.intellij.java'") — this newer 252.x patch resolves it.
val ideVersion = (findProperty("mateu.ideVersion") as String?) ?: "2025.2.6.3"

dependencies {
    intellijPlatform {
        // Either way this gives the full product-modules layout (modules/module-descriptors.dat) the
        // loose Maven jars lacked — the whole platform Application boots, so all services are available.
        if (idePath != null) {
            local(idePath)
        } else {
            intellijIdeaCommunity(ideVersion)
        }
        // Java PSI (to resolve a YAML page's ModelView class + its fields/methods) and YAML PSI (to
        // read the page file) — both bundled in IDEA Community. Powers the visual-builder binding
        // validation (a FormField id / Button actionId must exist on the ModelView).
        bundledPlugin("com.intellij.java")
        bundledPlugin("org.jetbrains.plugins.yaml")
        // JSON Schema API (JsonSchemaProviderFactory) — to apply the Mateu authoring schema to
        // specs/ui YAMLs in the text editor. The class lives in the bundled intellij.json module.
        bundledModule("intellij.json.backend")
        // Headless test fixtures for the annotator test: the Java one carries
        // LightJavaCodeInsightFixtureTestCase (Java PSI in tests).
        testFramework(org.jetbrains.intellij.platform.gradle.TestFrameworkType.Platform)
        testFramework(org.jetbrains.intellij.platform.gradle.TestFrameworkType.Plugin.Java)
    }
    // QR codes the desktop hub reads (from the screen, the clipboard or an image file) — Apache-2.0, pure Java
    implementation("com.google.zxing:core:3.5.3")
    testImplementation("junit:junit:4.13.2")
}

intellijPlatform {
    pluginConfiguration {
        name = "Mateu"
        ideaVersion {
            sinceBuild = "252"
            // Capped to the platform lines it is verified against (pluginVerification below); raise it
            // after verifyPlugin passes on the next major — an open range ships untested combinations.
            untilBuild = "253.*"
        }
    }
    // `./gradlew verifyPlugin` runs the JetBrains Plugin Verifier (compatibility, internal/deprecated
    // API usage, descriptor problems) against the IDEs the Marketplace recommends for this range.
    pluginVerification {
        ides {
            recommended()
        }
    }
    // `./gradlew publishPlugin` uploads to the JetBrains Marketplace (CI, on a `plugins-v*` release).
    // The token comes from the environment so it is never committed; get one at
    // https://plugins.jetbrains.com/author/me/tokens. Optional signing is configured only when the
    // certificate env vars are present, so a normal (unsigned) local build never needs them.
    publishing {
        token = providers.environmentVariable("PUBLISH_TOKEN")
    }
    signing {
        certificateChain = providers.environmentVariable("CERTIFICATE_CHAIN")
        privateKey = providers.environmentVariable("PRIVATE_KEY")
        password = providers.environmentVariable("PRIVATE_KEY_PASSWORD")
    }
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        // Kotlin ≥ 2.2 generates bridges for interface default methods in every implementing class
        // by default; for the platform's ToolWindowFactory those bridges "override" members it marks
        // @ApiStatus.Internal (getAnchor/getIcon), and the Plugin Verifier refuses the plugin
        // (INTERNAL_API_USAGES). No bridges: the defaults stay the platform's.
        jvmDefault.set(org.jetbrains.kotlin.gradle.dsl.JvmDefaultMode.NO_COMPATIBILITY)
    }
}

// Keep the embedded web bundle (`resources/visual-editor`) from going stale: rebuild + copy the shared
// visual-editor web app before it is packaged into resources. Up-to-date aware (Gradle skips it when the
// web source is unchanged), and skipped WITH A WARNING when the web workspace isn't installed — so a
// plugin-only build (no Node set up) is never blocked, it just uses the committed bundle.
val visualEditorWebApp = projectDir.resolve("../../web/monorepo/apps/visual-editor")
val copyVisualEditor = tasks.register<Exec>("copyVisualEditor") {
    description = "Build the shared visual-editor web app and copy it into resources/visual-editor."
    group = "build"
    workingDir = visualEditorWebApp
    val npm = if (System.getProperty("os.name").lowercase().contains("win")) "npm.cmd" else "npm"
    commandLine(npm, "run", "copy") // = vite build + copy dist/* into this plugin's resources/visual-editor
    inputs.dir(visualEditorWebApp.resolve("src"))
    inputs.file(visualEditorWebApp.resolve("package.json"))
    outputs.dir(projectDir.resolve("src/main/resources/visual-editor"))
    onlyIf {
        val installed = visualEditorWebApp.resolve("../../node_modules").exists()
        if (!installed) {
            logger.warn(
                "copyVisualEditor: the web workspace (frontend/web/monorepo) is not installed — using the " +
                    "committed bundle. Run `npm install` there then `npm run copy` in apps/visual-editor to refresh.",
            )
        }
        installed
    }
}
tasks.named("processResources") { dependsOn(copyVisualEditor) }

// Emit the plugin version as a plain classpath resource so AppRegistry can read it WITHOUT the plugin
// manager — both PluginManagerCore.getPlugin and PluginManager.findEnabledPlugin are @ApiStatus.Internal.
val versionResourceDir = layout.buildDirectory.dir("generated/version")
val generatePluginVersion = tasks.register("generatePluginVersion") {
    val dir = versionResourceDir
    val v = version.toString()
    inputs.property("version", v)
    outputs.dir(dir)
    doLast {
        dir.get().file("mateu-plugin-version.txt").asFile.apply { parentFile.mkdirs(); writeText(v) }
    }
}
sourceSets.main.get().resources.srcDir(versionResourceDir)
tasks.named("processResources") { dependsOn(generatePluginVersion) }

// The bundled authoring schema is the GENERATED backend/shared/uidl/specs-schema.json, copied at build
// time (never a committed duplicate that drifts): it drives the specs/ui YAML validation and the
// New | Mateu skeleton test.
val specsSchema = projectDir.resolve("../../../backend/shared/uidl/specs-schema.json")
val schemaResourceDir = layout.buildDirectory.dir("generated/schema")
val copySpecsSchema = tasks.register<Copy>("copySpecsSchema") {
    description = "Copy the generated Mateu specs schema into the plugin resources."
    from(specsSchema)
    into(schemaResourceDir.map { it.dir("schema") })
    doFirst { check(specsSchema.exists()) { "missing $specsSchema" } }
}
sourceSets.main.get().resources.srcDir(schemaResourceDir)
tasks.named("processResources") { dependsOn(copySpecsSchema) }

// New Project wizard: the repository's starters (the templates, compiled and booted by CI) and the
// generator's data (starters/generator), copied at build time — never a committed duplicate — plus an
// index.txt listing them, since a jar's resources cannot be listed.
val startersDir = projectDir.resolve("../../../starters")
val startersResourceDir = layout.buildDirectory.dir("generated/starters")
val startersExcluded = setOf("target", "node_modules", "bin", "obj", "__pycache__", ".pytest_cache", ".venv", ".idea", ".DS_Store")
val copyStarters = tasks.register("copyStarters") {
    description = "Copy the Mateu starters (New Project templates) into the plugin resources."
    val source = startersDir
    val excluded = startersExcluded
    val target = startersResourceDir
    inputs.files(fileTree(source) { exclude("**/target/**", "**/node_modules/**", "**/bin/**", "**/obj/**", "**/__pycache__/**", "**/.venv/**") })
    outputs.dir(target)
    doLast {
        check(source.resolve("generator/new-project.json").exists()) { "missing $source/generator/new-project.json" }
        val out = target.get().dir("mateu/starters").asFile
        out.deleteRecursively()
        val files = source.walkTopDown()
            .onEnter { it == source || it.name !in excluded }
            .filter { it.isFile && it.name !in excluded }
            .map { it.relativeTo(source).invariantSeparatorsPath }
            .sorted().toList()
        // Gradle's resource processing drops `.gitignore` files (Ant's default excludes), so they are
        // stored under a neutral name; MateuProjectGenerator.resourceName maps the path back.
        for (rel in files) source.resolve(rel).copyTo(out.resolve(rel.replace(Regex("(^|/)\\.gitignore$"), "$1_dot_gitignore")), overwrite = true)
        out.resolve("index.txt").writeText(files.joinToString("\n", postfix = "\n"))
    }
}
sourceSets.main.get().resources.srcDir(startersResourceDir)
tasks.named("processResources") { dependsOn(copyStarters) }

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
            "$productName — opened automatically by ./gradlew runIde.\n" +
                "Open specs/ui/playground.yaml to try the Visual Editor (palette + canvas + Layers).\n"
        )
        // Seed a sample screen so the Visual Editor has something to open out of the box. A file under
        // `specs/ui/` is what MateuVisualEditorProvider claims. Seed only when absent, so it never
        // overwrites edits made in a previous runIde session (the editor saves back into this file).
        val sample = File(workspace, "specs/ui/playground.yaml")
        if (!sample.exists()) {
            sample.parentFile.mkdirs()
            sample.writeText(
                """
                # Playground screen — a plain layout page to try the Visual Editor (palette + canvas + Layers).
                # It has no view model, so it renders as a bare layout: perfect for exercising the Layers tree,
                # drag-drop and the properties panel without a backend behind it.
                ${'$'}schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/uidl-schema.json
                type: VerticalLayout
                spacing: true
                padding: true
                content:
                  - type: Text
                    text: "Character profile"
                    container: h2
                  - type: Text
                    text: "A sample screen to play with in the visual editor."
                    size: s
                  - type: FormLayout
                    content:
                      - type: FormField
                        id: name
                        label: "Name"
                        dataType: string
                      - type: FormField
                        id: homeworld
                        label: "Homeworld"
                        dataType: string
                      - type: FormField
                        id: birthYear
                        label: "Birth year"
                        dataType: string
                      - type: FormField
                        id: gender
                        label: "Gender"
                        dataType: string
                        stereotype: multiSelect
                        options:
                          - value: male
                            label: Male
                          - value: female
                            label: Female
                          - value: "n/a"
                            label: "Droid (n/a)"
                      - type: FormField
                        id: bio
                        label: "Biography"
                        dataType: string
                        stereotype: textarea
                  - type: HorizontalLayout
                    spacing: true
                    content:
                      - type: Button
                        label: "Save"
                        actionId: save
                        buttonStyle: primary
                      - type: Button
                        label: "Cancel"
                        actionId: cancel
                        buttonStyle: secondary
                """.trimIndent() + "\n"
            )
        }
    }
    systemProperty("mateu.productName", productName)
    // Forward the mateu.* connection properties from the gradle invocation to the IDE JVM —
    // `./gradlew runIde -Dmateu.baseUrl=…` sets them on the GRADLE process, not on the IDE,
    // so without this hop the plugin silently falls back to the bundled defaults.
    listOf("mateu.baseUrl", "mateu.route", "mateu.config", "mateu.focused", "mateu.variant",
           "mateu.registryUrl", "mateu.appId").forEach { key ->
        (System.getProperty(key) ?: (findProperty(key) as String?))?.let { systemProperty(key, it) }
    }
    args(workspace.absolutePath)
}

// ── Installer: the "Mateu desktop" app = IntelliJ IDEA Community + the Mateu plugin ────────────
// ./gradlew buildInstaller [-Pinstaller.platform=linux|windows|macos] [-Pinstaller.arch=aarch64|intel]
//                          [-Pmateu.variant=hub|fixed] [-Pmateu.productName=…]
//                          [-Pmateu.baseUrl=… | -Pmateu.registryUrl=… -Pmateu.appId=…]   (fixed)
//                          [-Pmateu.updateUrl=…|none] [-Pinstaller.ideArchive=<local IDE archive>]
//
// Variants: `hub` (the default) = the app keeps a list of UIs the user adds (and owns mateu:// links);
// `fixed` = bound to ONE UI — a base URL or app-registry coordinates, required — and claims no links.
// Without -Pmateu.variant, passing a base URL or registry coordinates means `fixed`.
//
// linux   → build/installer/<slug>-desktop-<version>-linux.tar.gz: portable (config/system/log in
//           data/), `mateu.sh` launcher, `install.sh` (per-user install + menu entry + mateu://).
// windows → …-windows.zip (portable, `mateu.bat`) and, with makensis on the PATH, …-windows-setup.exe
//           (per-user NSIS installer: %LOCALAPPDATA%\Programs\<product>, shortcuts, mateu://).
// macos   → build/installer/<product>.app (+ …-macos-<arch>.zip and .dmg): the Community .app rebranded,
//           plugin preinstalled by its launcher wrapper, re-signed (ad-hoc, or Developer ID + notarized).
//
// Every launcher applies a staged plugin update before the IDE starts (installer/apply-update.sh|.cmd,
// staged by io.mateu.ijp.update) — the app updates itself; IntelliJ's own updates are switched off.
//
// Coverage ratchet (`koverVerify`, run in CI after the tests): line coverage of the plugin's own
// code may only stay or grow. Measured 69.3% (2026-10-18, 459 tests; 65.8% on 2026-10-17) —
// raise the bound as suites grow, never lower it. The whole module counts: IDE glue that cannot run headless (dialogs, tool
// window factories, project service) is deliberately NOT excluded, so it shows as the gap it is.
kover {
    reports {
        verify {
            rule("plugin line coverage") {
                minBound(69)
            }
        }
    }
}

/** What a desktop build is: product name, variant, the UI a `fixed` build is bound to, the feed. */
data class DesktopOptions(
    val product: String,
    val slug: String,
    val variant: String,
    val baseUrl: String?,
    val registryUrl: String?,
    val appId: String?,
    val updateUrl: String?,
) {
    val hub: Boolean get() = variant == "hub"
}

fun desktopOptions(): DesktopOptions {
    fun prop(key: String) = (findProperty(key) as String?)?.trim()?.ifBlank { null }
    val product = prop("mateu.productName") ?: "Mateu"
    val slug = product.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-').ifBlank { "mateu" }
    val baseUrl = prop("mateu.baseUrl")
    val registryUrl = prop("mateu.registryUrl")
    val appId = prop("mateu.appId")
    val boundToOneUi = baseUrl != null || (registryUrl != null && appId != null)
    val variant = prop("mateu.variant") ?: if (boundToOneUi) "fixed" else "hub"
    require(variant == "hub" || variant == "fixed") { "mateu.variant must be hub or fixed (got '$variant')" }
    require(variant != "fixed" || boundToOneUi) {
        "a fixed build is bound to one UI: pass -Pmateu.baseUrl=… or -Pmateu.registryUrl=… -Pmateu.appId=…"
    }
    // `findProperty` keeps an explicitly EMPTY -Pmateu.updateUrl= (= updates off) apart from absent
    val updateUrl = (findProperty("mateu.updateUrl") as String?)?.trim()
    return DesktopOptions(product, slug, variant, baseUrl, registryUrl, appId, updateUrl)
}

/** The VM options every desktop build bakes in (the launcher's `.vmoptions`). */
fun desktopVmOptions(o: DesktopOptions, installerKey: String): List<String> = listOfNotNull(
    "-Djb.consents.confirmation.enabled=false",
    "-Didea.trust.all.projects=true",
    "-Dmateu.productName=${o.product}",
    // The desktop app IS the standalone shell — focused mode on (OFF by default in the plugin, so the
    // Marketplace plugin doesn't rewire a developer's IDE).
    "-Dmateu.focused=true",
    "-Dmateu.variant=${o.variant}",
    o.baseUrl?.takeIf { !o.hub }?.let { "-Dmateu.baseUrl=$it" },
    o.registryUrl?.let { "-Dmateu.registryUrl=$it" },
    o.appId?.let { "-Dmateu.appId=$it" },
    o.updateUrl?.let { "-Dmateu.updateUrl=$it" },
    // What the updater compares the feed with (and which installer of the feed fits this app).
    "-Dmateu.desktop.platform=$installerKey",
    "-Dmateu.desktop.ideVersion=$ideVersion",
    // Never offer to update to IntelliJ IDEA: the platform's ExternalUpdateManager reads this property
    // (any value = "updates managed by <value>") and switches its own platform update off. The value is
    // the name the Settings page shows.
    "-Dide.no.platform.update=${o.product}",
)

/** Release asset names, shared by the installers and the update feed (keys = installerKey). */
fun installerFileName(slug: String, version: String, key: String): String = when (key) {
    "macos-aarch64", "macos-intel" -> "$slug-desktop-$version-$key.dmg"
    "linux" -> "$slug-desktop-$version-linux.tar.gz"
    "windows" -> "$slug-desktop-$version-windows-setup.exe"
    else -> error("unknown installer key $key")
}

val installerSources = layout.projectDirectory.dir("installer")

tasks.register("buildInstaller") {
    group = "distribution"
    description = "Builds the Mateu desktop app (IntelliJ IDEA Community + the Mateu plugin) for one OS"
    dependsOn(tasks.buildPlugin)
    doLast {
        val platform = (findProperty("installer.platform") as String?) ?: "linux"
        require(platform in setOf("linux", "windows", "macos")) {
            "installer.platform must be linux, windows or macos"
        }
        val o = desktopOptions()
        val version = project.version.toString()
        val src = installerSources.asFile
        fun template(path: String, vararg values: Pair<String, String>): String =
            values.fold(File(src, path).readText()) { text, (k, v) -> text.replace("@$k@", v) }
        fun run(vararg cmd: String, dir: File) {
            val p = ProcessBuilder(*cmd).directory(dir).redirectErrorStream(true).start()
            val out = p.inputStream.readBytes().decodeToString()
            val rc = p.waitFor()
            // > 128 = killed by a signal (137 = the OOM killer), which prints nothing of its own
            check(rc == 0) { "command failed (exit $rc): ${cmd.joinToString(" ")}\n${out.takeLast(8000)}" }
        }
        fun capture(vararg cmd: String, dir: File): String {
            val p = ProcessBuilder(*cmd).directory(dir).redirectErrorStream(true).start()
            val out = p.inputStream.readBytes().decodeToString()
            check(p.waitFor() == 0) { "command failed: ${cmd.joinToString(" ")}\n$out" }
            return out
        }
        fun onPath(tool: String): Boolean =
            System.getenv("PATH").orEmpty().split(File.pathSeparator).any { File(it, tool).canExecute() }
        val installerDir = layout.buildDirectory.dir("installer").get().asFile
        val downloads = File(installerDir, "downloads").apply { mkdirs() }
        // The IDE archive: -Pinstaller.ideArchive=<file> (a CI cache, an offline build), else downloaded
        // once into build/installer/downloads/ and reused.
        fun ideArchive(name: String): File {
            (findProperty("installer.ideArchive") as String?)?.let { return File(it).also { f -> check(f.isFile) { "missing $f" } } }
            val file = File(downloads, name)
            if (!file.exists()) {
                logger.lifecycle("Downloading https://download.jetbrains.com/idea/$name …")
                run("curl", "-fL", "-o", file.absolutePath, "https://download.jetbrains.com/idea/$name", dir = downloads)
            }
            return file
        }
        val pluginZip = tasks.buildPlugin.get().outputs.files.singleFile
        logger.lifecycle("Desktop app: ${o.product} — ${o.variant} variant, plugin $version, IntelliJ $ideVersion")

        // ── macOS: build "<product>.app" from the Community .dmg (branded, plugin preinstalled) ──
        if (platform == "macos") {
            val arch = (findProperty("installer.arch") as String?) ?: "aarch64"
            require(arch == "aarch64" || arch == "intel") { "installer.arch must be aarch64 or intel" }
            val key = "macos-$arch"
            val dmg = ideArchive(if (arch == "intel") "ideaIC-$ideVersion.dmg" else "ideaIC-$ideVersion-aarch64.dmg")
            val work = File(installerDir, "work/macos").apply { deleteRecursively(); mkdirs() }
            val mnt = File(work, "mnt").apply { mkdirs() }
            val appName = "${o.product}.app"
            val app = File(work, appName)
            logger.lifecycle("Mounting the IDE image…")
            run("hdiutil", "attach", dmg.absolutePath, "-nobrowse", "-readonly", "-mountpoint", mnt.absolutePath, dir = work)
            try {
                val srcApp = mnt.listFiles()!!.first { it.name.endsWith(".app") }
                logger.lifecycle("Copying ${srcApp.name} → $appName…")
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

            // Branding: app name + icon, and an identity of its own — sharing IntelliJ's bundle id would
            // make macOS treat both apps as one (Launch Services, URL schemes).
            plistSet("CFBundleName", o.product)
            plistSet("CFBundleDisplayName", o.product)
            val bundleId = (findProperty("mateu.bundleId") as String?)
                ?: if (o.slug == "mateu") "io.mateu.desktop" else "io.mateu.desktop.${o.slug}"
            plistSet("CFBundleIdentifier", bundleId)
            val icns = layout.projectDirectory.file("branding/mateu.icns").asFile
            check(icns.exists()) { "missing branding/mateu.icns — build it first" }
            icns.copyTo(File(contents, "Resources/mateu.icns"), overwrite = true)
            plistSet("CFBundleIconFile", "mateu.icns")
            // The hub claims mateu:// links (macOS hands the OpenURL event to the IDE, which routes it
            // to the plugin's protocol handler). A fixed app must not: it would steal the hub's links.
            if (o.hub) {
                val pb = "/usr/libexec/PlistBuddy"
                val hasTypes = runCatching { capture(pb, "-c", "Print :CFBundleURLTypes", plist.absolutePath, dir = work) }.isSuccess
                if (!hasTypes) run(pb, "-c", "Add :CFBundleURLTypes array", plist.absolutePath, dir = work)
                val count = capture(pb, "-c", "Print :CFBundleURLTypes", plist.absolutePath, dir = work)
                    .lines().count { it.trim() == "Dict {" }
                run(pb, "-c", "Add :CFBundleURLTypes:$count dict", plist.absolutePath, dir = work)
                run(pb, "-c", "Add :CFBundleURLTypes:$count:CFBundleURLName string Mateu UI link", plist.absolutePath, dir = work)
                run(pb, "-c", "Add :CFBundleURLTypes:$count:CFBundleURLSchemes array", plist.absolutePath, dir = work)
                run(pb, "-c", "Add :CFBundleURLTypes:$count:CFBundleURLSchemes:0 string mateu", plist.absolutePath, dir = work)
            }

            // Stage the plugin INSIDE the bundle (not Contents/plugins — that dir only loads the
            // manifest-declared bundled plugins, so an added folder there is ignored). The launcher
            // wrapper copies it to the custom plugins dir (idea.plugins.path), where it loads as a
            // custom plugin — on first run, and again when a reinstalled app brings another version.
            logger.lifecycle("Staging the Mateu plugin…")
            val resources = File(contents, "Resources")
            val pluginStage = File(resources, "mateu-plugin").apply { deleteRecursively(); mkdirs() }
            run("unzip", "-q", "-o", pluginZip.absolutePath, "-d", pluginStage.absolutePath, dir = work)
            File(resources, "mateu-plugin-version.txt").writeText(version + "\n")
            File(src, "apply-update.sh").copyTo(File(resources, "apply-update.sh"), overwrite = true)
            File(src, "updates.xml").copyTo(File(resources, "updates.xml"), overwrite = true)

            // Data dirs per product, skip first-boot prompts, error balloon off.
            File(contents, "bin/idea.properties").appendText(
                "\n# ── ${o.product} ──\n" +
                    "idea.config.path=\${user.home}/Library/Application Support/${o.product}/config\n" +
                    "idea.system.path=\${user.home}/Library/Caches/${o.product}/system\n" +
                    "idea.plugins.path=\${user.home}/Library/Application Support/${o.product}/plugins\n" +
                    "idea.log.path=\${user.home}/Library/Logs/${o.product}\n" +
                    "idea.fatal.error.notification=disabled\n",
            )
            File(contents, "bin/idea.vmoptions").appendText(desktopVmOptions(o, key).joinToString("\n", prefix = "\n", postfix = "\n"))

            // Bundled workspace + launcher wrapper: double-clicking the app opens Mateu directly
            // (the plugin boots per-project) instead of the Welcome / "open project" screen.
            val workspace = File(resources, "workspace").apply { mkdirs() }
            File(workspace, "README.txt").writeText("${o.product} — opened automatically by the app.\n")
            val macos = File(contents, "MacOS")
            val execName = capture("/usr/libexec/PlistBuddy", "-c", "Print :CFBundleExecutable", plist.absolutePath, dir = work).trim()
            run("mv", File(macos, execName).absolutePath, File(macos, "$execName-original").absolutePath, dir = work)
            File(macos, execName).apply {
                writeText(template("macos/launcher.sh", "PRODUCT" to o.product, "EXEC" to execName))
                setExecutable(true)
            }

            // Modifying the bundle invalidates the original signature — re-sign. With a Developer ID
            // (-Pmacos.sign.identity="Developer ID Application: Name (TEAMID)") sign with the hardened
            // runtime + a secure timestamp (both required for notarization); otherwise ad-hoc, which
            // at least launches locally (first launch needs right-click ▸ Open).
            val signId = (findProperty("macos.sign.identity") as String?)?.ifBlank { null }
            val notaryProfile = (findProperty("macos.notarize.profile") as String?)?.ifBlank { null }
            if (signId != null) {
                logger.lifecycle("Signing with Developer ID (hardened runtime)…")
                run("codesign", "--force", "--deep", "--options", "runtime", "--timestamp", "--sign", signId, app.absolutePath, dir = work)
            } else {
                logger.lifecycle("Re-signing (ad-hoc)…")
                run("codesign", "--force", "--deep", "--sign", "-", app.absolutePath, dir = work)
            }

            // Double-click .dmg: the .app beside a drag-to-/Applications shortcut. Move (not copy) the
            // work .app into the staging dir — same filesystem, so it's free.
            logger.lifecycle("Creating .dmg…")
            val dmgStage = File(work, "dmg").apply { deleteRecursively(); mkdirs() }
            val stagedApp = File(dmgStage, appName)
            run("mv", app.absolutePath, stagedApp.absolutePath, dir = work)
            run("ln", "-s", "/Applications", File(dmgStage, "Applications").absolutePath, dir = work)
            val dmgOut = File(installerDir, installerFileName(o.slug, version, key))
            dmgOut.delete()
            run("hdiutil", "create", "-volname", o.product, "-srcfolder", dmgStage.absolutePath, "-ov", "-format", "UDZO", dmgOut.absolutePath, dir = work)

            // Notarize the .dmg and staple the ticket onto both the .dmg and the .app, so Gatekeeper
            // passes offline (normal double-click, no right-click). Needs a Developer ID signature and
            // a notarytool keychain profile (-Pmacos.notarize.profile=<profile>, created once via
            // `xcrun notarytool store-credentials`).
            val notarized = signId != null && notaryProfile != null
            when {
                notarized -> {
                    logger.lifecycle("Notarizing (submitting to Apple — can take a few minutes)…")
                    run("xcrun", "notarytool", "submit", dmgOut.absolutePath, "--keychain-profile", notaryProfile!!, "--wait", dir = work)
                    logger.lifecycle("Stapling the notarization ticket…")
                    run("xcrun", "stapler", "staple", dmgOut.absolutePath, dir = work)
                    run("xcrun", "stapler", "staple", stagedApp.absolutePath, dir = work)
                }
                notaryProfile != null ->
                    logger.lifecycle("Skipping notarization: -Pmacos.sign.identity is required (an ad-hoc signature can't be notarized).")
            }

            // Ship the .app and a zip of it — from the staged (possibly stapled) copy.
            val out = File(installerDir, appName)
            out.deleteRecursively()
            run("cp", "-R", stagedApp.absolutePath, out.absolutePath, dir = work)
            val zip = File(installerDir, "${o.slug}-desktop-$version-$key.zip")
            zip.delete()
            run("ditto", "-c", "-k", "--keepParent", out.absolutePath, zip.absolutePath, dir = work)

            logger.lifecycle("Installer ready: $out")
            logger.lifecycle("  $zip (${zip.length() / (1024 * 1024)} MB)")
            logger.lifecycle("  $dmgOut (${dmgOut.length() / (1024 * 1024)} MB)")
            if (notarized) logger.lifecycle("Signed + notarized — launches with a normal double-click.")
            else logger.lifecycle("Unsigned/ad-hoc — first launch: right-click ▸ Open (or xattr -dr com.apple.quarantine).")
            return@doLast
        }

        val linux = platform == "linux"
        val archive = ideArchive(if (linux) "ideaIC-$ideVersion.tar.gz" else "ideaIC-$ideVersion.win.zip")
        val work = File(installerDir, "work/$platform")
        work.deleteRecursively()
        work.mkdirs()
        val bundleName = "${o.slug}-desktop-$version"
        val root = File(work, bundleName)

        logger.lifecycle("Unpacking the IDE…")
        if (linux) {
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
        val pluginsDir = File(root, "data/plugins").apply { mkdirs() } // unzip -d won't create nested parents
        run("unzip", "-q", "-o", pluginZip.absolutePath, "-d", pluginsDir.absolutePath, dir = root)

        // Portable mode: config/system/log live INSIDE the bundle, isolated from any installed IDE.
        File(root, "bin/idea.properties").appendText(
            """

            # ── ${o.product} portable bundle ──
            idea.config.path=${'$'}{idea.home.path}/data/config
            idea.system.path=${'$'}{idea.home.path}/data/system
            idea.plugins.path=${'$'}{idea.home.path}/data/plugins
            idea.log.path=${'$'}{idea.home.path}/data/log
            idea.fatal.error.notification=disabled
            """.trimIndent() + "\n",
        )
        // IntelliJ's own update checks off from the first run (the app updates itself).
        File(root, "data/config/options").mkdirs()
        File(src, "updates.xml").copyTo(File(root, "data/config/options/updates.xml"), overwrite = true)

        // Skip first-boot prompts, focused mode, variant, updater coordinates.
        val key = if (linux) "linux" else "windows"
        File(root, if (linux) "bin/idea64.vmoptions" else "bin/idea64.exe.vmoptions")
            .appendText(desktopVmOptions(o, key).joinToString("\n", prefix = "\n", postfix = "\n"))

        // Bundled workspace the launcher opens (the plugin boots per-project, so a project must open).
        File(root, "workspace").mkdirs()
        File(root, "workspace/README.txt").writeText("${o.product} desktop workspace — opened automatically by the launcher.\n")

        if (linux) {
            fun script(name: String, text: String) = File(root, name).apply { writeText(text); setExecutable(true) }
            script("apply-update.sh", File(src, "apply-update.sh").readText())
            script("mateu.sh", File(src, "linux/mateu.sh").readText())
            val values = arrayOf("PRODUCT" to o.product, "SLUG" to o.slug, "HUB" to o.hub.toString())
            script("install.sh", template("linux/install.sh", *values))
            File(root, "${o.slug}.desktop").writeText(
                template("linux/mateu.desktop", *values)
                    .replace("@MIME@\n", if (o.hub) "MimeType=x-scheme-handler/mateu;\n" else ""),
            )
            layout.projectDirectory.file("branding/mateu-1024.png").asFile.copyTo(File(root, "${o.slug}.png"), overwrite = true)
        } else {
            // cmd.exe wants CRLF
            fun crlf(name: String, from: String) = File(root, name).writeText(File(src, from).readText().replace("\r\n", "\n").replace("\n", "\r\n"))
            crlf("apply-update.cmd", "apply-update.cmd")
            crlf("mateu.bat", "windows/mateu.bat")
            layout.projectDirectory.file("branding/mateu.ico").asFile.copyTo(File(root, "${o.slug}.ico"), overwrite = true)
        }

        logger.lifecycle("Packing the bundle…")
        val out = File(installerDir, "$bundleName-$platform." + if (linux) "tar.gz" else "zip")
        out.delete()
        if (linux) {
            run("tar", "-czf", out.absolutePath, bundleName, dir = work)
        } else {
            run("zip", "-qr", out.absolutePath, bundleName, dir = work)
        }
        logger.lifecycle("Installer ready: $out (${out.length() / (1024 * 1024)} MB)")

        if (!linux) {
            val setup = File(installerDir, installerFileName(o.slug, version, "windows"))
            if (!onPath("makensis")) {
                logger.lifecycle("makensis not found — only the portable zip was built. For the setup .exe install NSIS " +
                    "(`sudo apt-get install nsis`, `brew install makensis`, or nsis.sourceforge.io) and run again.")
                return@doLast
            }
            // What an upgrade replaces: every top-level entry of the bundle but data/ and the workspace,
            // plus the plugin, staged updates and caches under data/ (data/config is the user's).
            val clean = File(work, "clean.nsh")
            clean.writeText(
                (root.listFiles()!!.sortedBy { it.name }.filter { it.name != "data" && it.name != "workspace" }.map {
                    if (it.isDirectory) "RMDir /r \"\$INSTDIR\\${it.name}\"" else "Delete \"\$INSTDIR\\${it.name}\""
                } + listOf("plugins", "mateu-update", "system").map { "RMDir /r \"\$INSTDIR\\data\\$it\"" })
                    .joinToString("\n", postfix = "\n"),
            )
            logger.lifecycle("Building the NSIS installer (this compresses ~1 GB, give it a few minutes)…")
            setup.delete()
            run(
                "makensis", "-V3",
                "-DPRODUCT=${o.product}", "-DSLUG=${o.slug}", "-DVERSION=$version",
                "-DSRC_DIR=${root.absolutePath}", "-DOUT_FILE=${setup.absolutePath}",
                "-DHUB=${o.hub}", "-DCLEAN_NSH=${clean.absolutePath}",
                File(src, "windows/mateu.nsi").absolutePath,
                dir = work,
            )
            logger.lifecycle("Installer ready: $setup (${setup.length() / (1024 * 1024)} MB)")
        }
    }
}

// The update feed of a release (`mateu-desktop-update.json`, see io.mateu.ijp.update.UpdateFeed):
// ./gradlew desktopUpdateFeed -Pfeed.downloadBase=https://github.com/<owner>/<repo>/releases/download/<tag>
//                             [-Pfeed.notes=…]
// The plugin zip's sha256 is computed here, from the zip `buildPlugin` just built — publish THAT zip.
tasks.register("desktopUpdateFeed") {
    group = "distribution"
    description = "Writes build/installer/mateu-desktop-update.json for a release of the desktop app"
    dependsOn(tasks.buildPlugin)
    doLast {
        val base = (findProperty("feed.downloadBase") as String?)?.trimEnd('/')
            ?: error("pass -Pfeed.downloadBase=<the release's download URL>")
        val o = desktopOptions()
        val version = project.version.toString()
        val zip = tasks.buildPlugin.get().outputs.files.singleFile
        val sha = MessageDigest.getInstance("SHA-256").digest(zip.readBytes()).joinToString("") { "%02x".format(it) }
        val keys = listOf("macos-aarch64", "macos-intel", "linux", "windows")
        val feed = mapOf(
            "version" to version,
            "plugin" to mapOf("url" to "$base/${zip.name}", "sha256" to sha),
            "platform" to mapOf(
                "ideVersion" to ideVersion,
                "installers" to keys.associateWith { "$base/${installerFileName(o.slug, version, it)}" },
            ),
            "notes" to ((findProperty("feed.notes") as String?) ?: "${o.product} $version"),
        )
        val out = layout.buildDirectory.file("installer/mateu-desktop-update.json").get().asFile
        out.parentFile.mkdirs()
        out.writeText(groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(feed)) + "\n")
        logger.lifecycle("Update feed: $out (plugin ${zip.name}, sha256 $sha)")
    }
}

// Dev-only probes (render/registry) live in their OWN source set: they are compiled against the
// plugin + platform for the probe tasks, but never packaged into the plugin jar.
val probes: SourceSet = sourceSets.create("probes") {
    compileClasspath += sourceSets.main.get().output + sourceSets.main.get().compileClasspath
    runtimeClasspath += output + compileClasspath
}

// Dev-only: exercise the app-registry client (entry URL, fetch/parse, version gate) headlessly.
tasks.register<JavaExec>("registryProbe") {
    classpath = probes.output + probes.compileClasspath
    mainClass.set("io.mateu.ijp.debug.RegistryProbeKt")
}

// Dev-only: render a captured UIIncrement JSON through the real pipeline without booting an IDE —
// prints the resulting Swing tree and writes a PNG. See io.mateu.ijp.debug.RenderProbe.
tasks.register<JavaExec>("renderProbe") {
    // The intellij-platform plugin wires the IDE jars into compileClasspath only, so compose the
    // exec classpath from output + compileClasspath (runtimeClasspath lacks the platform).
    classpath = probes.output + probes.compileClasspath
    mainClass.set("io.mateu.ijp.debug.RenderProbeKt")
    (findProperty("probe.json") as String?)?.let { systemProperty("probe.json", it) }
    (findProperty("probe.png") as String?)?.let { systemProperty("probe.png", it) }
    (findProperty("probe.nativeToolbar") as String?)?.let { systemProperty("probe.nativeToolbar", it) }
    (findProperty("probe.followUp") as String?)?.let { systemProperty("probe.followUp", it) }
    // Without this the nested loads (a routed component inside an app shell) go to the default
    // backend and silently render nothing — the probe then reports an app shell with no content.
    (findProperty("probe.baseUrl") as String?)?.let { systemProperty("probe.baseUrl", it) }
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
        "--add-opens=java.desktop/javax.swing.plaf.basic=ALL-UNNAMED",
        "--add-opens=java.desktop/com.apple.laf=ALL-UNNAMED",
    )
    // JBScrollPane's macOS scroll bars load JNA, whose native dispatch library ships in the IDE's
    // lib/jna/<arch> folder (not inside the jna jar) — point JNA at it or every scrollable screen dies
    // with UnsatisfiedLinkError on a Mac.
    doFirst {
        val ideLib = classpath.files.firstOrNull { it.name == "app-client.jar" }?.parentFile
        val jnaDir = ideLib?.resolve("jna")?.listFiles()?.firstOrNull { it.isDirectory }
        if (jnaDir != null) jvmArgs("-Djna.boot.library.path=${jnaDir.absolutePath}", "-Djna.nosys=true")
    }
}

// The suite runs HEADLESS everywhere, as it does in CI: with a display (a developer's Mac) Swing
// picks the platform look-and-feel, headless it falls back to Metal, whose composites carry extra
// buttons (a combo box's arrow, a scroll bar's arrows). A11y assertions that passed on a Mac failed
// on the Linux runner; one environment for both removes that class of "works on my machine".
tasks.test {
    jvmArgs("-Djava.awt.headless=true")
    // Opt-in LIVE probes against a running backend (AgentPushLiveProbeTest): -Pmateu.live.baseUrl=…
    for (key in listOf("mateu.live.baseUrl", "mateu.live.route")) {
        (findProperty(key) as String?)?.let { systemProperty(key, it) }
    }
    // a live run must not be answered from the cache of a run without (or against another) backend
    inputs.property("mateuLiveBaseUrl", (findProperty("mateu.live.baseUrl") as String?) ?: "")
    // ConformanceCorpusRenderTest reads the repo's corpus at run time: declare it, or a cached test
    // result outlives a change to the cases.
    inputs.dir(rootProject.file("../../../conformance/cases"))
        .withPropertyName("conformanceCorpus").withPathSensitivity(PathSensitivity.RELATIVE)
}
