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
    val panel = JPanel(GridBagLayout())
    panel.isOpaque = false
    var col = 0
    var row = 0
    val children = component.path("children")
    if (children.isArray) {
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

fun renderMetricCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val card = tilePanel()
    val title = JBLabel(metadata.text("title"))
    title.foreground = JBUI.CurrentTheme.Label.disabledForeground()
    title.alignmentX = Component.LEFT_ALIGNMENT
    card.add(title)

    val value = JBLabel(metadata.text("value") + " " + metadata.text("unit"))
    value.font = value.font.deriveFont(Font.BOLD, 26f)
    value.alignmentX = Component.LEFT_ALIGNMENT
    card.add(value)

    val trendLabel = metadata.text("trendLabel")
    if (trendLabel.isNotBlank()) {
        val trend = JBLabel(trendLabel)
        trend.foreground = when (metadata.text("trend").lowercase()) {
            "up" -> JBColor(0x3E8635, 0x4CAF50)
            "down" -> JBColor(0xC9190B, 0xE57373)
            else -> JBUI.CurrentTheme.Label.disabledForeground()
        }
        trend.alignmentX = Component.LEFT_ALIGNMENT
        card.add(trend)
    }

    val actionId = metadata.text("actionId")
    if (actionId.isNotBlank()) {
        card.cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
        card.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) = r.ctx.runAction(actionId, null)
        })
    }
    return card
}

fun renderDashboardPanel(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val tile = tilePanel()
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD)
        l.alignmentX = Component.LEFT_ALIGNMENT
        tile.add(l)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle)
        l.foreground = JBUI.CurrentTheme.Label.disabledForeground()
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

/** Minimal dependency-free bar/line chart over `chartData.labels` + `chartData.datasets[0].data`. */
fun renderChart(metadata: JsonNode): JComponent {
    val labels = metadata.path("chartData").arr("labels").map { it.asText() }
    val dataset = metadata.path("chartData").arr("datasets").firstOrNull()
    val values = dataset?.arr("data")?.map { it.asDouble() } ?: emptyList()
    val line = metadata.text("chartType").equals("line", ignoreCase = true)
    return ChartPanel(labels, values, line)
}

private class ChartPanel(
    private val labels: List<String>,
    private val values: List<Double>,
    private val line: Boolean,
) : JComponent() {
    init {
        preferredSize = Dimension(JBUI.scale(320), JBUI.scale(180))
        minimumSize = Dimension(JBUI.scale(160), JBUI.scale(120))
    }

    override fun paintComponent(g: Graphics) {
        if (values.isEmpty()) return
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        val pad = JBUI.scale(8)
        val labelH = JBUI.scale(18)
        val w = width - pad * 2
        val h = height - pad * 2 - labelH
        val max = (values.max()).takeIf { it > 0 } ?: 1.0
        val accent = JBColor(0x3574F0, 0x548AF7)
        val n = values.size
        val slot = w.toDouble() / n
        g2.font = JBUI.Fonts.smallFont()
        val fm = g2.fontMetrics
        if (line) {
            g2.color = accent
            g2.stroke = BasicStroke(JBUI.scale(2).toFloat())
            var prev: Pair<Int, Int>? = null
            for (i in 0 until n) {
                val x = pad + (slot * i + slot / 2).toInt()
                val y = pad + h - (values[i] / max * h).toInt()
                prev?.let { (px, py) -> g2.drawLine(px, py, x, y) }
                g2.fillOval(x - JBUI.scale(3), y - JBUI.scale(3), JBUI.scale(6), JBUI.scale(6))
                prev = x to y
            }
        } else {
            val barW = (slot * 0.6).toInt().coerceAtLeast(2)
            for (i in 0 until n) {
                val x = pad + (slot * i + (slot - barW) / 2).toInt()
                val barH = (values[i] / max * h).toInt()
                g2.color = accent
                g2.fillRoundRect(x, pad + h - barH, barW, barH, JBUI.scale(4), JBUI.scale(4))
            }
        }
        g2.color = JBUI.CurrentTheme.Label.disabledForeground()
        for (i in 0 until n) {
            val label = labels.getOrNull(i) ?: continue
            val x = pad + (slot * i + slot / 2).toInt() - fm.stringWidth(label) / 2
            g2.drawString(label, x, height - pad)
        }
        g2.dispose()
    }
}

// ── markdown ──────────────────────────────────────────────────────────────────────────

/** Minimal markdown (bullets, bold, italics) → HTML in a non-editable [JEditorPane]. */
fun renderMarkdown(metadata: JsonNode): JComponent {
    val pane = JEditorPane("text/html", markdownToHtml(metadata.text("markdown")))
    pane.isEditable = false
    pane.isOpaque = false
    pane.putClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES, true)
    return pane
}

private fun markdownToHtml(md: String): String {
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
