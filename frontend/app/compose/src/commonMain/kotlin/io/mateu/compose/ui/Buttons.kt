package io.mateu.compose.ui

import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import io.mateu.compose.state.AppState

/**
 * Renders a button from any of Mateu's button-ish DTO shapes (ButtonDto uses `actionId`,
 * ActionDto uses `id`). `primary` is honoured via `buttonStyle == "Primary"`.
 */
@Composable
fun MateuButton(node: JsonNode, app: AppState, forcePrimary: Boolean = false) {
    val actionId = node.text("actionId", node.text("id"))
    val label = node.text("label", actionId)
    val primary = forcePrimary || node.text("buttonStyle").equals("Primary", ignoreCase = true)
    val enabled = !node.bool("disabled")
    if (primary) {
        Button(onClick = { app.runAction(actionId, null) }, enabled = enabled) { Text(label) }
    } else {
        OutlinedButton(onClick = { app.runAction(actionId, null) }, enabled = enabled) { Text(label) }
    }
}
