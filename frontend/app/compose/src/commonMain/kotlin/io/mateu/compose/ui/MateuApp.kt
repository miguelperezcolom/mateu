package io.mateu.compose.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import io.mateu.compose.state.AppState

/**
 * The whole Mateu UI, platform-agnostic. Each platform entry point (desktop `Window`, Android
 * `Activity`, iOS `ComposeUIViewController`) creates the [AppState] and hosts this composable.
 */
@Composable
fun MateuApp(app: AppState, route: String) {
    MateuTheme {
        val snackbar = remember { SnackbarHostState() }
        val message by app.message

        LaunchedEffect(message) {
            message?.let {
                snackbar.showSnackbar(it.text)
                app.message.value = null
            }
        }

        Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                val root = app.root.value
                if (root != null) {
                    RenderComponent(root.component, root.state, root.data, app)
                }
            }
        }

        LaunchedEffect(Unit) { app.initialLoad(route) }
    }
}
