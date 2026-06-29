package io.mateu.compose

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.MateuApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val scope = rememberCoroutineScope()
            // The Android emulator reaches the host machine's localhost at 10.0.2.2.
            val app = remember { AppState(baseUrl = "http://10.0.2.2:8592", scope = scope) }
            MateuApp(app, route = "/")
        }
    }
}
