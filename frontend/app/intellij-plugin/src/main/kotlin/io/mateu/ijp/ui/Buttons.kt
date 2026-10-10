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
    // A label rendered as a glyph or an icon leaves the accessible name empty; setting it from
    // the wire label makes every Mateu button announce what it does, whatever it looks like.
    button.accessibleName(label)
    button.isEnabled = !metadata.bool("disabled")
    // A declared shortcut (`@Action(shortcut=…)`): an `alt+<letter>` one IS the button's access key
    // and reserves that letter; any other keeps its binding and takes no automatic letter.
    metadata.text("shortcut").takeIf { it.isNotBlank() }?.let { button.putClientProperty(AccessKeys.SHORTCUT_PROPERTY, it) }
    if (metadata.text("buttonStyle").equals("Primary", ignoreCase = true)) {
        button.putClientProperty("gotItButton", true)
        button.putClientProperty("JButton.buttonType", "default")
    }
    val parameters = ctx.jsonToParams(metadata.path("parameters"))
    button.addActionListener { ctx.runAction(actionId, parameters.ifEmpty { null }) }
    return button
}
