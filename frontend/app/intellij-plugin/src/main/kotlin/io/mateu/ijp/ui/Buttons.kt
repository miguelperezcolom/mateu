package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.Expressions
import com.intellij.util.ui.JBUI
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
    val template = metadata.text("label", actionId)
    // `${state.x}` in a button's label is interpolated, and again on every edit (the web's label
    // follows the state; the desktop showed the raw "Charge ${state.nights} nights")
    val label = if (template.contains("\${")) Expressions.interpolate(template, PageChrome.exprContext(ctx, null)) else template
    val button = JButton(plain(label))
    if (template.contains("\${")) {
        button.putClientProperty(LABEL_TEMPLATE, template)
        ctx.registerLiveLabel(button)
    }
    styleButton(button, metadata)
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

/** Client property holding a button label's `${…}` template. */
const val LABEL_TEMPLATE = "mateu.labelTemplate"

/**
 * The wire's look of a button on Swing: `iconOnLeft` / `iconOnRight` (the IDE glyph, or a symbol),
 * `size` small / large (font and padding), `color` success / error / warning / contrast (the text in
 * that tone, a primary one filled with it) — every button was the same blue default.
 */
internal fun styleButton(button: JButton, metadata: JsonNode) {
    val (icon, text) = buttonFace(button.text, metadata.text("iconOnLeft"), metadata.text("iconOnRight"))
    if (icon != null) {
        button.icon = icon.first
        if (icon.second) button.horizontalTextPosition = javax.swing.SwingConstants.LEADING
    }
    if (text != button.text) button.text = text
    when (metadata.text("size").lowercase()) {
        "small" -> {
            button.font = button.font.deriveFont(button.font.size2D * 0.85f)
            button.putClientProperty("ActionToolbar.smallVariant", true)
            button.putClientProperty("JComponent.sizeVariant", "small")
        }
        "large" -> {
            button.font = button.font.deriveFont(button.font.size2D * 1.2f)
            button.putClientProperty("JComponent.sizeVariant", "large")
            button.margin = JBUI.insets(6, 16)
        }
    }
    val tone = when (metadata.text("color").lowercase()) {
        "success" -> ToneColors.Tone.SUCCESS
        "error", "danger" -> ToneColors.Tone.DANGER
        "warning" -> ToneColors.Tone.WARNING
        else -> null
    }
    if (tone != null) {
        val solid = ToneColors.solid(tone).first
        if (isPrimary(metadata)) {
            // a primary button in a tone is FILLED with it
            button.putClientProperty("JButton.backgroundColor", solid)
            button.putClientProperty("JButton.focusedBackgroundColor", solid)
            button.putClientProperty("JButton.borderColor", solid)
            button.putClientProperty("JButton.focusedBorderColor", solid)
            button.background = solid
            button.foreground = java.awt.Color.WHITE
        } else {
            button.foreground = solid
        }
        button.putClientProperty(BUTTON_TONE, tone.name)
    } else if (metadata.text("color").equals("contrast", ignoreCase = true)) {
        button.putClientProperty(BUTTON_TONE, "CONTRAST")
        button.font = button.font.deriveFont(java.awt.Font.BOLD)
    }
}

/**
 * A button's face from its label and its two icon tokens: the IDE glyph of ONE of them as the Swing
 * icon (left wins; `true` = after the text), and the text with the other side's symbol added — a
 * Swing button holds one icon, the web's holds both.
 */
internal fun buttonFace(text: String, left: String, right: String): Pair<Pair<javax.swing.Icon, Boolean>?, String> {
    var t = text
    var icon: Pair<javax.swing.Icon, Boolean>? = null
    if (left.isNotBlank()) {
        val i = wireIcon(left)
        if (i != null) icon = i to false else wireIconText(left)?.let { t = "$it $t" }
    }
    if (right.isNotBlank()) {
        val i = wireIcon(right)
        if (i != null && icon == null) icon = i to true
        else (wireIconText(right) ?: ARROW_GLYPHS[WireIcons.bareName(right)])?.let { t = "$t $it" }
    }
    return icon to t
}

private val ARROW_GLYPHS = mapOf(
    "arrow-right" to "→", "angle-right" to "›", "chevron-right" to "›",
    "arrow-left" to "←", "angle-left" to "‹", "chevron-left" to "‹",
    "arrow-up" to "↑", "arrow-down" to "↓",
)

/** Client property naming a button's tone (SUCCESS / DANGER / WARNING / CONTRAST), for tests and probes. */
const val BUTTON_TONE = "mateu.buttonTone"

internal fun isPrimary(metadata: JsonNode) = metadata.text("buttonStyle").equals("Primary", ignoreCase = true)

/** The platform's default-button style (DarculaButtonUI reads this key), without making it the
 *  root pane's default — Enter in a field must not fire a page action. */
internal fun markPrimary(button: JButton) {
    button.putClientProperty(com.intellij.ide.ui.laf.darcula.ui.DarculaButtonUI.DEFAULT_STYLE_KEY, true)
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
