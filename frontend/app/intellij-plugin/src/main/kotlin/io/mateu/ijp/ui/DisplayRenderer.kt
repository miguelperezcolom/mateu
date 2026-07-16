package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.dbl
import io.mateu.ijp.api.int
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
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Display components (HeroSection, EmptyState, Skeleton, FoldoutLayout, Gantt) on Swing. */

fun renderHeroSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel(6)
    panel.border = JBUI.Borders.empty(28, 16)
    panel.background = Color(0x2B, 0x3A, 0x55)
    panel.isOpaque = true
    val title = JBLabel(metadata.text("title"), SwingConstants.CENTER)
    title.font = title.font.deriveFont(Font.BOLD, 24f)
    title.foreground = Color.WHITE
    panel.addStacked(title, 6)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle, SwingConstants.CENTER)
        l.foreground = Color(0xD9, 0xE2, 0xF2)
        panel.addStacked(l, 10)
    }
    for (child in component.path("children")) panel.addStacked(r.render(child, state, data), 6)
    return panel
}

fun renderEmptyState(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(28)
    val icon = metadata.text("icon")
    if (icon.isNotBlank()) panel.addStacked(JBLabel(icon, SwingConstants.CENTER).apply { font = font.deriveFont(28f) }, 4)
    val title = metadata.text("title")
    if (title.isNotBlank()) panel.addStacked(JBLabel(title, SwingConstants.CENTER).apply { font = font.deriveFont(Font.BOLD, 15f) }, 2)
    val description = metadata.text("description")
    if (description.isNotBlank()) {
        panel.addStacked(JBLabel(description, SwingConstants.CENTER).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, 6)
    }
    val actionId = metadata.text("actionId")
    if (actionId.isNotBlank()) {
        val row = JPanel(FlowLayout(FlowLayout.CENTER, 0, 0))
        row.isOpaque = false
        row.add(JButton(metadata.text("actionLabel", actionId)).apply {
            addActionListener { r.ctx.runAction(actionId, null) }
        })
        panel.addStacked(row, 0)
    }
    return panel
}

/** Kanban: a horizontal row of columns, each a header (title + count) and a stack of cards. */
fun renderKanban(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val board = JPanel(FlowLayout(FlowLayout.LEFT, 12, 0))
    board.isOpaque = false
    for (column in metadata.arr("columns")) {
        val col = verticalPanel(6)
        col.border = JBUI.Borders.empty(10)
        col.background = Color(0xF4, 0xF4, 0xF5)
        col.isOpaque = true
        col.preferredSize = Dimension(220, col.preferredSize.height)
        val head = JBLabel("${column.text("title")}  (${column.arr("cards").size})")
        head.font = head.font.deriveFont(Font.BOLD)
        col.addStacked(head, 6)
        for (card in column.arr("cards")) {
            val cardPanel = verticalPanel(3)
            cardPanel.border = JBUI.Borders.empty(8)
            cardPanel.background = JBColor.background()
            cardPanel.isOpaque = true
            cardPanel.addStacked(JBLabel(card.text("title")).apply { font = font.deriveFont(Font.BOLD) }, 2)
            val desc = card.text("description")
            if (desc.isNotBlank()) {
                cardPanel.addStacked(JBLabel(desc).apply {
                    foreground = JBUI.CurrentTheme.Label.disabledForeground()
                }, 2)
            }
            val badge = card.text("badge")
            if (badge.isNotBlank()) cardPanel.addStacked(JBLabel(badge), 0)
            val actionId = card.text("actionId")
            if (actionId.isNotBlank()) {
                cardPanel.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
                cardPanel.addMouseListener(object : java.awt.event.MouseAdapter() {
                    override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
                })
            }
            col.addStacked(cardPanel, 6)
        }
        board.add(col)
    }
    return board
}

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
                foreground = JBUI.CurrentTheme.Label.disabledForeground()
            }, 0)
        }
        row.add(body, BorderLayout.CENTER)
        val actionId = item.text("actionId")
        if (actionId.isNotBlank()) {
            row.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            row.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
            })
        }
        panel.addStacked(row, 10)
    }
    return panel
}

/** ProgressSteps: a horizontal row of numbered dots + labels, colored by status. */
fun renderProgressSteps(metadata: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    row.isOpaque = false
    val steps = metadata.arr("steps")
    for ((i, step) in steps.withIndex()) {
        val status = step.text("status", "upcoming")
        val cell = verticalPanel(2)
        cell.border = JBUI.Borders.empty(0, 8)
        val label = if (status == "done") "✓" else (i + 1).toString()
        val dot = JBLabel(label, SwingConstants.CENTER)
        dot.foreground =
            when (status) {
                "done" -> Color(0x1A, 0x73, 0xE8)
                "current" -> Color(0x1A, 0x73, 0xE8)
                else -> JBUI.CurrentTheme.Label.disabledForeground()
            }
        dot.font = dot.font.deriveFont(Font.BOLD, 15f)
        cell.addStacked(dot, 2)
        cell.addStacked(JBLabel(step.text("title"), SwingConstants.CENTER).apply {
            if (status == "upcoming") foreground = JBUI.CurrentTheme.Label.disabledForeground()
            else font = font.deriveFont(Font.BOLD)
        }, 0)
        val desc = step.text("description")
        if (desc.isNotBlank()) {
            cell.addStacked(JBLabel(desc, SwingConstants.CENTER).apply {
                foreground = JBUI.CurrentTheme.Label.disabledForeground()
            }, 0)
        }
        row.add(cell)
    }
    return row
}

/** Stat: a KPI tile — label, big value + unit, delta colored by trend, and a sparkline. */
fun renderStat(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val trend = metadata.text("trend", "up")
    val trendColor =
        when (trend) {
            "down" -> Color(0xE1, 0x1D, 0x48)
            "flat" -> JBUI.CurrentTheme.Label.disabledForeground()
            else -> Color(0x12, 0xB7, 0x6A)
        }
    val tile = verticalPanel(2)
    tile.border = JBUI.Borders.empty(12)
    val label = metadata.text("label")
    if (label.isNotBlank()) {
        tile.addStacked(JBLabel(label).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
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
        tile.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        tile.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
        })
    }
    return tile
}

/** Calendar (agenda view on Swing): the month header + a list of events sorted by date. */
fun renderCalendar(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(4)
    val month = metadata.text("month")
    if (month.isNotBlank()) {
        val m = runCatching { LocalDate.parse(month) }.getOrNull()
        val label = m?.let { "${it.month.name.lowercase().replaceFirstChar { c -> c.uppercase() }} ${it.year}" } ?: month
        panel.addStacked(JBLabel(label).apply { font = font.deriveFont(Font.BOLD, 15f) }, 6)
    }
    val events =
        metadata.arr("events")
            .filter { it.text("date").isNotBlank() }
            .sortedBy { it.text("date") }
    for (event in events) {
        val row = JPanel(BorderLayout(8, 0))
        row.isOpaque = false
        val d = runCatching { LocalDate.parse(event.text("date")) }.getOrNull()
        val dateLabel = d?.let { "${it.dayOfMonth} ${it.dayOfWeek.name.take(3)}" } ?: event.text("date")
        row.add(JBLabel(dateLabel).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, BorderLayout.WEST)
        val chip = JBLabel(event.text("title"))
        runCatching { Color.decode(event.text("color")) }.getOrNull()?.let { chip.foreground = it }
        row.add(chip, BorderLayout.CENTER)
        val actionId = event.text("actionId")
        if (actionId.isNotBlank()) {
            row.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            row.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
            })
        }
        panel.addStacked(row, 6)
    }
    return panel
}

/** PricingTable: a horizontal row of plan cards, the featured one ringed, with a CTA button. */
fun renderPricingTable(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 12, 0))
    row.isOpaque = false
    for (plan in metadata.arr("plans")) {
        val featured = plan.path("featured").asBoolean(false)
        val card = verticalPanel(4)
        card.border =
            if (featured) JBUI.Borders.customLine(Color(0x1A, 0x73, 0xE8), 2)
            else JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1)
        card.preferredSize = Dimension(190, card.preferredSize.height)
        if (featured) card.addStacked(JBLabel("RECOMMENDED").apply {
            foreground = Color(0x1A, 0x73, 0xE8)
            font = font.deriveFont(Font.BOLD, 10f)
        }, 2)
        card.addStacked(JBLabel(plan.text("name")).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, 2)
        val price = plan.text("price") + plan.text("period").let { if (it.isNotBlank()) " $it" else "" }
        card.addStacked(JBLabel(price).apply { font = font.deriveFont(Font.BOLD, 22f) }, 4)
        for (feature in plan.arr("features")) {
            card.addStacked(JBLabel("✓ ${feature.asText()}"), 2)
        }
        val ctaLabel = plan.text("ctaLabel")
        val actionId = plan.text("actionId")
        if (ctaLabel.isNotBlank()) {
            card.addStacked(JButton(ctaLabel).apply {
                if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
            }, 0)
        }
        row.add(card)
    }
    return row
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
        row.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        row.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
        })
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

/** FeatureGrid: a vertical list of feature cards (icon + title + description) on Swing. */
fun renderFeatureGrid(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(8)
    for (feature in metadata.arr("features")) {
        val card = verticalPanel(3)
        card.border = JBUI.Borders.compound(
            JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1),
            JBUI.Borders.empty(10))
        val icon = feature.text("icon")
        val title = feature.text("title")
        card.addStacked(JBLabel((if (icon.isNotBlank() && !icon.contains(":")) "$icon " else "") + title).apply {
            font = font.deriveFont(Font.BOLD, 14f)
        }, 2)
        val desc = feature.text("description")
        if (desc.isNotBlank()) {
            card.addStacked(JBLabel(desc).apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() }, 0)
        }
        val actionId = feature.text("actionId")
        if (actionId.isNotBlank()) {
            card.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            card.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
            })
        }
        panel.addStacked(card, 8)
    }
    return panel
}

/** Testimonials: a vertical list of quote cards (stars + quote + author) on Swing. */
fun renderTestimonials(metadata: JsonNode): JComponent {
    val panel = verticalPanel(8)
    for (item in metadata.arr("items")) {
        val card = verticalPanel(3)
        card.border = JBUI.Borders.compound(
            JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1),
            JBUI.Borders.empty(12))
        val rating = item.path("rating").asInt(0).coerceIn(0, 5)
        if (rating > 0) {
            card.addStacked(JBLabel("★".repeat(rating) + "☆".repeat(5 - rating)).apply {
                foreground = Color(0xF5, 0xA6, 0x23)
            }, 2)
        }
        card.addStacked(JBLabel("<html><i>“${item.text("quote")}”</i></html>"), 4)
        val avatar = item.text("avatar")
        val author = item.text("author") + item.text("role").let { if (it.isNotBlank()) " · $it" else "" }
        card.addStacked(JBLabel((if (avatar.isNotBlank() && !avatar.contains(":")) "$avatar " else "") + author).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, 0)
        panel.addStacked(card, 8)
    }
    return panel
}

/** Faq: a list of question (bold) + answer rows on Swing. */
fun renderFaq(metadata: JsonNode): JComponent {
    val panel = verticalPanel(6)
    for (item in metadata.arr("items")) {
        val row = verticalPanel(2)
        row.border = JBUI.Borders.emptyBottom(6)
        row.addStacked(JBLabel(item.text("question")).apply { font = font.deriveFont(Font.BOLD) }, 2)
        row.addStacked(JBLabel("<html>${item.text("answer")}</html>").apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, 0)
        panel.addStacked(row, 6)
    }
    return panel
}

/** CalloutCard: a themed call-to-action block (icon + title + description + CTA button) on Swing. */
fun renderCalloutCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val accent = when (metadata.text("theme")) {
        "success" -> Color(0x12, 0xB7, 0x6A)
        "warning" -> Color(0xF5, 0x9E, 0x0B)
        "danger" -> Color(0xE1, 0x1D, 0x48)
        else -> Color(0x1A, 0x73, 0xE8)
    }
    val body = verticalPanel(3)
    val icon = metadata.text("icon")
    val title = metadata.text("title")
    body.addStacked(JBLabel((if (icon.isNotBlank() && !icon.contains(":")) "$icon " else "") + title).apply {
        font = font.deriveFont(Font.BOLD, 15f)
    }, 2)
    val desc = metadata.text("description")
    if (desc.isNotBlank()) {
        body.addStacked(JBLabel("<html>$desc</html>").apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, 4)
    }
    val ctaLabel = metadata.text("ctaLabel")
    val actionId = metadata.text("actionId")
    if (ctaLabel.isNotBlank()) {
        body.addStacked(JButton(ctaLabel).apply {
            if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
        }, 0)
    }
    val panel = JPanel(BorderLayout())
    panel.border = JBUI.Borders.compound(JBUI.Borders.customLine(accent, 0, 4, 0, 0), JBUI.Borders.empty(14))
    panel.background = Color(accent.red, accent.green, accent.blue, 24)
    panel.isOpaque = true
    panel.add(body, BorderLayout.CENTER)
    return panel
}

/** CommentThread: nested comments, replies indented under their parent, on Swing. */
fun renderCommentThread(metadata: JsonNode): JComponent {
    val panel = verticalPanel(6)
    for (comment in metadata.arr("comments")) commentNode(panel, comment, 0)
    return panel
}

private fun commentNode(panel: JPanel, comment: JsonNode, depth: Int) {
    val row = verticalPanel(2)
    row.border = JBUI.Borders.emptyLeft(depth * 16)
    val author = comment.text("author")
    val ts = comment.text("timestamp")
    row.addStacked(JBLabel(author + (if (ts.isNotBlank()) "  $ts" else "")).apply {
        font = font.deriveFont(Font.BOLD)
    }, 2)
    row.addStacked(JBLabel("<html>${comment.text("text")}</html>"), 0)
    panel.addStacked(row, 6)
    for (reply in comment.arr("replies")) commentNode(panel, reply, depth + 1)
}

/** FileList: rows of type-icon + name + size on Swing. */
fun renderFileList(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val icons = mapOf(
        "pdf" to "📕", "image" to "🖼", "doc" to "📘", "docx" to "📘", "word" to "📘",
        "xls" to "📗", "xlsx" to "📗", "excel" to "📗", "zip" to "🗜", "video" to "🎬", "audio" to "🎵")
    val panel = verticalPanel(0)
    for (file in metadata.arr("files")) {
        val row = JPanel(BorderLayout(8, 0))
        row.border = JBUI.Borders.empty(6, 8)
        row.isOpaque = false
        val icon = icons[file.text("type").lowercase()] ?: "📄"
        row.add(JBLabel("$icon  ${file.text("name")}"), BorderLayout.WEST)
        val size = file.text("size")
        if (size.isNotBlank()) row.add(JBLabel(size).apply {
            foreground = JBUI.CurrentTheme.Label.disabledForeground()
        }, BorderLayout.EAST)
        val actionId = file.text("actionId")
        if (actionId.isNotBlank()) {
            row.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            row.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
            })
        }
        panel.addStacked(row, 0)
    }
    return panel
}

/** Checklist: a title + N/total count and a list of checkbox rows on Swing. */
fun renderChecklist(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(3)
    val items = metadata.arr("items").toList()
    val done = items.count { it.path("done").asBoolean(false) }
    val title = metadata.text("title")
    panel.addStacked(JBLabel((if (title.isNotBlank()) "$title  " else "") + "($done / ${items.size})").apply {
        font = font.deriveFont(Font.BOLD)
    }, 6)
    for (item in items) {
        val isDone = item.path("done").asBoolean(false)
        val box = if (isDone) "☑" else "☐"
        val row = JBLabel("$box  ${item.text("label")}")
        if (isDone) row.foreground = JBUI.CurrentTheme.Label.disabledForeground()
        val actionId = item.text("actionId")
        if (actionId.isNotBlank()) {
            row.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            row.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) = r.ctx.runAction(actionId, null)
            })
        }
        panel.addStacked(row, 3)
    }
    return panel
}

// ── Front-office UX components (EntityHeader, Meter, …) ───────────────────────

/** de-DE style money formatting: 1234.5 → "1.234,50" (fixed 2 decimals, thousands dots). */
internal fun uxFormatAmount(value: Double): String =
    java.text.DecimalFormat("#,##0.00", java.text.DecimalFormatSymbols(java.util.Locale.GERMANY)).format(value)

/** Badge palette (normal | success | warning | error | contrast) as theme-aware foregrounds. */
internal fun uxPaletteColor(color: String): Color = when (color.lowercase()) {
    "success", "ok" -> JBColor(0x3E8635, 0x4CAF50)
    "error", "danger" -> JBColor(0xC9190B, 0xE57373)
    "warning" -> JBColor(0xF0AB00, 0xFFB74D)
    "contrast" -> JBColor(0x1F2937, 0xCBD5E1)
    else -> JBColor(0x6A6E73, 0x9AA0A6)
}

/** Badge palette as solid chip backgrounds (white text stays readable in both themes). */
private fun uxChipBg(color: String): Color = when (color.lowercase()) {
    "success", "ok" -> Color(0x3E, 0x86, 0x35)
    "error", "danger" -> Color(0xC9, 0x19, 0x0B)
    "warning" -> Color(0xF0, 0xAB, 0x00)
    "contrast" -> Color(0x1F, 0x29, 0x37)
    else -> Color(0x6A, 0x6E, 0x73)
}

private fun uxChip(text: String, color: String): JBLabel = JBLabel(text).apply {
    foreground = Color.WHITE
    isOpaque = true
    background = uxChipBg(color)
    border = JBUI.Borders.empty(1, 6)
    font = font.deriveFont(Font.BOLD, 10f)
}

private fun uxMuted(): Color = JBUI.CurrentTheme.Label.disabledForeground()

private fun uxAccent(): Color = JBColor(0x1A73E8, 0x548AF7)

/** Circular initials avatar (e.g. a guest's initials on a StatusList row). */
private fun uxAvatar(initials: String, sizePx: Int): JComponent = object : JComponent() {
    init {
        val s = JBUI.scale(sizePx)
        preferredSize = Dimension(s, s)
        minimumSize = preferredSize
        maximumSize = preferredSize
    }
    override fun paintComponent(g: Graphics) {
        val g2 = g as Graphics2D
        g2.setRenderingHint(
            java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
        val d = minOf(width, height)
        g2.color = Color(0x1A, 0x73, 0xE8, 0x22)
        g2.fillOval((width - d) / 2, (height - d) / 2, d, d)
        g2.color = uxAccent()
        g2.font = font.deriveFont(Font.BOLD, JBUI.scale(10).toFloat())
        val fm = g2.fontMetrics
        g2.drawString(
            initials,
            (width - fm.stringWidth(initials)) / 2,
            (height - fm.height) / 2 + fm.ascent)
    }
}

private fun uxTint(base: Color): Color = Color(base.red, base.green, base.blue, 24)

private fun uxMono(base: Font, style: Int = Font.BOLD, size: Int = 0): Font =
    Font(Font.MONOSPACED, style, if (size > 0) size else base.size)

/** EntityHeader: title + badges + subtitle + facts on the left, highlighted metric on the right. */
fun renderEntityHeader(metadata: JsonNode): JComponent {
    val panel = JPanel(BorderLayout(16, 0))
    panel.isOpaque = false
    panel.border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(12))
    val left = verticalPanel(2)
    val titleRow = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0)).apply { isOpaque = false }
    titleRow.add(JBLabel(metadata.text("title")).apply { font = font.deriveFont(Font.BOLD, 16f) })
    for (badge in metadata.arr("badges")) titleRow.add(uxChip(badge.text("label"), badge.text("color")))
    left.addStacked(titleRow, 2)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) left.addStacked(JBLabel(subtitle).apply { foreground = uxMuted() }, 6)
    val facts = metadata.arr("facts")
    if (facts.isNotEmpty()) {
        val factsRow = JPanel(FlowLayout(FlowLayout.LEFT, 18, 0)).apply { isOpaque = false }
        for (fact in facts) {
            val cell = verticalPanel(1)
            cell.addStacked(JBLabel(fact.text("label")).apply {
                font = font.deriveFont(Font.BOLD, 9f)
                foreground = uxMuted()
            }, 1)
            cell.addStacked(JBLabel(fact.text("value")), 0)
            factsRow.add(cell)
        }
        left.addStacked(factsRow, 0)
    }
    panel.add(left, BorderLayout.CENTER)
    val metricValue = metadata.text("metricValue")
    if (metricValue.isNotBlank()) {
        val metric = verticalPanel(1)
        val metricLabel = metadata.text("metricLabel")
        if (metricLabel.isNotBlank()) metric.addStacked(JBLabel(metricLabel).apply {
            font = font.deriveFont(Font.BOLD, 9f)
            foreground = uxMuted()
        }, 1)
        metric.addStacked(JBLabel(metricValue).apply {
            font = font.deriveFont(Font.BOLD, 22f)
            foreground = uxAccent()
        }, 1)
        val caption = metadata.text("metricCaption")
        if (caption.isNotBlank()) metric.addStacked(JBLabel(caption).apply { foreground = uxMuted() }, 0)
        panel.add(metric, BorderLayout.EAST)
    }
    return panel
}

/** Meter: label + big formatted value + painted progress track colored by thresholds + caption. */
fun renderMeter(metadata: JsonNode): JComponent {
    val value = metadata.dbl("value")
    val max = metadata.dbl("max")
    val ratio = if (max > 0) (value / max).coerceIn(0.0, 1.0) else 0.0
    val warnAt = metadata.path("warnAt")
    val dangerAt = metadata.path("dangerAt")
    val fill = when {
        dangerAt.isNumber && value >= dangerAt.asDouble() -> uxPaletteColor("error")
        warnAt.isNumber && value >= warnAt.asDouble() -> uxPaletteColor("warning")
        warnAt.isNumber || dangerAt.isNumber -> uxPaletteColor("success")
        else -> uxAccent()
    }
    val panel = verticalPanel(3)
    val label = metadata.text("label")
    if (label.isNotBlank()) panel.addStacked(JBLabel(label).apply {
        font = font.deriveFont(Font.BOLD, 10f)
        foreground = uxMuted()
    }, 2)
    val unit = metadata.text("unit")
    panel.addStacked(JBLabel(uxFormatAmount(value) + (if (unit.isNotBlank()) " $unit" else "")).apply {
        font = font.deriveFont(Font.BOLD, 22f)
    }, 4)
    val track = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            g2.color = JBColor.border()
            g2.fillRoundRect(0, 0, width, height, height, height)
            g2.color = fill
            g2.fillRoundRect(0, 0, (width * ratio).toInt(), height, height, height)
        }
    }
    track.isOpaque = false
    track.preferredSize = Dimension(280, 8)
    panel.addStacked(track, 4)
    val caption = metadata.text("caption").ifBlank { "${Math.round(ratio * 100)}%" }
    panel.addStacked(JBLabel(caption).apply { foreground = uxMuted() }, 0)
    return panel
}

/** TaskProgress: tinted banner with icon + label + i/total pills + CTA (hidden when complete). */
fun renderTaskProgress(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val total = metadata.int("total")
    val done = metadata.int("done")
    val complete = total > 0 && done >= total
    val panel = JPanel(BorderLayout(10, 0))
    panel.isOpaque = true
    panel.background = uxTint(uxChipBg(if (complete) "success" else "warning"))
    panel.border = JBUI.Borders.empty(10, 12)
    panel.add(JBLabel("👥  " + metadata.text("label")), BorderLayout.WEST)
    val pills = JPanel(FlowLayout(FlowLayout.LEFT, 4, 0)).apply { isOpaque = false }
    for (i in 1..total) {
        if (i <= done) pills.add(uxChip("$i/$total", "success"))
        else pills.add(JBLabel("$i/$total").apply {
            foreground = uxMuted()
            font = font.deriveFont(Font.BOLD, 10f)
            border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(0, 5))
        })
    }
    panel.add(pills, BorderLayout.CENTER)
    val actionId = metadata.text("actionId")
    val actionLabel = metadata.text("actionLabel")
    if (!complete && actionId.isNotBlank() && actionLabel.isNotBlank()) {
        panel.add(JButton("$actionLabel →").apply {
            addActionListener { r.ctx.runAction(actionId, null) }
        }, BorderLayout.EAST)
    }
    return panel
}

/** StatusList: bordered rows of icon + title/description with a status chip and/or action button. */
/** A compact inline banner: theme-tinted strip with a severity icon, one line of text (plus any
 * slotted child components below it) and an optional right-aligned action. */
fun renderNotice(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val theme = metadata.text("theme").ifBlank { "info" }
    val bg = when (theme) {
        "success" -> Color(0xE2, 0xF3, 0xE6)
        "warning" -> Color(0xFD, 0xF0, 0xDC)
        "danger" -> Color(0xF6, 0xE0, 0xDA)
        else -> Color(0xE3, 0xF0, 0xFB)
    }
    val ink = when (theme) {
        "success" -> Color(0x22, 0x70, 0x3A)
        "warning" -> Color(0x92, 0x5A, 0x13)
        "danger" -> Color(0xA5, 0x50, 0x2E)
        else -> Color(0x1A, 0x5D, 0xAD)
    }
    val glyph = metadata.text("icon").ifBlank { if (theme == "success") "✓" else if (theme == "info") "ℹ" else "!" }
    val row = JPanel(BorderLayout(8, 0))
    row.background = bg
    row.isOpaque = true
    row.border = if (metadata.bool("slim")) JBUI.Borders.empty(3, 6) else JBUI.Borders.empty(8, 10)
    row.add(JBLabel(glyph).apply { foreground = ink; font = font.deriveFont(Font.BOLD) }, BorderLayout.WEST)
    val body = verticalPanel(4)
    body.isOpaque = false
    if (metadata.text("text").isNotBlank()) {
        body.addStacked(JBLabel(metadata.text("text")).apply {
            foreground = ink
            font = font.deriveFont(Font.BOLD)
        }, 0)
    }
    val children = component.path("children")
    if (children.isArray) {
        children.forEach { child -> body.addStacked(r.render(child, state, data), 2) }
    }
    row.add(body, BorderLayout.CENTER)
    val actionId = metadata.text("actionId")
    val actionLabel = metadata.text("actionLabel")
    if (actionId.isNotBlank() && actionLabel.isNotBlank()) {
        row.add(JButton(actionLabel).apply {
            addActionListener { r.ctx.runAction(actionId, emptyMap()) }
        }, BorderLayout.EAST)
    }
    return row
}

/** A plain bulleted list of text items — StatusList's lightweight sibling. */
fun renderBulletedList(metadata: JsonNode): JComponent {
    val panel = verticalPanel(2)
    for (item in metadata.arr("items")) {
        panel.addStacked(JBLabel("• ${item.asText("")}"), 0)
    }
    return panel
}

fun renderStatusList(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(0)
    panel.border = JBUI.Borders.customLine(JBColor.border(), 1)
    val compact = metadata.bool("compact")
    for (item in metadata.arr("items")) {
        val row = JPanel(BorderLayout(8, 0))
        row.isOpaque = false
        row.border = if (compact) JBUI.Borders.empty(4, 8) else JBUI.Borders.empty(8, 10)
        val avatar = item.text("avatar")
        val icon = item.text("icon")
        if (avatar.isNotBlank()) {
            row.add(uxAvatar(avatar, if (compact) 22 else 28), BorderLayout.WEST)
        } else if (icon.isNotBlank()) row.add(JBLabel(icon).apply { font = font.deriveFont(15f) }, BorderLayout.WEST)
        val body = verticalPanel(1)
        body.addStacked(JBLabel(item.text("title")).apply { font = font.deriveFont(Font.BOLD) }, 1)
        val desc = item.text("description")
        if (desc.isNotBlank()) body.addStacked(JBLabel(desc).apply { foreground = uxMuted() }, 0)
        row.add(body, BorderLayout.CENTER)
        val right = JPanel(FlowLayout(FlowLayout.RIGHT, 6, 0)).apply { isOpaque = false }
        val status = item.text("status")
        if (status.isNotBlank()) right.add(uxChip(status, item.text("statusColor")))
        val actionId = item.text("actionId")
        val actionLabel = item.text("actionLabel")
        if (actionId.isNotBlank() && actionLabel.isNotBlank()) {
            val id = item.text("id")
            right.add(JButton(actionLabel).apply {
                addActionListener { r.ctx.runAction(actionId, mapOf("_item" to id)) }
            })
        }
        if (right.componentCount > 0) row.add(right, BorderLayout.EAST)
        panel.addStacked(row, 0)
    }
    return panel
}

/** ComparisonCard: two labelled values side by side with a delta chip between them. */
fun renderComparisonCard(metadata: JsonNode): JComponent {
    val title = metadata.text("title")
    val trend = metadata.text("trend", "flat")
    val delta = metadata.text("delta")
    val panel = verticalPanel(6)
    if (title.isNotBlank()) {
        panel.addStacked(JBLabel(title).apply { font = font.deriveFont(Font.BOLD) }, 6)
    }
    val row = JPanel(BorderLayout(JBUI.scale(12), 0)).apply { isOpaque = false }

    fun side(label: String, value: String): JComponent {
        val p = verticalPanel(1)
        if (label.isNotBlank()) {
            p.addStacked(JBLabel(label.uppercase()).apply {
                foreground = JBUI.CurrentTheme.Label.disabledForeground()
                font = font.deriveFont(font.size2D - 2f)
            }, 1)
        }
        p.addStacked(JBLabel(value).apply { font = font.deriveFont(Font.BOLD, font.size2D + 8f) }, 1)
        return p
    }

    row.add(side(metadata.text("leftLabel"), metadata.text("leftValue")), BorderLayout.WEST)
    row.add(side(metadata.text("rightLabel"), metadata.text("rightValue")), BorderLayout.EAST)
    if (delta.isNotBlank()) {
        val mark = when (trend) { "up" -> "▲"; "down" -> "▼"; else -> "" }
        val color = when (trend) {
            "up" -> Color(0x12, 0xB7, 0x6A)
            "down" -> Color(0xE1, 0x1D, 0x48)
            else -> JBUI.CurrentTheme.Label.disabledForeground()
        }
        row.add(JBLabel("$mark $delta").apply { foreground = color; horizontalAlignment = javax.swing.SwingConstants.CENTER }, BorderLayout.CENTER)
    }
    panel.addStacked(row, 3)
    return panel
}

/** TaskQueue: grouped rail of clickable cards; clicking selects locally + fires the actionId. */
fun renderTaskQueue(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val panel = verticalPanel(4)
    val cards = mutableListOf<Pair<String, JPanel>>()
    var selectedId = metadata.arr("groups").flatMap { it.arr("items") }
        .firstOrNull { it.bool("selected") }?.text("id") ?: ""
    fun restyle() {
        for ((id, card) in cards) {
            val sel = id.isNotBlank() && id == selectedId
            card.border =
                if (sel) JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(7))
                else JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8))
            card.isOpaque = sel
            card.background = uxTint(uxAccent())
            card.repaint()
        }
    }
    for (group in metadata.arr("groups")) {
        val label = group.text("label")
        if (label.isNotBlank()) panel.addStacked(JBLabel(label.uppercase()).apply {
            font = font.deriveFont(Font.BOLD, 10f)
            foreground = uxMuted()
        }, 4)
        for (item in group.arr("items")) {
            val id = item.text("id")
            val card = verticalPanel(2)
            card.addStacked(JBLabel(item.text("title")).apply { font = font.deriveFont(Font.BOLD) }, 2)
            val foot = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0)).apply { isOpaque = false }
            val caption = item.text("caption")
            if (caption.isNotBlank()) foot.add(JBLabel(caption).apply { foreground = uxMuted() })
            for (badge in item.arr("badges")) foot.add(uxChip(badge.text("label"), badge.text("color")))
            if (foot.componentCount > 0) card.addStacked(foot, 0)
            card.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            card.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) {
                    selectedId = id
                    restyle()
                    if (actionId.isNotBlank()) r.ctx.runAction(actionId, mapOf("_item" to id))
                }
            })
            cards += id to card
            panel.addStacked(card, 6)
        }
    }
    restyle()
    return panel
}

/** ResourceGrid: a fixed-column grid of selectable resource cards (room picker). */
fun renderResourceGrid(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val columns = metadata.int("columns").let { if (it > 0) it else 3 }
    val recommendedLabel = metadata.text("recommendedLabel", "Recommended")
    val grid = JPanel(java.awt.GridLayout(0, columns, 8, 8)).apply { isOpaque = false }
    val items = metadata.arr("items")
    val cards = mutableListOf<Triple<String, JPanel, Boolean>>() // id, card, recommended
    var selectedId = items.firstOrNull { it.bool("selected") }?.text("id") ?: ""
    fun restyle() {
        for ((id, card, recommended) in cards) {
            val sel = id.isNotBlank() && id == selectedId
            card.border =
                if (sel || recommended) JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(7))
                else JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8))
            card.isOpaque = sel
            card.background = uxTint(uxAccent())
            card.repaint()
        }
    }
    for (item in items) {
        val id = item.text("id")
        val disabled = item.bool("disabled")
        val recommended = item.bool("recommended")
        val card = verticalPanel(2)
        if (recommended) card.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
            isOpaque = false
            add(JBLabel(recommendedLabel).apply {
                foreground = Color.WHITE
                isOpaque = true
                background = uxAccent()
                border = JBUI.Borders.empty(0, 4)
                font = font.deriveFont(Font.BOLD, 8f)
            })
        }, 2)
        card.addStacked(JBLabel(item.text("title")).apply {
            font = font.deriveFont(Font.BOLD, 16f)
            if (disabled) foreground = uxMuted()
        }, 1)
        val subtitle = item.text("subtitle")
        if (subtitle.isNotBlank()) card.addStacked(JBLabel(subtitle).apply { foreground = uxMuted() }, 2)
        val statusLabel = item.text("statusLabel")
        if (statusLabel.isNotBlank()) card.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
            isOpaque = false
            add(uxChip(statusLabel, item.text("statusColor")))
        }, 2)
        val note = item.text("note")
        if (note.isNotBlank()) card.addStacked(JBLabel("● $note").apply {
            foreground = uxPaletteColor(item.text("noteColor"))
            font = font.deriveFont(10f)
        }, 0)
        if (!disabled) {
            card.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
            card.addMouseListener(object : java.awt.event.MouseAdapter() {
                override fun mouseClicked(e: java.awt.event.MouseEvent) {
                    selectedId = id
                    restyle()
                    if (actionId.isNotBlank()) r.ctx.runAction(actionId, mapOf("_item" to id))
                }
            })
        }
        cards += Triple(id, card, recommended)
        grid.add(card)
    }
    restyle()
    return grid
}

/** OfferCard: optional image + tag chip + title/subtitle + feature chips + footer CTA/current label. */
fun renderOfferCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val current = metadata.bool("current")
    val panel = verticalPanel(4)
    panel.border =
        if (current) JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(12))
        else JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(11))
    val image = metadata.text("image")
    if (image.isNotBlank()) {
        val img = runCatching { javax.imageio.ImageIO.read(java.net.URI.create(image).toURL()) }.getOrNull()
        if (img != null) {
            val scale = minOf(1.0, 320.0 / img.width)
            panel.addStacked(JBLabel(javax.swing.ImageIcon(
                img.getScaledInstance((img.width * scale).toInt(), (img.height * scale).toInt(), java.awt.Image.SCALE_SMOOTH))), 6)
        }
    }
    val tag = metadata.text("tag")
    if (tag.isNotBlank()) panel.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
        isOpaque = false
        add(uxChip(tag, "contrast"))
    }, 4)
    panel.addStacked(JBLabel(metadata.text("title")).apply { font = font.deriveFont(Font.BOLD, 15f) }, 2)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) panel.addStacked(JBLabel(subtitle).apply { foreground = uxMuted() }, 4)
    val features = metadata.arr("features")
    if (features.isNotEmpty()) {
        val row = JPanel(FlowLayout(FlowLayout.LEFT, 6, 2)).apply { isOpaque = false }
        for (feature in features) row.add(JBLabel(feature.asText()).apply {
            border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(1, 6))
        })
        panel.addStacked(row, 6)
    }
    if (current) {
        val currentLabel = metadata.text("currentLabel")
        if (currentLabel.isNotBlank()) panel.addStacked(JBLabel(currentLabel).apply { foreground = uxMuted() }, 0)
    } else {
        val actionLabel = metadata.text("actionLabel")
        val actionId = metadata.text("actionId")
        if (actionLabel.isNotBlank()) {
            // toggle offers: while added the CTA shows addedLabel in success green
            val added = metadata.bool("added")
            val addedLabel = metadata.text("addedLabel")
            val label = if (added && addedLabel.isNotBlank()) addedLabel else actionLabel
            val priceLabel = metadata.text("priceLabel")
            val text = label + (if (priceLabel.isNotBlank()) "   $priceLabel" else "")
            panel.addStacked(JButton(text).apply {
                if (added) foreground = JBColor(0x3E8635, 0x4CAF50)
                if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
            }, 0)
        }
    }
    return panel
}

/** AddOnPicker: priced extras cards with a +/✓ toggle and a live running total. */
fun renderAddOnPicker(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val currency = metadata.text("currency")
    val totalLabelText = metadata.text("totalLabel")
    val items = metadata.arr("items")
    val added = items.filter { it.bool("added") }.map { it.text("id") }.toMutableSet()
    fun total() = items.filter { added.contains(it.text("id")) }.sumOf { it.dbl("price") }
    val totalLabel = JBLabel().apply {
        font = font.deriveFont(Font.BOLD)
        foreground = uxAccent()
    }
    fun updateTotal() {
        totalLabel.text = (if (totalLabelText.isNotBlank()) "$totalLabelText: " else "") +
            (if (currency.isNotBlank()) "$currency " else "") + uxFormatAmount(total())
    }
    updateTotal()
    val panel = verticalPanel(6)
    panel.addStacked(JPanel(BorderLayout()).apply {
        isOpaque = false
        add(totalLabel, BorderLayout.EAST)
    }, 6)
    for (item in items) {
        val id = item.text("id")
        val includedLabel = item.text("includedLabel")
        val card = JPanel(BorderLayout(10, 0))
        card.isOpaque = false
        card.border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(10))
        val icon = item.text("icon")
        if (icon.isNotBlank()) card.add(JBLabel(icon).apply { font = font.deriveFont(16f) }, BorderLayout.WEST)
        val body = verticalPanel(1)
        body.addStacked(JBLabel(item.text("title")).apply { font = font.deriveFont(Font.BOLD) }, 1)
        val desc = item.text("description")
        if (desc.isNotBlank()) body.addStacked(JBLabel(desc).apply { foreground = uxMuted() }, 1)
        if (includedLabel.isNotBlank()) {
            body.addStacked(JBLabel(includedLabel).apply { foreground = uxMuted() }, 0)
        } else {
            val unit = item.text("unit")
            body.addStacked(JBLabel((if (currency.isNotBlank()) "$currency " else "") +
                uxFormatAmount(item.dbl("price")) + (if (unit.isNotBlank()) " / $unit" else "")).apply {
                font = uxMono(font)
                foreground = uxAccent()
            }, 0)
        }
        card.add(body, BorderLayout.CENTER)
        if (includedLabel.isBlank()) {
            val toggle = JButton(if (added.contains(id)) "✓" else "+")
            toggle.addActionListener {
                val nowAdded = !added.contains(id)
                if (nowAdded) added.add(id) else added.remove(id)
                toggle.text = if (nowAdded) "✓" else "+"
                updateTotal()
                if (actionId.isNotBlank()) {
                    r.ctx.runAction(actionId, mapOf("_item" to id, "_added" to nowAdded, "_total" to total()))
                }
            }
            card.add(toggle, BorderLayout.EAST)
        }
        panel.addStacked(card, 6)
    }
    return panel
}

private fun uxLedgerAmount(amount: Double, currency: String): String =
    (if (amount < 0) "-" else "") + (if (currency.isNotBlank()) "$currency " else "") +
        uxFormatAmount(kotlin.math.abs(amount))

/** Ledger: concept/amount rows (included lines show a label), a divider and the big total. */
fun renderLedger(metadata: JsonNode): JComponent {
    val currency = metadata.text("currency")
    val lines = metadata.arr("lines")
    val panel = verticalPanel(4)
    for (line in lines) {
        val row = JPanel(BorderLayout(12, 0)).apply { isOpaque = false }
        row.add(JBLabel("● " + line.text("concept")), BorderLayout.CENTER)
        if (line.bool("included")) {
            row.add(JBLabel(line.text("includedLabel", "Included")).apply { foreground = uxMuted() }, BorderLayout.EAST)
        } else {
            val amount = line.dbl("amount")
            row.add(JBLabel(uxLedgerAmount(amount, currency)).apply {
                font = uxMono(font)
                if (amount < 0) foreground = uxPaletteColor("error")
            }, BorderLayout.EAST)
        }
        panel.addStacked(row, 4)
    }
    panel.addStacked(javax.swing.JSeparator(), 4)
    val totalNode = metadata.path("total")
    val total =
        if (totalNode.isNumber) totalNode.asDouble()
        else lines.filter { !it.bool("included") }.sumOf { it.dbl("amount") }
    val totalRow = JPanel(BorderLayout(12, 0)).apply { isOpaque = false }
    totalRow.add(JBLabel(metadata.text("totalLabel", "Total")).apply { font = font.deriveFont(Font.BOLD) }, BorderLayout.WEST)
    totalRow.add(JBLabel(uxLedgerAmount(total, currency)).apply { font = uxMono(font, Font.BOLD, font.size + 3) }, BorderLayout.EAST)
    panel.addStacked(totalRow, 0)
    return panel
}

/** PaymentPicker: segmented method toggles + optional context chip + confirm button. */
fun renderPaymentPicker(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    var selected = metadata.text("selected")
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 8, 0)).apply { isOpaque = false }
    val group = javax.swing.ButtonGroup()
    for (method in metadata.arr("methods")) {
        val id = method.text("id")
        if (selected.isBlank()) selected = id
        val btn = javax.swing.JToggleButton(method.text("label", id))
        btn.isSelected = id == selected
        btn.addActionListener { selected = id }
        group.add(btn)
        row.add(btn)
    }
    val contextValue = metadata.text("contextValue")
    if (contextValue.isNotBlank()) {
        val ctxBox = verticalPanel(1)
        ctxBox.isOpaque = true
        ctxBox.background = uxTint(uxChipBg("success"))
        ctxBox.border = JBUI.Borders.empty(4, 8)
        val contextLabel = metadata.text("contextLabel")
        if (contextLabel.isNotBlank()) ctxBox.addStacked(JBLabel(contextLabel).apply {
            font = font.deriveFont(Font.BOLD, 9f)
            foreground = uxPaletteColor("success")
        }, 1)
        ctxBox.addStacked(JBLabel(contextValue).apply { font = uxMono(font) }, 0)
        row.add(ctxBox)
    }
    val panel = JPanel(BorderLayout(8, 0)).apply { isOpaque = false }
    panel.add(row, BorderLayout.WEST)
    val confirmLabel = metadata.text("confirmLabel")
    if (confirmLabel.isNotBlank()) {
        panel.add(JButton(confirmLabel).apply {
            if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, mapOf("_method" to selected)) }
        }, BorderLayout.EAST)
    }
    return panel
}

/** ProcessMonitor: bordered rows of status dot + name/systems + OK/warning/error counters + fix. */
fun renderProcessMonitor(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(0)
    panel.border = JBUI.Borders.customLine(JBColor.border(), 1)
    for (item in metadata.arr("items")) {
        val row = JPanel(BorderLayout(10, 0))
        row.isOpaque = false
        row.border = JBUI.Borders.empty(8, 10)
        row.add(JBLabel("●").apply { foreground = uxPaletteColor(item.text("status", "ok")) }, BorderLayout.WEST)
        val body = verticalPanel(1)
        body.addStacked(JBLabel(item.text("name")).apply { font = font.deriveFont(Font.BOLD) }, 1)
        val systems = item.arr("systems").joinToString(" · ") { it.asText() }
        if (systems.isNotBlank()) body.addStacked(JBLabel(systems).apply {
            foreground = uxMuted()
            font = font.deriveFont(11f)
        }, 0)
        row.add(body, BorderLayout.CENTER)
        val right = JPanel(FlowLayout(FlowLayout.RIGHT, 8, 0)).apply { isOpaque = false }
        right.add(JBLabel("✓ ${item.int("ok")} OK").apply { foreground = uxPaletteColor("success") })
        if (item.int("warnings") > 0) right.add(JBLabel("⚠ ${item.int("warnings")} warnings").apply {
            foreground = uxPaletteColor("warning")
        })
        if (item.int("errors") > 0) right.add(JBLabel("⛔ ${item.int("errors")} errors").apply {
            foreground = uxPaletteColor("error")
        })
        val actionId = item.text("actionId")
        val actionLabel = item.text("actionLabel")
        if (actionId.isNotBlank() && actionLabel.isNotBlank()) {
            right.add(JButton(actionLabel).apply {
                foreground = uxPaletteColor("warning")
                addActionListener { r.ctx.runAction(actionId, null) }
            })
        }
        row.add(right, BorderLayout.EAST)
        panel.addStacked(row, 0)
    }
    return panel
}

fun renderSkeleton(metadata: JsonNode): JComponent {
    val count = metadata.path("count").asInt(1).coerceIn(1, 10)
    val variant = metadata.text("variant", "text")
    val panel = verticalPanel(6)
    repeat(count) {
        val block = JPanel()
        block.background = Color(0xE4, 0xE6, 0xE9)
        block.isOpaque = true
        block.preferredSize = when (variant) {
            "card" -> Dimension(320, 96)
            "grid" -> Dimension(420, 32)
            "form" -> Dimension(320, 40)
            else -> Dimension(280, 16)
        }
        block.maximumSize = block.preferredSize
        panel.addStacked(block, 4)
    }
    return panel
}

/** Foldout: overview stays visible on the left; panels unfold as vertical accordion strips. */
fun renderFoldout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val root = JPanel(BorderLayout(JBUI.scale(10), 0))
    root.isOpaque = false
    val children = component.path("children").toList()
    val panelsInfo = metadata.arr("panels")
    // Overview travels as the child slotted "overview"; panels as "panel-N".
    val overview = children.firstOrNull { it.text("slot") == "overview" } ?: children.firstOrNull()
    if (overview != null) root.add(r.render(overview, state, data), BorderLayout.WEST)

    val panels = verticalPanel(6)
    for ((i, info) in panelsInfo.withIndex()) {
        val content = children.firstOrNull { it.text("slot") == "panel-$i" } ?: continue
        val holder = JPanel(BorderLayout())
        holder.isOpaque = false
        val toggle = JButton("▸ " + info.text("title", "Panel ${i + 1}"))
        toggle.horizontalAlignment = SwingConstants.LEFT
        var body: JComponent? = null
        toggle.addActionListener {
            if (body == null) {
                body = r.render(content, state, data)
                holder.add(body, BorderLayout.CENTER)
                toggle.text = "▾ " + info.text("title", "Panel ${i + 1}")
            } else {
                holder.remove(body)
                body = null
                toggle.text = "▸ " + info.text("title", "Panel ${i + 1}")
            }
            holder.revalidate(); holder.repaint()
        }
        holder.add(toggle, BorderLayout.NORTH)
        if (info.path("open").asBoolean(true)) toggle.doClick()
        panels.addStacked(holder, 4)
    }
    root.add(panels, BorderLayout.CENTER)
    return root
}

/** Gantt: labels column + proportional bars over the tasks' date range, with a today marker. */
fun renderGantt(metadata: JsonNode): JComponent {
    val tasks = metadata.arr("tasks")
    if (tasks.isEmpty()) return JPanel().apply { isOpaque = false }
    val starts = tasks.mapNotNull { runCatching { LocalDate.parse(it.text("start")) }.getOrNull() }
    val ends = tasks.mapNotNull { runCatching { LocalDate.parse(it.text("end")) }.getOrNull() }
    val min = starts.minOrNull() ?: return JPanel()
    val max = ends.maxOrNull() ?: return JPanel()
    val span = ChronoUnit.DAYS.between(min, max).coerceAtLeast(1)

    val panel = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            val labelWidth = 130
            val rowHeight = 26
            val laneWidth = (width - labelWidth - 12).coerceAtLeast(60)
            g2.color = JBUI.CurrentTheme.Label.foreground()
            for ((i, task) in tasks.withIndex()) {
                val y = i * rowHeight
                g2.color = JBUI.CurrentTheme.Label.foreground()
                g2.drawString(task.text("title"), 4, y + 17)
                val s = runCatching { LocalDate.parse(task.text("start")) }.getOrNull() ?: continue
                val e = runCatching { LocalDate.parse(task.text("end")) }.getOrNull() ?: continue
                val x = labelWidth + (ChronoUnit.DAYS.between(min, s).toDouble() / span * laneWidth).toInt()
                val w = (ChronoUnit.DAYS.between(s, e).coerceAtLeast(1).toDouble() / span * laneWidth).toInt().coerceAtLeast(4)
                val color = runCatching { Color.decode(task.text("color")) }.getOrElse { Color(0x00, 0x70, 0xF3) }
                g2.color = Color(color.red, color.green, color.blue, 90)
                g2.fillRoundRect(x, y + 4, w, rowHeight - 10, 6, 6)
                g2.color = color
                val progress = task.path("progress").asInt(0).coerceIn(0, 100)
                g2.fillRoundRect(x, y + 4, (w * progress / 100.0).toInt(), rowHeight - 10, 6, 6)
            }
            // today marker
            val today = LocalDate.now()
            if (!today.isBefore(min) && !today.isAfter(max)) {
                val x = labelWidth + (ChronoUnit.DAYS.between(min, today).toDouble() / span * (width - labelWidth - 12)).toInt()
                g2.color = Color(0xD9, 0x30, 0x25)
                g2.drawLine(x, 0, x, tasks.size * rowHeight)
            }
        }
    }
    panel.isOpaque = false
    panel.preferredSize = Dimension(480, tasks.size * 26 + 8)
    return panel
}

/** A standalone Image component (metadata.src — data URI or URL). */
fun renderStandaloneImage(metadata: JsonNode): JComponent {
    val src = metadata.text("src")
    if (src.isBlank()) return JPanel().apply { isOpaque = false }
    val img = runCatching {
        if (src.startsWith("data:")) {
            val base64 = src.substringAfter("base64,", "")
            if (base64.isNotBlank()) javax.imageio.ImageIO.read(java.util.Base64.getDecoder().decode(base64).inputStream()) else null
        } else {
            javax.imageio.ImageIO.read(java.net.URI.create(src).toURL())
        }
    }.getOrNull()
    return if (img != null) {
        val scale = minOf(1.0, 360.0 / img.width)
        JBLabel(javax.swing.ImageIcon(img.getScaledInstance((img.width * scale).toInt(), (img.height * scale).toInt(), java.awt.Image.SCALE_SMOOTH)))
    } else {
        JBLabel(src)
    }
}
