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
    val items = metadata.arr("items").toList()
    for ((index, item) in items.withIndex()) {
        val row = JPanel(BorderLayout(JBUI.scale(10), 0))
        row.isOpaque = false
        // the rail: a vertical line through every entry with a dot (or the entry's icon in a ring)
        // on it — it drew only the icons, so the entries read as an unconnected list
        // a hex colour, else a tone name ("success") as its solid colour
        val color = runCatching { Color.decode(item.text("color")) }.getOrNull()
            ?: ToneColors.toneOf(item.text("color")).takeIf { it != ToneColors.Tone.NEUTRAL }?.let { ToneColors.solid(it).first }
        row.add(TimelineMarker(wireIconText(item.text("icon")), color, first = index == 0, last = index == items.lastIndex), BorderLayout.WEST)
        val body = verticalPanel(2)
        val title = item.text("title")
        val timestamp = item.text("timestamp")
        val head = if (timestamp.isNotBlank()) "$title  ($timestamp)" else title
        body.addStacked(JBLabel(plain(head)).apply { font = font.deriveFont(Font.BOLD) }, 2)
        val desc = item.text("description")
        if (desc.isNotBlank()) {
            body.addStacked(JBLabel(plain(desc)).apply {
                foreground = ToneColors.secondaryText()
            }, 0)
        }
        row.add(body, BorderLayout.CENTER)
        val actionId = item.text("actionId")
        if (actionId.isNotBlank()) {
            row.activatable { r.ctx.runAction(actionId, null) }
        }
        // the gap below the entry belongs to its text, so the rail runs on through it
        body.border = JBUI.Borders.emptyBottom(10)
        panel.addStacked(row, 0)
    }
    return panel
}

/** One entry's spot on the timeline rail: the line above/below and its dot (or icon in a ring). */
internal class TimelineMarker(glyphText: String?, private val color: Color?, private val first: Boolean, private val last: Boolean) : JPanel() {
    init { isOpaque = false }

    // an emoji's variation selector (U+FE0F) draws as a box in a Swing font
    private val glyph = glyphText?.replace("\uFE0F", "")?.takeIf { it.isNotBlank() }

    private val size get() = JBUI.scale(if (glyph != null) 22 else 12)

    override fun getPreferredSize() = Dimension(JBUI.scale(24), JBUI.scale(24))
    override fun getMinimumSize() = preferredSize

    override fun paintComponent(g: Graphics) {
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
        val cx = width / 2
        val cy = JBUI.scale(10)
        g2.color = ToneColors.secondaryText().let { Color(it.red, it.green, it.blue, 110) }
        val lw = JBUI.scale(2)
        if (!first) g2.fillRect(cx - lw / 2, 0, lw, cy)
        if (!last) g2.fillRect(cx - lw / 2, cy, lw, height - cy)
        val accent = color ?: com.intellij.ui.JBColor(Color(0x3574F0), Color(0x548AF7))
        val d = size
        if (glyph != null) {
            g2.color = com.intellij.util.ui.UIUtil.getPanelBackground()
            g2.fillOval(cx - d / 2, cy - d / 2, d, d)
            g2.color = accent
            g2.drawOval(cx - d / 2, cy - d / 2, d - 1, d - 1)
            g2.font = g2.font.deriveFont(JBUI.scale(11).toFloat())
            val fm = g2.fontMetrics
            g2.color = ToneColors.foreground()
            g2.drawString(glyph, cx - fm.stringWidth(glyph) / 2, cy - fm.height / 2 + fm.ascent)
        } else {
            g2.color = accent
            g2.fillOval(cx - d / 2, cy - d / 2, d, d)
        }
        g2.dispose()
    }
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
        val dot = JBLabel(plain(label), SwingConstants.CENTER)
        dot.foreground =
            when (status) {
                "done" -> Color(0x1A, 0x73, 0xE8)
                "current" -> Color(0x1A, 0x73, 0xE8)
                else -> ToneColors.secondaryText()
            }
        dot.font = dot.font.deriveFont(Font.BOLD, PageChrome.fontSize(15f))
        val title = JBLabel(plain(step.text("title")), align).apply {
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
                textCell.addStacked(JBLabel(plain(desc), align).apply {
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
                cell.addStacked(JBLabel(plain(desc), align).apply {
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
        tile.addStacked(JBLabel(plain(label)).apply {
            foreground = ToneColors.secondaryText()
        }, 2)
    }
    val value = metadata.text("value") + metadata.text("unit").let { if (it.isNotBlank()) " $it" else "" }
    tile.addStacked(JBLabel(plain(value)).apply { font = font.deriveFont(Font.BOLD, PageChrome.fontSize(24f)) }, 4)
    val delta = metadata.text("delta")
    val spark = metadata.arr("spark").mapNotNull { it.asDouble() }
    val foot = JPanel(BorderLayout(8, 0))
    foot.isOpaque = false
    if (delta.isNotBlank()) {
        val arrow = if (trend == "up") "▲" else if (trend == "down") "▼" else "→"
        foot.add(JBLabel(plain("$arrow $delta")).apply { foreground = trendColor }, BorderLayout.WEST)
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

/**
 * OrgChart: an indented tree on Swing (each node a row, children indented under it), or — with
 * display = "focus" — one node at a time (Redwood's hierarchy viewer, see [renderOrgFocus]).
 */
fun renderOrgChart(r: ComponentRenderer, metadata: JsonNode): JComponent {
    if (OrgChartModel.isFocus(metadata) && metadata.path("root").isObject) return renderOrgFocus(r, metadata)
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
    val label = JBLabel(plain((if (avatar.isNotBlank()) "$avatar " else "") + text))
    runCatching { Color.decode(node.text("color")) }.getOrNull()?.let { label.foreground = it }
    row.add(label)
    val actionId = node.text("actionId")
    if (actionId.isNotBlank()) {
        row.activatable { r.ctx.runAction(actionId, null) }
    }
    panel.addStacked(row, 2)
    for (child in node.arr("children")) orgNodeRow(r, panel, child, depth + 1)
}

/**
 * OrgChart in focus: the focused node as a prominent card, its ancestors above it (root first —
 * a desktop has the room for all of them), its children below under "Reports (n)". Clicking an
 * ancestor or a child card moves the focus there, locally (the whole tree is in the metadata); a
 * node's action runs from its TITLE (a link), exactly as the tree runs it, while the card focuses.
 */
private fun renderOrgFocus(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(0)
    fun show(path: List<JsonNode>) {
        panel.removeAll()
        val focused = path.last()
        OrgChartModel.ancestors(path).forEachIndexed { i, ancestor ->
            panel.addStacked(orgFocusCard(r, ancestor, big = false) { show(path.subList(0, i + 1)) }, 0)
            panel.addStacked(orgConnector(), 0)
        }
        panel.addStacked(orgFocusCard(r, focused, big = true, onFocus = null), 0)
        val children = OrgChartModel.children(focused)
        if (children.isNotEmpty()) {
            panel.add(javax.swing.Box.createVerticalStrut(JBUI.scale(10)))
            val heading = JBLabel(plain(OrgChartModel.reportsLabel(children.size))).apply { font = font.deriveFont(Font.BOLD) }
            panel.addStacked(heading, 6)
            val grid = JPanel(java.awt.GridLayout(0, 2, JBUI.scale(8), JBUI.scale(8)))
            grid.isOpaque = false
            for (child in children) grid.add(orgFocusCard(r, child, big = false, showReports = true) { show(path + listOf(child)) })
            panel.addStacked(grid, 0)
        }
        panel.revalidate()
        panel.repaint()
    }
    show(OrgChartModel.initialPath(metadata))
    return panel
}

/** The short vertical line between an ancestor's card and the next one down. */
private fun orgConnector(): JComponent = object : JComponent() {
    override fun getPreferredSize() = Dimension(JBUI.scale(40), JBUI.scale(12))
    override fun paintComponent(g: Graphics) {
        g.color = JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground()
        g.fillRect(JBUI.scale(26), 0, JBUI.scale(2), height)
    }
}

/** One node's card: a round initials badge, the title (a link when the node has an action), the subtitle. */
private fun orgFocusCard(
    r: ComponentRenderer,
    node: JsonNode,
    big: Boolean,
    showReports: Boolean = false,
    onFocus: (() -> Unit)?,
): JComponent {
    val title = node.text("title")
    val subtitle = node.text("subtitle")
    val accent = runCatching { Color.decode(node.text("color")) }.getOrNull() ?: JBUI.CurrentTheme.Link.Foreground.ENABLED
    val card = JPanel(BorderLayout(JBUI.scale(10), 0))
    card.isOpaque = false
    card.border = JBUI.Borders.compound(
        JBUI.Borders.customLine(accent, if (big) 2 else 1, if (big) 4 else 3, if (big) 2 else 1, if (big) 2 else 1),
        JBUI.Borders.empty(if (big) 12 else 6, 8),
    )
    val size = JBUI.scale(if (big) 48 else 30)
    val initials = OrgChartModel.initials(title, node.text("avatar"))
    val badge = object : JComponent() {
        override fun getPreferredSize() = Dimension(size, size)
        override fun paintComponent(g: Graphics) {
            val g2 = g as Graphics2D
            g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
            g2.color = accent
            g2.fillOval(0, 0, size - 1, size - 1)
            g2.color = Color.WHITE
            g2.font = g2.font.deriveFont(Font.BOLD, (size / 2.6f))
            val fm = g2.fontMetrics
            g2.drawString(initials, (size - fm.stringWidth(initials)) / 2, (size - fm.height) / 2 + fm.ascent)
        }
    }
    val badgeBox = JPanel(java.awt.GridBagLayout()).apply { isOpaque = false; add(badge) }
    card.add(badgeBox, BorderLayout.WEST)
    val body = verticalPanel(0)
    val actionId = node.text("actionId")
    val titleFont = { f: Font -> f.deriveFont(Font.BOLD, if (big) f.size2D + 3f else f.size2D) }
    if (actionId.isNotBlank()) {
        val link = com.intellij.ui.components.ActionLink(plain(title)) { r.ctx.runAction(actionId, null) }
        link.font = titleFont(link.font)
        link.accessibleName(title)
        body.addStacked(link, 2)
    } else {
        body.addStacked(JBLabel(plain(title)).apply { font = titleFont(font) }, 2)
    }
    if (subtitle.isNotBlank()) body.addStacked(JBLabel(plain(subtitle)).apply { foreground = ToneColors.secondaryText() }, 0)
    val reports = OrgChartModel.children(node).size
    if (showReports && reports > 0) {
        body.addStacked(JBLabel(plain(OrgChartModel.reportsLabel(reports))).apply { foreground = ToneColors.secondaryText() }, 0)
    }
    card.add(body, BorderLayout.CENTER)
    if (onFocus != null) card.activatable(OrgChartModel.label(title, subtitle)) { onFocus() }
    return card
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
        // a canvas keeps its size inside a stack/row: its minimum was a FlowLayout's empty 10px,
        // which a squeezed box layout honoured — a 10px strip showing 5 of 17 days
        override fun getMinimumSize(): Dimension = preferredSize
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            val size = JBUI.scale(12)
            val gap = JBUI.scale(3)
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
    panel.preferredSize = Dimension(JBUI.scale(weeks * 15), JBUI.scale(7 * 15))
    panel.getAccessibleContext().accessibleName = heatmapTextAlternative(metadata)
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
        panel.addStacked(JBLabel(plain(stage.text("label") + conv)).apply { font = font.deriveFont(Font.BOLD) }, 2)
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
    if (title.isNotBlank()) panel.addStacked(JBLabel(plain(title)).apply { font = font.deriveFont(Font.BOLD) }, 4)
    if (values.size < 2) return panel
    val min = values.min()
    val max = values.max()
    val span = (max - min).takeIf { it != 0.0 } ?: 1.0
    val color = runCatching { Color.decode(metadata.text("color")) }.getOrElse { Color(0x1A, 0x73, 0xE8) }
    val area = metadata.path("area").asBoolean(false)
    val labels = metadata.arr("labels").map { it.asText() }
    val chart = object : JPanel() {
        // the chart keeps its height in a stack (a squeezed box layout cut it to a sliver)
        override fun getMinimumSize(): Dimension = Dimension(JBUI.scale(120), preferredSize.height)
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
            g2.font = JBUI.Fonts.smallFont()
            val fm = g2.fontMetrics
            val pad = JBUI.scale(6)
            // room under the line for the x labels, when the wire names the points
            val labelH = if (labels.isNotEmpty()) fm.height else 0
            val plotH = height - labelH
            val stepX = (width - pad * 2).toDouble() / (values.size - 1)
            val xs = IntArray(values.size)
            val ys = IntArray(values.size)
            for (i in values.indices) {
                xs[i] = pad + (i * stepX).toInt()
                ys[i] = pad + ((plotH - pad * 2) * (1 - (values[i] - min) / span)).toInt()
            }
            if (labels.isNotEmpty()) {
                g2.color = ToneColors.secondaryText()
                // as many labels as fit without overlapping, the last always
                val every = ((labels.maxOf { fm.stringWidth(it) } + JBUI.scale(8)) / stepX.coerceAtLeast(1.0)).toInt() + 1
                for (i in values.indices) {
                    val l = labels.getOrNull(i) ?: continue
                    if (i % every != 0 && i != values.lastIndex) continue
                    val x = (xs[i] - fm.stringWidth(l) / 2).coerceIn(0, (width - fm.stringWidth(l)).coerceAtLeast(0))
                    g2.drawString(l, x, height - fm.descent)
                }
            }
            if (area) {
                val poly = java.awt.Polygon()
                for (i in values.indices) poly.addPoint(xs[i], ys[i])
                poly.addPoint(xs.last(), plotH - pad)
                poly.addPoint(xs.first(), plotH - pad)
                g2.color = Color(color.red, color.green, color.blue, 30)
                g2.fillPolygon(poly)
            }
            g2.color = color
            g2.stroke = java.awt.BasicStroke(2f)
            for (i in 1 until values.size) g2.drawLine(xs[i - 1], ys[i - 1], xs[i], ys[i])
        }
    }
    chart.isOpaque = false
    chart.preferredSize = Dimension(JBUI.scale(420), JBUI.scale(140))
    chart.getAccessibleContext().accessibleName = (if (title.isNotBlank()) "$title. " else "") +
        chartTextAlternative(labels, values, line = true)
    panel.addStacked(chart, 0)
    return panel
}

/** The heatmap's text alternative: "Heatmap, 17 days. Busiest 2026-10-07: 8 (…)". */
internal fun heatmapTextAlternative(metadata: JsonNode): String {
    val cells = metadata.arr("cells").filter { it.text("date").isNotBlank() }
    if (cells.isEmpty()) return "Heatmap, no data"
    val busiest = cells.maxBy { it.path("value").asDouble(0.0) }
    val label = busiest.text("label").let { if (it.isNotBlank()) " ($it)" else "" }
    return "Heatmap, ${cells.size} days. Busiest ${busiest.text("date")}: ${formatTick(busiest.path("value").asDouble(0.0))}$label"
}
