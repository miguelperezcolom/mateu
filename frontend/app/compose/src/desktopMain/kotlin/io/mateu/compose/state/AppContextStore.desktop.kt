package io.mateu.compose.state

import java.io.File
import java.util.Properties

private fun file(baseUrl: String) = File(
    System.getProperty("user.home"),
    ".mateu-compose-appcontext-" + baseUrl.hashCode().toUInt().toString(16) + ".properties",
)

actual fun loadPersistedAppContext(baseUrl: String): Map<String, String> = try {
    val props = Properties()
    file(baseUrl).takeIf { it.exists() }?.inputStream()?.use { props.load(it) }
    props.entries.associate { it.key.toString() to it.value.toString() }
} catch (e: Exception) {
    emptyMap()
}

actual fun persistAppContext(baseUrl: String, context: Map<String, String>) {
    try {
        val props = Properties()
        context.forEach { (k, v) -> props[k] = v }
        file(baseUrl).outputStream().use { props.store(it, "Mateu app context") }
    } catch (e: Exception) {
        // best-effort: the in-memory appState is already updated
    }
}
