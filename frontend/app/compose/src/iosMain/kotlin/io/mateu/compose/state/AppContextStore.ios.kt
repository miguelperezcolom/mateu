package io.mateu.compose.state

import platform.Foundation.NSUserDefaults

private fun key(baseUrl: String) = "mateu-app-context:" + baseUrl

@Suppress("UNCHECKED_CAST")
actual fun loadPersistedAppContext(baseUrl: String): Map<String, String> =
    (NSUserDefaults.standardUserDefaults.dictionaryForKey(key(baseUrl)) as? Map<String, String>) ?: emptyMap()

actual fun persistAppContext(baseUrl: String, context: Map<String, String>) {
    NSUserDefaults.standardUserDefaults.setObject(context as Map<Any?, *>, forKey = key(baseUrl))
}
