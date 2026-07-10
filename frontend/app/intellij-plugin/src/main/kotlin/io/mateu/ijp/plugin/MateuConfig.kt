package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import java.util.Properties

/** Backend connection config, read from `application.properties` on the plugin classpath.
 *  [focused] = hide the IDE's own chrome (Project/Structure/Services/VCS tool windows, the VCS
 *  toolbar widget…) so the IDE acts as a clean shell for the Mateu app; set `mateu.focused=false`
 *  to keep the full IDE. */
data class MateuConfig(
    val baseUrl: String,
    val route: String,
    val config: Map<String, Any?>,
    val focused: Boolean,
    /** App-registry coordinates: when both are set the plugin resolves baseUrl/parameters from the
     *  registry at boot (and enforces the required plugin/IDE versions) instead of using [baseUrl]. */
    val registryUrl: String?,
    val appId: String?,
)

fun loadMateuConfig(): MateuConfig {
    val props = Properties()
    MateuConfig::class.java.getResourceAsStream("/application.properties")?.use { props.load(it) }
    // system properties override the bundled ones (useful in dev: ./gradlew runIde -Dmateu.registryUrl=…)
    fun prop(key: String, default: String? = null): String? =
        System.getProperty(key) ?: props.getProperty(key, default)
    val baseUrl = prop("mateu.baseUrl", "http://localhost:8080")!!
    val route = prop("mateu.route", "/")!!
    val config = parseConfig(prop("mateu.config", "{}")!!)
    val focused = prop("mateu.focused", "true")!!.toBoolean()
    val registryUrl = prop("mateu.registryUrl")?.ifBlank { null }
    val appId = prop("mateu.appId")?.ifBlank { null }
    return MateuConfig(baseUrl, route, config, focused, registryUrl, appId)
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
