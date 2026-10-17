package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Display components: charts and metrics (Stat, Heatmap, Funnel, TrendChart, Timeline, ProgressSteps, OrgChart) on Swing. */

/** Timeline: a vertical list of entries, each a colored dot + title/timestamp/description. */
fun renderTimeline(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(0)
    for (item in metadata.arr("items")) {
        val row = JPanel(BorderLayout(8, 0))
        row.isOpaque = false
        val icon = item.text("icon")
        val dot = JBLabel(if (icon.isNotBlank()) icon else "●", SwingConstants.CENTER)
        runCatching { Color.decode(item.text("color")) }.getOrNull()?.let { dot.foreground = it }
        row.add(dot, BorderLayout.WEST)
        val body = verticalPanel(2)
        val title = item.text("title")
        val timestamp = item.text("timestamp")
        val head = if (timestamp.isNotBlank()) "$title  ($timestamp)" else title
        body.addStacked(JBLabel(head).apply { font = font.deriveFont(Font.BOLD) }, 2)
        val desc = item.text("description")
        if (desc.isNotBlank()) {
            body.addStacked(JBLabel(desc).apply {
                foreground = ToneColors.secondaryText()
            }, 0)
        }
        row.add(body, BorderLayout.CENTER)
        val actionId = item.text("actionId")
        if (actionId.isNotBlank()) {
            row.activatable { r.ctx.runAction(actionId, null) }
        }
        panel.addStacked(row, 10)
    }
    return panel
}

/**
 * ProgressSteps: numbered dots + labels colored by status — a horizontal row by default, or a
 * stacked column when the wire carries vertical=true (the wizard RAIL mode).
 */
fun renderProgressSteps(metadata: JsonNode): JComponent {
    val vertical = metadata.bool("vertical")
    val container = if (vertical) verticalPanel(6) else JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    container.isOpaque = false
    val steps = metadata.arr("steps")
    for ((i, step) in steps.withIndex()) {
        val status = step.text("status", "upcoming")
        val label = if (status == "done") "✓" else (i + 1).toString()
        val align = if (vertical) SwingConstants.LEFT else SwingConstants.CENTER
        val dot = JBLabel(label, SwingConstants.CENTER)
        dot.foreground =
            when (status) {
                "done" -> Color(0x1A, 0x73, 0xE8)
                "current" -> Color(0x1A, 0x73, 0xE8)
                else -> ToneColors.secondaryText()
            }
        dot.font = dot.font.deriveFont(Font.BOLD, 15f)
        val title = JBLabel(step.text("title"), align).apply {
            if (status == "upcoming") foreground = ToneColors.secondaryText()
            else font = font.deriveFont(Font.BOLD)
        }
        val desc = step.text("description")
        if (vertical) {
            // one row per step: dot beside the title (+ optional description below)
            val rowPanel = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0))
            rowPanel.isOpaque = false
            rowPanel.add(dot)
            val textCell = verticalPanel(0)
            textCell.addStacked(title, 0)
            if (desc.isNotBlank()) {
                textCell.addStacked(JBLabel(desc, align).apply {
                    foreground = ToneColors.secondaryText()
                }, 0)
            }
            rowPanel.add(textCell)
            container.addStacked(rowPanel, if (i == 0) 0 else 6)
        } else {
            val cell = verticalPanel(2)
            cell.border = JBUI.Borders.empty(0, 8)
            cell.addStacked(dot, 2)
            cell.addStacked(title, 0)
            if (desc.isNotBlank()) {
                cell.addStacked(JBLabel(desc, align).apply {
                    foreground = ToneColors.secondaryText()
                }, 0)
            }
            container.add(cell)
        }
    }
    return container
}

/** Stat: a KPI tile — label, big value + unit, delta colored by trend, and a sparkline. */
fun renderStat(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val trend = metadata.text("trend", "up")
    val trendColor =
        when (trend) {
            "down" -> Color(0xE1, 0x1D, 0x48)
            "flat" -> ToneColors.secondaryText()
            else -> Color(0x12, 0xB7, 0x6A)
        }
    val tile = verticalPanel(2)
    tile.border = JBUI.Borders.empty(12)
    val label = metadata.text("label")
    if (label.isNotBlank()) {
        tile.addStacked(JBLabel(label).apply {
            foreground = ToneColors.secondaryText()
        }, 2)
    }
    val value = metadata.text("value") + metadata.text("unit").let { if (it.isNotBlank()) " $it" else "" }
    tile.addStacked(JBLabel(value).apply { font = font.deriveFont(Font.BOLD, 24f) }, 4)
    val delta = metadata.text("delta")
    val spark = metadata.arr("spark").mapNotNull { it.asDouble() }
    val foot = JPanel(BorderLayout(8, 0))
    foot.isOpaque = false
    if (delta.isNotBlank()) {
        val arrow = if (trend == "up") "▲" else if (trend == "down") "▼" else "→"
        foot.add(JBLabel("$arrow $delta").apply { foreground = trendColor }, BorderLayout.WEST)
    }
    if (spark.size >= 2) {
        val min = spark.min()
        val max = spark.max()
        val span = (max - min).takeIf { it != 0.0 } ?: 1.0
        val sparkPanel = object : JPanel() {
            override fun paintComponent(g: Graphics) {
                super.paintComponent(g)
                val g2 = g as Graphics2D
                g2.color = trendColor
                val stepX = width.toDouble() / (spark.size - 1)
                var prevX = 0
                var prevY = height - ((spark[0] - min) / span * (height - 4) + 2).toInt()
                for (i in 1 until spark.size) {
                    val x = (i * stepX).toInt()
                    val y = height - ((spark[i] - min) / span * (height - 4) + 2).toInt()
                    g2.drawLine(prevX, prevY, x, y)
                    prevX = x
                    prevY = y
                }
            }
        }
        sparkPanel.isOpaque = false
        sparkPanel.preferredSize = Dimension(84, 28)
        foot.add(sparkPanel, BorderLayout.EAST)
    }
    tile.addStacked(foot, 0)
    val actionId = metadata.text("actionId")
    if (actionId.isNotBlank()) {
        tile.activatable { r.ctx.runAction(actionId, null) }
    }
    return tile
}

/** OrgChart (indented tree on Swing): each node a row, children indented under it. */
fun renderOrgChart(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(2)
    val root = metadata.get("root")
    if (root != null && !root.isNull) orgNodeRow(r, panel, root, 0)
    return panel
}

private fun orgNodeRow(r: ComponentRenderer, panel: JPanel, node: JsonNode, depth: Int) {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 6, 2))
    row.isOpaque = false
    row.border = JBUI.Borders.emptyLeft(depth * 18)
    val avatar = node.text("avatar")
    val title = node.text("title")
    val subtitle = node.text("subtitle")
    val text = if (subtitle.isNotBlank()) "$title — $subtitle" else title
    val label = JBLabel((if (avatar.isNotBlank()) "$avatar " else "") + text)
    runCatching { Color.decode(node.text("color")) }.getOrNull()?.let { label.foreground = it }
    row.add(label)
    val actionId = node.text("actionId")
    if (actionId.isNotBlank()) {
        row.activatable { r.ctx.runAction(actionId, null) }
    }
    panel.addStacked(row, 2)
    for (child in node.arr("children")) orgNodeRow(r, panel, child, depth + 1)
}

/** Heatmap: a GitHub-style grid of day squares colored by intensity, painted on a canvas. */
fun renderHeatmap(metadata: JsonNode): JComponent {
    val cells =
        metadata.arr("cells")
            .filter { it.text("date").isNotBlank() }
            .mapNotNull { c ->
                runCatching { LocalDate.parse(c.text("date")) }.getOrNull()?.let { it to c.path("value").asDouble(0.0) }
            }
    if (cells.isEmpty()) return JPanel().apply { isOpaque = false }
    val min = cells.minOf { it.first }
    val start = min.minusDays(((min.dayOfWeek.value + 6) % 7).toLong())
    val max = cells.maxOf { it.first }
    val maxVal = cells.maxOf { it.second }.coerceAtLeast(1.0)
    val byDate = cells.associate { it.first to it.second }
    val base = Color(0x1A, 0x73, 0xE8)
    val panel = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            val size = 12
            val gap = 3
            var d = start
            var col = 0
            while (!d.isAfter(max)) {
                val row = (d.dayOfWeek.value + 6) % 7
                val v = byDate[d] ?: 0.0
                val t = v / maxVal
                val alpha = if (v <= 0) 20 else if (t > 0.75) 255 else if (t > 0.5) 190 else if (t > 0.25) 130 else 80
                g2.color = Color(base.red, base.green, base.blue, alpha)
                g2.fillRoundRect(col * (size + gap), row * (size + gap), size, size, 2, 2)
                if (row == 6) col++
                d = d.plusDays(1)
            }
        }
    }
    val weeks = ChronoUnit.DAYS.between(start, max).toInt() / 7 + 2
    panel.isOpaque = false
    panel.preferredSize = Dimension(weeks * 15, 7 * 15)
    return panel
}

/** Funnel: centered bars, each proportional to its value, with the conversion vs the previous. */
fun renderFunnel(metadata: JsonNode): JComponent {
    val stages = metadata.arr("stages").toList()
    if (stages.isEmpty()) return JPanel().apply { isOpaque = false }
    val maxVal = stages.maxOf { it.path("value").asDouble(0.0) }.coerceAtLeast(1.0)
    val panel = verticalPanel(4)
    for ((i, stage) in stages.withIndex()) {
        val value = stage.path("value").asDouble(0.0)
        val prev = if (i > 0) stages[i - 1].path("value").asDouble(0.0) else value
        val conv = if (i == 0) "" else if (prev > 0) "  (${Math.round(value / prev * 100)}% of previous)" else ""
        panel.addStacked(JBLabel(stage.text("label") + conv).apply { font = font.deriveFont(Font.BOLD) }, 2)
        val color = runCatching { Color.decode(stage.text("color")) }.getOrElse { Color(0x1A, 0x73, 0xE8) }
        val bar = object : JPanel() {
            override fun paintComponent(g: Graphics) {
                super.paintComponent(g)
                val g2 = g as Graphics2D
                val w = ((value / maxVal) * width).toInt().coerceAtLeast(40)
                val x = (width - w) / 2
                g2.color = color
                g2.fillRoundRect(x, 0, w, height, 6, 6)
                g2.color = Color.WHITE
                g2.drawString(value.toLong().toString(), x + w / 2 - 12, height / 2 + 5)
            }
        }
        bar.isOpaque = false
        bar.preferredSize = Dimension(360, 30)
        bar.maximumSize = Dimension(Int.MAX_VALUE, 30)
        panel.addStacked(bar, 4)
    }
    return panel
}

/** TrendChart: a single series drawn as a line (optionally area-filled) on a canvas. */
fun renderTrendChart(metadata: JsonNode): JComponent {
    val values = metadata.arr("values").map { it.asDouble(0.0) }
    val panel = verticalPanel(4)
    val title = metadata.text("title")
    if (title.isNotBlank()) panel.addStacked(JBLabel(title).apply { font = font.deriveFont(Font.BOLD) }, 4)
    if (values.size < 2) return panel
    val min = values.min()
    val max = values.max()
    val span = (max - min).takeIf { it != 0.0 } ?: 1.0
    val color = runCatching { Color.decode(metadata.text("color")) }.getOrElse { Color(0x1A, 0x73, 0xE8) }
    val area = metadata.path("area").asBoolean(false)
    val chart = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
            val pad = 6
            val stepX = (width - pad * 2).toDouble() / (values.size - 1)
            val xs = IntArray(values.size)
            val ys = IntArray(values.size)
            for (i in values.indices) {
                xs[i] = pad + (i * stepX).toInt()
                ys[i] = pad + ((height - pad * 2) * (1 - (values[i] - min) / span)).toInt()
            }
            if (area) {
                val poly = java.awt.Polygon()
                for (i in values.indices) poly.addPoint(xs[i], ys[i])
                poly.addPoint(xs.last(), height - pad)
                poly.addPoint(xs.first(), height - pad)
                g2.color = Color(color.red, color.green, color.blue, 30)
                g2.fillPolygon(poly)
            }
            g2.color = color
            g2.stroke = java.awt.BasicStroke(2f)
            for (i in 1 until values.size) g2.drawLine(xs[i - 1], ys[i - 1], xs[i], ys[i])
        }
    }
    chart.isOpaque = false
    chart.preferredSize = Dimension(420, 140)
    panel.addStacked(chart, 0)
    return panel
}
