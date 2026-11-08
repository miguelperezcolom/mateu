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
    val button = JButton(plain(label))
    // A label rendered as a glyph or an icon leaves the accessible name empty; setting it from
    // the wire label makes every Mateu button announce what it does, whatever it looks like.
    button.accessibleName(label)
    button.isEnabled = !metadata.bool("disabled")
    // A declared shortcut (`@Action(shortcut=…)`): an `alt+<letter>` one IS the button's access key
    // and reserves that letter; any other keeps its binding and takes no automatic letter.
    metadata.text("shortcut").takeIf { it.isNotBlank() }?.let { button.putClientProperty(AccessKeys.SHORTCUT_PROPERTY, it) }
    // The page's primary action gets the platform's DEFAULT-button look (the filled accent button).
    // It used to set "gotItButton" — the Got It tooltip style, dark-on-dark grey under the light
    // theme (the welcome page's "Start check-in" was unreadable) and plain under Darcula.
    if (isPrimary(metadata)) markPrimary(button)
    // A button carrying a `route` (a RouteLink — YAML toolbars, "Back to People") NAVIGATES; its
    // actionId is only the label's echo, and sending it answered 403.
    val route = metadata.text("route")
    val parameters = ctx.jsonToParams(metadata.path("parameters"))
    button.addActionListener {
        if (route.isNotBlank()) ctx.openRoute(route) else ctx.runAction(actionId, parameters.ifEmpty { null })
    }
    return button
}

internal fun isPrimary(metadata: JsonNode) = metadata.text("buttonStyle").equals("Primary", ignoreCase = true)

/** The platform's default-button style (DarculaButtonUI reads this key), without making it the
 *  root pane's default — Enter in a field must not fire a page action. */
internal fun markPrimary(button: JButton) {
    button.putClientProperty(com.intellij.ide.ui.laf.darcula.ui.DarculaButtonUI.DEFAULT_STYLE_KEY, true)
}
