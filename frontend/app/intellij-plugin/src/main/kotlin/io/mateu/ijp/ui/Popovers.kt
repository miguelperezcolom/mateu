package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Component
import java.awt.Container
import java.awt.event.FocusAdapter
import java.awt.event.FocusEvent
import java.awt.event.KeyAdapter
import java.awt.event.KeyEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.Popup
import javax.swing.PopupFactory
import javax.swing.SwingUtilities
import javax.swing.Timer
import javax.swing.UIManager

/**
 * Hover details: the `Popover` component and the listing cells' `tooltipPath`.
 *
 * The pure parts ([Popovers.triggerOf], [Popovers.cellTooltipText], [Popovers.tooltipHtml]) carry
 * the rules and are unit-tested; [renderPopover] is the Swing wiring.
 */
object Popovers {

    enum class Trigger { CLICK, HOVER }

    /** The wire's `trigger` ("click" — the default — or "hover"). */
    fun triggerOf(metadata: JsonNode): Trigger =
        if (metadata.text("trigger").equals("hover", ignoreCase = true)) Trigger.HOVER else Trigger.CLICK

    /**
     * The text a listing cell shows on hover: the row's `tooltipPath` field (a dot path), or null
     * when the column declares none or the field is empty.
     */
    fun cellTooltipText(row: JsonNode?, tooltipPath: String?): String? {
        if (row == null || tooltipPath.isNullOrBlank()) return null
        var node: JsonNode = row
        for (step in tooltipPath.trim().split('.')) {
            node = node.path(step)
            if (node.isMissingNode || node.isNull) return null
        }
        val text = when {
            node.isValueNode -> node.asText()
            node.has("message") -> node.path("message").asText()
            node.has("value") -> node.path("value").asText()
            else -> node.toString()
        }
        return text.ifBlank { null }
    }

    /** Multi-line text as a Swing HTML tooltip: escaped, each line break a `<br>`. */
    fun tooltipHtml(text: String?): String? {
        if (text.isNullOrBlank()) return null
        val escaped = text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\r\n", "\n")
            .replace("\n", "<br>")
        return "<html>$escaped</html>"
    }
}

/**
 * A popover: the wrapped component, and its content in a small floating panel (a lightweight
 * [Popup]) under it.
 *
 *  - `trigger: "click"` (default): clicking the wrapped component — or Enter/Space while it has the
 *    focus — toggles the panel.
 *  - `trigger: "hover"`: pointing at it shows the panel and leaving hides it (with a short grace
 *    so the pointer can travel onto the panel); keyboard users get it on FOCUS, like a tooltip.
 *
 * Esc always hides it. The wrapper is focusable so both triggers are reachable from the keyboard.
 */
fun renderPopover(r: ComponentRenderer, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val trigger = Popovers.triggerOf(metadata)
    val wrapped = r.render(metadata.path("wrapped"), state, data)
    val host = JPanel(BorderLayout())
    host.isOpaque = false
    host.add(wrapped, BorderLayout.CENTER)
    host.isFocusable = true
    host.accessibleDescription(
        if (trigger == Popovers.Trigger.HOVER) "Details show on focus or hover" else "Press Enter for details",
    )

    var popup: Popup? = null
    var panel: JComponent? = null

    // Grace before hiding a hover popover, so the pointer can move from the trigger onto the panel.
    val hideLater = Timer(250) { popup?.hide(); popup = null }.apply { isRepeats = false }
    // While the pointer is on the panel itself, a hover popover stays open.
    val onPanel = object : MouseAdapter() {
        override fun mouseEntered(e: MouseEvent) = hideLater.stop()
        override fun mouseExited(e: MouseEvent) {
            if (trigger == Popovers.Trigger.HOVER && !host.isFocusOwner) hideLater.restart()
        }
    }

    fun hide() {
        popup?.hide()
        popup = null
    }

    fun show() {
        if (popup != null || !host.isShowing) return
        val content = panel ?: r.render(metadata.path("content"), state, data).let { c ->
            JPanel(BorderLayout()).apply {
                add(c, BorderLayout.CENTER)
                border = JBUI.Borders.compound(
                    JBUI.Borders.customLine(UIManager.getColor("Component.borderColor") ?: java.awt.Color.GRAY),
                    JBUI.Borders.empty(8),
                )
                background = UIManager.getColor("ToolTip.background") ?: background
                addMouseListener(onPanel)
            }
        }.also { panel = it }
        val at = host.locationOnScreen
        popup = PopupFactory.getSharedInstance().getPopup(host, content, at.x, at.y + host.height + JBUI.scale(2))
        popup?.show()
    }

    val mouse = object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (trigger == Popovers.Trigger.CLICK) {
                host.requestFocusInWindow()
                if (popup == null) show() else hide()
            }
        }

        override fun mouseEntered(e: MouseEvent) {
            if (trigger == Popovers.Trigger.HOVER) { hideLater.stop(); show() }
        }

        override fun mouseExited(e: MouseEvent) {
            if (trigger == Popovers.Trigger.HOVER && !host.isFocusOwner) hideLater.restart()
        }
    }
    // Mouse events go to the deepest component listening, so the wrapped subtree listens too.
    fun listen(c: Component) {
        c.addMouseListener(mouse)
        if (c is Container) c.components.forEach(::listen)
    }
    listen(host)

    host.addFocusListener(object : FocusAdapter() {
        override fun focusGained(e: FocusEvent) {
            if (trigger == Popovers.Trigger.HOVER) show()
        }

        override fun focusLost(e: FocusEvent) = hide()
    })
    host.addKeyListener(object : KeyAdapter() {
        override fun keyPressed(e: KeyEvent) {
            when (e.keyCode) {
                KeyEvent.VK_ESCAPE -> if (popup != null) { hide(); e.consume() }
                KeyEvent.VK_ENTER, KeyEvent.VK_SPACE ->
                    if (trigger == Popovers.Trigger.CLICK) { if (popup == null) show() else hide(); e.consume() }
            }
        }
    })
    // Never leave a floating panel behind when the host leaves the screen (navigation, re-render).
    host.addHierarchyListener { e ->
        if (e.changeFlags and java.awt.event.HierarchyEvent.SHOWING_CHANGED.toLong() != 0L && !host.isShowing) {
            SwingUtilities.invokeLater { hide() }
        }
    }
    return host
}
