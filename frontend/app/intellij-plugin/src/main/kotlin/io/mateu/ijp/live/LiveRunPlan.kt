package io.mateu.ijp.live

import java.io.File

/**
 * How to launch a project's Mateu app in DEVELOPMENT MODE (live reload) — pure, so it is unit-tested
 * without an IDE: which framework the build declares, the command that starts it with the JVM
 * debug agent listening (so the IDE can attach and HotSwap), and the dev-mode switches.
 *
 * Dev mode is passed BOTH as a system property and as environment variables (`MATEU_DEV`,
 * `MATEU_DEV_SPECS_DIR`): every adapter reads the environment through its own configuration
 * (Spring relaxed binding, MicroProfile Config, Micronaut), so it reaches the app whatever forks the
 * JVM in between (Maven's spring-boot:run, quarkus:dev, mn:run, a Gradle daemon).
 */
data class LiveRunPlan(
    val framework: Framework,
    val command: List<String>,
    val environment: Map<String, String>,
    /** The JDWP port the IDE attaches its debugger to. */
    val debugPort: Int,
    /** Where the app answers once it is up. */
    val appUrl: String,
    val workDir: File,
)

enum class Framework(val label: String) {
    SPRING_BOOT("Spring Boot"),
    QUARKUS("Quarkus"),
    MICRONAUT("Micronaut"),
    HELIDON("Helidon"),
    UNKNOWN("unknown"),
}

enum class BuildTool { MAVEN, GRADLE }

const val DEBUG_PORT = 5005

/** The framework a build file declares (first match wins; Spring Boot is the most common). */
fun frameworkOf(buildFile: String): Framework = when {
    "quarkus-maven-plugin" in buildFile || "io.quarkus" in buildFile -> Framework.QUARKUS
    "micronaut-maven-plugin" in buildFile || "io.micronaut.application" in buildFile ||
        "micronaut-parent" in buildFile -> Framework.MICRONAUT
    "helidon" in buildFile -> Framework.HELIDON
    "spring-boot" in buildFile || "org.springframework.boot" in buildFile -> Framework.SPRING_BOOT
    else -> Framework.UNKNOWN
}

/** The HTTP port the app is configured with (application.properties / yaml), else the default. */
fun portOf(framework: Framework, properties: String): Int {
    val keys = when (framework) {
        Framework.QUARKUS -> listOf("quarkus.http.port")
        Framework.MICRONAUT -> listOf("micronaut.server.port")
        Framework.HELIDON -> listOf("server.port")
        else -> listOf("server.port")
    }
    for (key in keys) {
        Regex("^\\s*" + Regex.escape(key) + "\\s*[=:]\\s*(\\d+)\\s*$", RegexOption.MULTILINE)
            .find(properties)?.let { return it.groupValues[1].toInt() }
    }
    return 8080
}

/** The specs directories of the project: every `src/main/resources/specs/ui` under [root]. */
fun specsDirsOf(root: File, maxDepth: Int = 4): List<File> =
    root.walkTopDown()
        .maxDepth(maxDepth + 4)
        .onEnter { it.name !in setOf("node_modules", "target", "build", ".git", ".idea", "out") }
        .filter { it.isDirectory && it.path.replace('\\', '/').endsWith("src/main/resources/specs/ui") }
        .toList()

/**
 * The launch plan for the app module at [moduleDir]. [buildFile] is the content of its pom.xml /
 * build.gradle(.kts); [properties] that of its application.properties (or empty).
 */
fun liveRunPlan(
    moduleDir: File,
    buildTool: BuildTool,
    buildFile: String,
    properties: String,
    specsDirs: List<File>,
    isWindows: Boolean = System.getProperty("os.name", "").lowercase().contains("win"),
): LiveRunPlan {
    val framework = frameworkOf(buildFile)
    val specs = specsDirs.joinToString(",") { it.absolutePath }
    val devProps = buildList {
        add("-Dmateu.dev=true")
        if (specs.isNotEmpty()) add("-Dmateu.dev.specs-dir=$specs")
    }
    val agent = "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:$DEBUG_PORT"
    val mvn = if (isWindows) "mvn.cmd" else "mvn"
    val gradle = if (isWindows) "gradlew.bat" else "./gradlew"
    val command = when (buildTool) {
        BuildTool.MAVEN -> when (framework) {
            // quarkus:dev listens for a debugger on 5005 by default and live-reloads Java itself
            Framework.QUARKUS -> listOf(mvn, "quarkus:dev") + devProps
            Framework.MICRONAUT -> listOf(mvn, "mn:run", "-Dmn.debug=true", "-Dmn.debug.port=$DEBUG_PORT",
                "-Dmn.watch=true", "-Dmn.appArgs=${devProps.joinToString(" ")}")
            Framework.HELIDON -> listOf(mvn, "exec:exec", "-Dexec.executable=java",
                "-Dexec.args=$agent ${devProps.joinToString(" ")} -classpath %classpath io.helidon.microprofile.cdi.Main")
            else -> listOf(mvn, "spring-boot:run",
                "-Dspring-boot.run.jvmArguments=$agent ${devProps.joinToString(" ")}")
        }
        BuildTool.GRADLE -> when (framework) {
            Framework.QUARKUS -> listOf(gradle, "quarkusDev") + devProps
            Framework.MICRONAUT -> listOf(gradle, "run", "--continuous")
            else -> listOf(gradle, "bootRun", "--debug-jvm")
        }
    }
    val environment = buildMap {
        put("MATEU_DEV", "true")
        if (specs.isNotEmpty()) put("MATEU_DEV_SPECS_DIR", specs)
        // Gradle's bootRun/run fork without the Maven-side switches: the agent goes through the env
        if (buildTool == BuildTool.GRADLE && framework == Framework.MICRONAUT) put("JAVA_TOOL_OPTIONS", agent)
    }
    return LiveRunPlan(
        framework = framework,
        command = command,
        environment = environment,
        debugPort = DEBUG_PORT,
        appUrl = "http://localhost:${portOf(framework, properties)}",
        workDir = moduleDir,
    )
}

/** Reads the module at [moduleDir] from disk and builds its plan (null when it has no build file). */
fun liveRunPlanOf(moduleDir: File, projectRoot: File): LiveRunPlan? {
    val pom = File(moduleDir, "pom.xml")
    val gradle = listOf("build.gradle.kts", "build.gradle").map { File(moduleDir, it) }.firstOrNull { it.isFile }
    val (tool, build) = when {
        pom.isFile -> BuildTool.MAVEN to pom.readText()
        gradle != null -> BuildTool.GRADLE to gradle.readText()
        else -> return null
    }
    val props = listOf("application.properties", "application.yml", "application.yaml")
        .map { File(moduleDir, "src/main/resources/$it") }
        .firstOrNull { it.isFile }?.readText() ?: ""
    return liveRunPlan(moduleDir, tool, build, props, specsDirsOf(projectRoot))
}

/** Whether a build file declares a runnable app (not just a library that depends on a framework). */
fun declaresRunnableApp(fileName: String, text: String): Boolean =
    if (fileName == "pom.xml") {
        "spring-boot-maven-plugin" in text || "quarkus-maven-plugin" in text ||
            "micronaut-maven-plugin" in text || "io.helidon.applications" in text
    } else {
        "org.springframework.boot" in text || "io.quarkus" in text || "io.micronaut.application" in text
    }

/**
 * The module to run: the one whose build declares a runnable app (a Spring Boot / Quarkus /
 * Micronaut / Helidon plugin), nearest to [root] first; [root] itself when nothing more specific.
 */
fun appModuleOf(root: File): File {
    val candidates = root.walkTopDown()
        .maxDepth(4)
        .onEnter { it.name !in setOf("node_modules", "target", "build", ".git", ".idea", "out", "src") }
        .filter { it.isFile && (it.name == "pom.xml" || it.name.startsWith("build.gradle")) }
        .filter { file -> declaresRunnableApp(file.name, file.readText()) }
        .map { it.parentFile }
        .sortedBy { it.absolutePath.length }
        .toList()
    return candidates.firstOrNull() ?: root
}
