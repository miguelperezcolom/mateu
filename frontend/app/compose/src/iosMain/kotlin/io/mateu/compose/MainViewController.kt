package io.mateu.compose

import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.window.ComposeUIViewController
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.MateuApp
import platform.UIKit.UIViewController

/**
 * iOS entry point, referenced from the Xcode app (`iosApp/`). The simulator reaches the Mac's
 * localhost directly; for a physical device, point `baseUrl` at the Mac's LAN IP.
 */
fun MainViewController(): UIViewController = ComposeUIViewController {
    val scope = rememberCoroutineScope()
    val app = remember { AppState(baseUrl = "http://localhost:8592", scope = scope) }
    MateuApp(app, route = "/")
}
