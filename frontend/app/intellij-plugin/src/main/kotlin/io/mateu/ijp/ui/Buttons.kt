package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import javax.swing.JButton
import javax.swing.JComponent

/**
 * A Mateu button DTO → a Swing [JButton]. `actionId` (fallback `id`), `label` (fallback actionId),
 * `buttonStyle == "Primary"` → default button, `disabled`. Click dispatches through
 * [AppContext.runAction], passing the button's wire `parameters` (e.g. the conflict dialog's
 * keep-mine/keep-theirs buttons) into the action.
 */
fun renderButton(ctx: AppContext, metadata: JsonNode): JComponent {
    val id = metadata.text("id")
    val actionId = metadata.text("actionId", id)
    val label = metadata.text("label", actionId)
    val button = JButton(label)
    button.isEnabled = !metadata.bool("disabled")
    if (metadata.text("buttonStyle").equals("Primary", ignoreCase = true)) {
        button.putClientProperty("gotItButton", true)
        button.putClientProperty("JButton.buttonType", "default")
    }
    val parameters = ctx.jsonToParams(metadata.path("parameters"))
    button.addActionListener { ctx.runAction(actionId, parameters.ifEmpty { null }) }
    return button
}
