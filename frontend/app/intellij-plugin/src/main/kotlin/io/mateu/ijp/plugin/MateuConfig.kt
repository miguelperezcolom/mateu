package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.project.Project
import java.util.Properties

/** Backend connection config — the EFFECTIVE values, resolved by [resolveMateuConfig].
 *  [focused] = hide the IDE's own chrome (Project/Structure/Services/VCS tool windows, the VCS
 *  toolbar widget…) so the IDE acts as a clean shell for the Mateu app; only the standalone desktop
 *  distribution turns it on (`-Dmateu.focused=true`). */
data class MateuConfig(
    val baseUrl: String,
    val route: String,
    val config: Map<String, Any?>,
    val focused: Boolean,
    /** Product name shown as the window/frame title base in the standalone distribution. */
    val productName: String,
    /** App-registry coordinates: when both are set the plugin resolves baseUrl/parameters from the
     *  registry at boot (and enforces the required plugin/IDE versions) instead of using [baseUrl]. */
    val registryUrl: String?,
    val appId: String?,
    /** True when SOMETHING explicitly points this project at a Mateu backend (settings, -D, a bundled
     *  registry, or the standalone distribution). Only then does the plugin boot an app, take the
     *  frame title or show its tool windows/toolbar widget — otherwise it defers to the platform. */
    val configured: Boolean,
) {
    /** The standalone desktop distribution (IntelliJ rebranded as "Mateu"), not a developer's IDE. */
    val standalone: Boolean get() = focused
}

/** The single default backend for a configured project that names no base URL (Spring Boot's port). */
const val DEFAULT_BASE_URL = "http://localhost:8080"

/** Effective config for [project]: `-D` system properties > project settings (Settings | Tools |
 *  Mateu) > the bundled `application.properties` > defaults. */
fun loadMateuConfig(project: Project? = null): MateuConfig = resolveMateuConfig(
    system = System::getProperty,
    settings = project?.let { runCatching { MateuSettings.getInstance(it).state }.getOrNull() },
    bundled = bundledProperties(),
)

/** Pure resolution (unit-tested): see [loadMateuConfig] for the precedence. */
fun resolveMateuConfig(
    system: (String) -> String?,
    settings: MateuSettings.State?,
    bundled: Properties,
): MateuConfig {
    fun sys(key: String): String? = system(key)?.trim()?.ifBlank { null }
    fun bundle(key: String): String? = bundled.getProperty(key)?.trim()?.ifBlank { null }
    fun pick(key: String, fromSettings: String?): String? =
        sys(key) ?: fromSettings?.trim()?.ifBlank { null } ?: bundle(key)

    val baseUrl = pick("mateu.baseUrl", settings?.baseUrl)
    val registryUrl = pick("mateu.registryUrl", settings?.registryUrl)
    val appId = pick("mateu.appId", settings?.appId)
    val route = pick("mateu.route", settings?.route) ?: "/"
    val focused = (sys("mateu.focused") ?: bundle("mateu.focused") ?: "false").toBoolean()
    val productName = sys("mateu.productName") ?: bundle("mateu.productName") ?: "Mateu"
    val config = parseConfig(sys("mateu.config") ?: bundle("mateu.config") ?: "{}")
    val configured = focused || baseUrl != null || (registryUrl != null && appId != null)
    return MateuConfig(
        baseUrl = (baseUrl ?: DEFAULT_BASE_URL).trimEnd('/'),
        route = route,
        config = config,
        focused = focused,
        productName = productName,
        registryUrl = registryUrl,
        appId = appId,
        configured = configured,
    )
}

/** Which keys are currently forced by `-D` (the settings page shows them as overridden). */
fun systemOverrides(system: (String) -> String? = System::getProperty): List<String> =
    listOf("mateu.baseUrl", "mateu.route", "mateu.registryUrl", "mateu.appId", "mateu.token")
        .filter { !system(it).isNullOrBlank() }

private fun bundledProperties(): Properties = Properties().apply {
    MateuConfig::class.java.getResourceAsStream("/application.properties")?.use { load(it) }
}

private fun parseConfig(json: String): Map<String, Any?> = try {
    if (json.isBlank()) {
        emptyMap()
    } else {
        @Suppress("UNCHECKED_CAST")
        ObjectMapper().readValue(json, Map::class.java) as Map<String, Any?>
    }
} catch (e: Exception) {
    System.err.println("[Mateu] invalid mateu.config: ${e.message}")
    emptyMap()
}
