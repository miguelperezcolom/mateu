package io.mateu.compose

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.desktop.MateuAppJewel
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import org.jetbrains.jewel.intui.standalone.theme.IntUiTheme
import java.util.Properties

private data class Config(
    val baseUrl: String,
    val route: String,
    val appState: Map<String, Any?>,
    val windowMode: String,
)

private fun loadConfig(): Config {
    val props = Properties()
    object {}.javaClass.getResourceAsStream("/application.properties")?.use { props.load(it) }
    // A system property overrides the file, so `-Dmateu.windowMode=mobile` flips it without editing.
    fun prop(key: String, def: String) = System.getProperty(key) ?: props.getProperty(key, def)
    val baseUrl = prop("mateu.baseUrl", "http://localhost:8080")
    val route = prop("mateu.route", "/")
    val windowMode = prop("mateu.windowMode", "desktop")
    val configJson = prop("mateu.config", "{}")
    // Seed appState with the raw JsonElement values; MateuApiClient serializes them back verbatim.
    val appState = runCatching {
        Json.parseToJsonElement(configJson).jsonObject.toMap()
    }.getOrDefault(emptyMap())
    return Config(baseUrl, route, appState, windowMode)
}

fun main() = application {
    val config = remember { loadConfig() }
    val scope = rememberCoroutineScope()
    val app = remember { AppState(config.baseUrl, scope).apply { appState.putAll(config.appState) } }

    // "mobile" sizes the window to a phone form factor so the responsive layout shows its mobile UI
    // (same Compose code that a real Android/iOS target would run).
    val mobile = config.windowMode.equals("mobile", ignoreCase = true)
    val title by app.windowTitle
    // Wrap the whole window in Jewel's IntelliJ (Int UI) theme so the desktop renderer draws with
    // Jewel components. A plain Compose Window is used (not Jewel's DecoratedWindow) because the
    // latter requires the JetBrains Runtime; Jewel's widgets themselves work in any Window.
    IntUiTheme(isDark = isSystemInDarkTheme(), swingCompatMode = false) {
        Window(
            onCloseRequest = ::exitApplication,
            title = if (mobile) "$title (mobile)" else title,
            state = rememberWindowState(
                width = if (mobile) 390.dp else 1280.dp,
                height = if (mobile) 844.dp else 800.dp,
            ),
        ) {
            MateuAppJewel(app, config.route)
        }
    }
}
