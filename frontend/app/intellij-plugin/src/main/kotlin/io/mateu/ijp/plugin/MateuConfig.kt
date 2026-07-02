package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import java.util.Properties

/** Backend connection config, read from `application.properties` on the plugin classpath. */
data class MateuConfig(val baseUrl: String, val route: String, val config: Map<String, Any?>)

fun loadMateuConfig(): MateuConfig {
    val props = Properties()
    MateuConfig::class.java.getResourceAsStream("/application.properties")?.use { props.load(it) }
    val baseUrl = props.getProperty("mateu.baseUrl", "http://localhost:8080")
    val route = props.getProperty("mateu.route", "/")
    val config = parseConfig(props.getProperty("mateu.config", "{}"))
    return MateuConfig(baseUrl, route, config)
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
