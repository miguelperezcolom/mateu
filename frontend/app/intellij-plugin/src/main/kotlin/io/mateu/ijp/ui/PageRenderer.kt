package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.Font
import java.awt.FlowLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Page — port of the JavaFX `PageRenderer`. Header (title/subtitle + toolbar buttons), optional
 * banners, the body `children`, and a bottom button bar.
 */
fun renderPage(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val root = JPanel(BorderLayout(0, JBUI.scale(JBGap)))
    root.border = JBUI.Borders.empty(16)

    // Header (NORTH): title / subtitle / toolbar / banners.
    val header = verticalPanel(4)
    val title = metadata.text("title", metadata.text("pageTitle"))
    if (title.isNotBlank()) {
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD, 20f)
        header.addStacked(l, 4)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle)
        l.foreground = JBUI.CurrentTheme.Label.disabledForeground()
        header.addStacked(l, 8)
    }
    // Toolbar actions go to the native host toolbar (editor header / tool window title) when the
    // host provides one — the IntelliJ-idiomatic spot; otherwise render the inline button row.
    val toolbar = metadata.arr("toolbar")
    if (toolbar.isNotEmpty() && !r.ctx.publishToolbar(toolbar)) header.addStacked(buttonRow(r, toolbar), 8)
    for (banner in metadata.arr("banners")) header.addStacked(renderBanner(banner), 8)
    if (header.componentCount > 0) root.add(header, BorderLayout.NORTH)

    // Body (CENTER): a single child fills; several stack vertically.
    val children = if (component.path("children").isArray) component.path("children").toList() else emptyList()
    val body: JComponent = if (children.size == 1) {
        r.render(children[0], state, data)
    } else {
        val stack = verticalPanel()
        for (child in children) stack.addStacked(r.render(child, state, data), JBGap)
        stack
    }
    root.add(body, BorderLayout.CENTER)

    // Bottom button bar (SOUTH).
    val buttons = metadata.arr("buttons")
    if (buttons.isNotEmpty()) {
        val row = buttonRow(r, buttons)
        row.border = JBUI.Borders.emptyTop(JBGap)
        root.add(row, BorderLayout.SOUTH)
    }
    // The page's own CSS style caps the content width (e.g. `max-width:900px;margin:auto`, how the
    // web keeps forms readable) — anchored left, the IDE way, instead of centered.
    parseMaxWidth(component.text("style"))?.let { return MaxWidthPanel(it, root) }
    return root
}

internal fun buttonRow(r: ComponentRenderer, buttons: List<JsonNode>): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0))
    row.isOpaque = false
    for (b in buttons) row.add(renderButton(r.ctx, b))
    return row
}

private fun renderBanner(banner: JsonNode): JComponent {
    val theme = banner.text("theme", "INFO").uppercase()
    val (bg, fg) = when (theme) {
        "SUCCESS" -> Color(0xE6, 0xF4, 0xEA) to Color(0x1E, 0x4A, 0x2B)
        "WARNING" -> Color(0xFD, 0xF6, 0xE3) to Color(0x6B, 0x53, 0x00)
        "DANGER", "ERROR" -> Color(0xFB, 0xE9, 0xE7) to Color(0x7A, 0x1E, 0x14)
        else -> Color(0xE8, 0xF0, 0xFE) to Color(0x0B, 0x3D, 0x91)
    }
    val panel = JPanel()
    panel.layout = javax.swing.BoxLayout(panel, javax.swing.BoxLayout.Y_AXIS)
    panel.background = bg
    panel.isOpaque = true
    panel.border = JBUI.Borders.empty(10, 12)
    val bTitle = banner.text("title")
    if (bTitle.isNotBlank()) {
        val l = JBLabel(bTitle)
        l.foreground = fg
        l.font = l.font.deriveFont(Font.BOLD)
        l.alignmentX = Component.LEFT_ALIGNMENT
        panel.add(l)
    }
    val desc = banner.text("description")
    if (desc.isNotBlank()) {
        val l = JBLabel(desc)
        l.foreground = fg
        l.alignmentX = Component.LEFT_ALIGNMENT
        panel.add(l)
    }
    return panel
}
