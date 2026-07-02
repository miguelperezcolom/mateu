package io.mateu.compose.ui.desktop

import androidx.compose.runtime.Composable
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.*
import org.jetbrains.jewel.ui.component.DefaultButton
import org.jetbrains.jewel.ui.component.OutlinedButton
import org.jetbrains.jewel.ui.component.Text

/**
 * Renders a button from any of Mateu's button-ish DTO shapes (ButtonDto uses `actionId`,
 * ActionDto uses `id`). `primary` maps to Jewel's [DefaultButton]; otherwise [OutlinedButton].
 */
@Composable
fun MateuButton(node: JsonNode, app: AppState, forcePrimary: Boolean = false) {
    val actionId = node.text("actionId", node.text("id"))
    val label = node.text("label", actionId)
    val primary = forcePrimary || node.text("buttonStyle").equals("Primary", ignoreCase = true)
    val enabled = !node.bool("disabled")
    if (primary) {
        DefaultButton(onClick = { app.runAction(actionId, null) }, enabled = enabled) { Text(label) }
    } else {
        OutlinedButton(onClick = { app.runAction(actionId, null) }, enabled = enabled) { Text(label) }
    }
}
