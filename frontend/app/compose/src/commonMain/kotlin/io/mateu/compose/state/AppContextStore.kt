package io.mateu.compose.state

/**
 * Persistence of the application-level context (@AppContext header selectors), keyed per backend
 * baseUrl — the native analogue of the web renderers' localStorage entry. Values are plain
 * strings (the selected option values).
 */
expect fun loadPersistedAppContext(baseUrl: String): Map<String, String>

expect fun persistAppContext(baseUrl: String, context: Map<String, String>)
