package io.mateu.compose.state

// In-memory only for now: persisting on Android needs a Context (SharedPreferences), which this
// renderer's entry point doesn't thread through yet. The selection still applies for the session.
private val memory = HashMap<String, Map<String, String>>()

actual fun loadPersistedAppContext(baseUrl: String): Map<String, String> = memory[baseUrl] ?: emptyMap()

actual fun persistAppContext(baseUrl: String, context: Map<String, String>) {
    memory[baseUrl] = context
}
