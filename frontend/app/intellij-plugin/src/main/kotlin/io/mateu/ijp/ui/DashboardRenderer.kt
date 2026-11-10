package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BasicStroke
import java.awt.BorderLayout
import java.awt.Component
import java.awt.Cursor
import java.awt.Dimension
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.GridLayout
import java.awt.RenderingHints
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JPanel

/**
 * Dashboard components (the `Dashboard` archetype / fluent `DashboardLayout`): a KPI band
 * ([renderScoreboard] of [renderMetricCard]s), titled tiles ([renderDashboardPanel]) on a grid
 * ([renderDashboardLayout]), simple bar/line [renderChart]s painted with Java2D, and a minimal
 * [renderMarkdown]. Design mirrors the web's dashboardRenderer.ts (neutral panels, muted titles).
 */

fun renderDashboardLayout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val columns = metadata.text("columns").toIntOrNull()?.takeIf { it > 0 } ?: 2
    return renderSpanGrid(r, component.path("children").toList(), columns, state, data)
}

/**
 * A grid of dashboard tiles honouring their spans: a Scoreboard (the KPI band) takes the whole row
 * and a DashboardPanel its `colSpan`; each row is as tall as its tallest tile, not as tall as the
 * tallest tile of the whole grid. Shared by DashboardLayout and ResponsiveGrid — the latter used a
 * plain GridLayout (equal cells), so a band of four KPI tiles was stretched to the height of the
 * chart next to it: four 430px boxes with their numbers at the top (IJ-06; Few, "dashboards should
 * be dense"; Refactoring UI, "don't fill the space just because it's there").
 */
internal fun renderSpanGrid(r: ComponentRenderer, children: List<JsonNode>, columns: Int, state: JsonNode, data: JsonNode): JComponent {
    val panel = JPanel(GridBagLayout())
    panel.isOpaque = false
    var col = 0
    var row = 0
    run {
        for (child in children) {
            val childType = child.path("metadata").text("type")
            val span = when (childType) {
                "Scoreboard" -> columns
                "DashboardPanel" -> child.path("metadata").text("colSpan").toIntOrNull()?.coerceIn(1, columns) ?: 1
                else -> 1
            }
            if (col + span > columns) { col = 0; row++ }
            val gbc = GridBagConstraints().apply {
                gridx = col; gridy = row; gridwidth = span
                weightx = span.toDouble()
                fill = GridBagConstraints.BOTH
                anchor = GridBagConstraints.NORTHWEST
                insets = JBUI.insets(0, 0, JBGap, JBGap)
            }
            panel.add(r.render(child, state, data), gbc)
            col += span
            if (col >= columns) { col = 0; row++ }
        }
    }
    // Bottom-left filler keeps tiles top-aligned in a filling container.
    panel.add(
        JPanel().apply { isOpaque = false },
        GridBagConstraints().apply { gridx = 0; gridy = row + 1; gridwidth = columns; weightx = 1.0; weighty = 1.0; fill = GridBagConstraints.BOTH },
    )
    return panel
}

fun renderScoreboard(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val rowPanel = JPanel(GridLayout(1, 0, JBUI.scale(JBGap), 0))
    rowPanel.isOpaque = false
    val children = component.path("children")
    if (children.isArray) for (child in children) rowPanel.add(r.render(child, state, data))
    return rowPanel
}

/**
 * The KPI tile's accessible name, in reading order: "Revenue, 12.4k €, Last 7 days, +8%, …" — the
 * same text the web, Redwood and React Native renderers give it, so the timeframe travels with the
 * number it qualifies.
 */
fun metricAccessibleName(metadata: JsonNode): String {
    val value = listOf(metadata.text("value"), metadata.text("unit")).map { it.trim() }.filter { it.isNotEmpty() }.joinToString(" ")
    return listOf(metadata.text("title"), value, metadata.text("timeframe"), metadata.text("trendLabel"), metadata.text("description"))
        .map { it.trim() }
        .filter { it.isNotEmpty() }
        .joinToString(", ")
}

fun renderMetricCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val card = tilePanel()
    val title = JBLabel(plain(metadata.text("title")))
    title.foreground = ToneColors.secondaryText()
    title.alignmentX = Component.LEFT_ALIGNMENT
    card.add(title)

    val value = JBLabel(plain((metadata.text("value") + " " + metadata.text("unit")).trim()))
    value.font = value.font.deriveFont(Font.BOLD, PageChrome.fontSize(26f))
    value.alignmentX = Component.LEFT_ALIGNMENT
    card.add(value)

    // the period the number covers ("Last 7 days"): small and muted, right under the value
    val timeframe = metadata.text("timeframe").trim()
    if (timeframe.isNotEmpty()) {
        val tf = JBLabel(plain(timeframe))
        tf.foreground = ToneColors.secondaryText()
        tf.font = JBUI.Fonts.smallFont()
        tf.alignmentX = Component.LEFT_ALIGNMENT
        card.add(tf)
    }
    card.accessibleName(metricAccessibleName(metadata))

    val trendLabel = metadata.text("trendLabel")
    if (trendLabel.isNotBlank()) {
        val trend = JBLabel(plain(trendLabel))
        trend.foreground = when (metadata.text("trend").lowercase()) {
            "up" -> JBColor(0x3E8635, 0x4CAF50)
            "down" -> JBColor(0xC9190B, 0xE57373)
            else -> ToneColors.secondaryText()
        }
        trend.alignmentX = Component.LEFT_ALIGNMENT
        card.add(trend)
    }

    val actionId = metadata.text("actionId")
    if (actionId.isNotBlank()) {
        card.activatable { r.ctx.runAction(actionId, null) }
    }
    return card
}

fun renderDashboardPanel(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val tile = tilePanel()
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(plain(title))
        l.font = l.font.deriveFont(Font.BOLD)
        l.alignmentX = Component.LEFT_ALIGNMENT
        tile.add(l)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(plain(subtitle))
        l.foreground = ToneColors.secondaryText()
        l.alignmentX = Component.LEFT_ALIGNMENT
        tile.add(l)
    }
    val children = component.path("children")
    if (children.isArray) {
        for (child in children) {
            val c = r.render(child, state, data)
            c.alignmentX = Component.LEFT_ALIGNMENT
            tile.add(c)
        }
    }
    return tile
}

private fun tilePanel(): JPanel {
    val panel = verticalPanel(4)
    panel.isOpaque = false
    panel.border = JBUI.Borders.compound(
        JBUI.Borders.customLine(JBColor.border(), 1),
        JBUI.Borders.empty(12),
    )
    return panel
}

// ── chart ─────────────────────────────────────────────────────────────────────────────

// renderChart / ChartPanel / chartTextAlternative live in Charts.kt

// ── markdown ──────────────────────────────────────────────────────────────────────────

/** Markdown → HTML ([MarkdownHtml]) in a non-editable [JEditorPane]; links open in the browser. */
fun renderMarkdown(metadata: JsonNode): JComponent {
    // An HTML pane asks for its UNWRAPPED width, so a long line ran past its column and was cut
    // (the museum's "Before you start"). This one asks for at most its current width and reports
    // the height its text needs there; a width change re-lays it out.
    val pane = object : JEditorPane("text/html", MarkdownHtml.toHtml(metadata.text("markdown"))) {
        override fun getPreferredSize(): java.awt.Dimension = wrappedPreferredSize(this) { super.getPreferredSize() }
        override fun getMinimumSize() = java.awt.Dimension(0, super.getMinimumSize().height)
    }
    pane.addComponentListener(object : java.awt.event.ComponentAdapter() {
        private var lastWidth = -1
        override fun componentResized(e: java.awt.event.ComponentEvent) {
            if (pane.width != lastWidth) { lastWidth = pane.width; pane.revalidate() }
        }
    })
    pane.isEditable = false
    pane.isOpaque = false
    pane.putClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES, true)
    pane.addHyperlinkListener { e ->
        if (e.eventType == javax.swing.event.HyperlinkEvent.EventType.ACTIVATED) SafeHtml.browse(e.description)
    }
    return pane
}

internal fun markdownToHtml(md: String): String {
    val sb = StringBuilder("<html><body>")
    var inList = false
    for (rawLine in md.lines()) {
        val lineHtml = rawLine
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace(Regex("\\*\\*([^*]+)\\*\\*"), "<b>$1</b>")
            .replace(Regex("\\*([^*]+)\\*"), "<i>$1</i>")
        if (lineHtml.trimStart().startsWith("- ")) {
            if (!inList) { sb.append("<ul>"); inList = true }
            sb.append("<li>").append(lineHtml.trimStart().removePrefix("- ")).append("</li>")
        } else {
            if (inList) { sb.append("</ul>"); inList = false }
            if (lineHtml.isNotBlank()) sb.append(lineHtml).append("<br>")
        }
    }
    if (inList) sb.append("</ul>")
    return sb.append("</body></html>").toString()
}
