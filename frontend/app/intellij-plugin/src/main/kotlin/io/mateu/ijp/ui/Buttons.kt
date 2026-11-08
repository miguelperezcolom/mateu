package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JMenuItem
import javax.swing.JPopupMenu

/**
 * A Mateu button DTO → a Swing [JButton]. `actionId` (fallback `id`), `label` (fallback actionId),
 * `buttonStyle == "Primary"` → default button, `disabled`. Click dispatches through
 * [AppContext.runAction], passing the button's wire `parameters` (e.g. the conflict dialog's
 * keep-mine/keep-theirs buttons) into the action.
 */
fun renderButton(ctx: AppContext, metadata: JsonNode): JComponent {
    if (isButtonGroup(metadata)) return renderButtonGroup(ctx, metadata)
    val id = metadata.text("id")
    val actionId = metadata.text("actionId", id)
    val label = metadata.text("label", actionId)
    val button = JButton(plain(label))
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

/** Client property of a group's trigger holding its menu (the popup is not a child of the trigger). */
const val BUTTON_GROUP_MENU = "mateu.buttonGroupMenu"

/**
 * A ButtonGroup placed in CONTENT travels as a Button carrying its buttons as `children`, with no
 * action of its own (the toolbar group's shape) — before, it drew as one button that did nothing.
 */
fun isButtonGroup(metadata: JsonNode): Boolean =
    metadata.path("children").let { it.isArray && it.size() > 0 } && metadata.text("actionId").isBlank()

/** The group → a "label ▾" button opening a menu of its buttons, each running its own action. */
private fun renderButtonGroup(ctx: AppContext, metadata: JsonNode): JComponent {
    val label = metadata.text("label")
    val trigger = JButton(plain("$label ▾"))
    trigger.accessibleName(label)
    val menu = JPopupMenu(label)
    for (child in metadata.path("children")) {
        val childAction = child.text("actionId", child.text("id"))
        val item = JMenuItem(plain(child.text("label", childAction)))
        item.isEnabled = !child.bool("disabled")
        val parameters = ctx.jsonToParams(child.path("parameters"))
        item.addActionListener { ctx.runAction(childAction, parameters.ifEmpty { null }) }
        menu.add(item)
    }
    trigger.putClientProperty(BUTTON_GROUP_MENU, menu)
    trigger.isEnabled = !metadata.bool("disabled")
    trigger.addActionListener { menu.show(trigger, 0, trigger.height) }
    return trigger
}
