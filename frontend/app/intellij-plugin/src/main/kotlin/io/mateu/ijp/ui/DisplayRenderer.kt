package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
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
        val head = JBLabel("${column.text("title")}  (${column.arr("cards").size()})")
        head.font = head.font.deriveFont(Font.BOLD)
        col.addStacked(head, 6)
        for (card in column.arr("cards")) {
            val cardPanel = verticalPanel(3)
            cardPanel.border = JBUI.Borders.empty(8)
            cardPanel.background = JBUI.CurrentTheme.Label.background()
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
