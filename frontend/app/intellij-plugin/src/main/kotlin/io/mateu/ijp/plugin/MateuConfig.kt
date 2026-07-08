package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import java.util.Properties

/** Backend connection config, read from `application.properties` on the plugin classpath.
 *  [focused] = hide the IDE's own chrome (Project/Structure/Services/VCS tool windows, the VCS
 *  toolbar widget…) so the IDE acts as a clean shell for the Mateu app; set `mateu.focused=false`
 *  to keep the full IDE. */
data class MateuConfig(val baseUrl: String, val route: String, val config: Map<String, Any?>, val focused: Boolean)

fun loadMateuConfig(): MateuConfig {
    val props = Properties()
    MateuConfig::class.java.getResourceAsStream("/application.properties")?.use { props.load(it) }
    val baseUrl = props.getProperty("mateu.baseUrl", "http://localhost:8080")
    val route = props.getProperty("mateu.route", "/")
    val config = parseConfig(props.getProperty("mateu.config", "{}"))
    val focused = props.getProperty("mateu.focused", "true").toBoolean()
    return MateuConfig(baseUrl, route, config, focused)
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
