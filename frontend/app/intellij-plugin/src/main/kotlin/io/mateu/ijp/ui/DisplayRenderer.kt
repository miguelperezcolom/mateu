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
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Display components: page blocks (HeroSection, EmptyState, Skeleton, FoldoutLayout, Gantt, Image) on Swing. */

/** Display components (HeroSection, EmptyState, Skeleton, FoldoutLayout, Gantt) on Swing. */

fun renderHeroSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel(6)
    panel.border = JBUI.Borders.empty(28, 16)
    // `tone` (ocean, pine, …): a dark tinted band with light ink; absent/unknown → the default look.
    val tone = PageSlots.heroToneColor(metadata.text("tone"))
    panel.background = tone ?: Color(0x2B, 0x3A, 0x55)
    panel.isOpaque = true
    val title = JBLabel(metadata.text("title"), SwingConstants.CENTER)
    title.font = title.font.deriveFont(Font.BOLD, 24f)
    title.foreground = Color.WHITE
    panel.addStacked(title, 6)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle, SwingConstants.CENTER)
        l.foreground = if (tone != null) PageSlots.HERO_SUBTITLE_INK else Color(0xD9, 0xE2, 0xF2)
        panel.addStacked(l, 10)
    }
    for (child in component.path("children")) panel.addStacked(r.render(child, state, data), 6)
    return panel
}

fun renderEmptyState(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(28)
    // An emoji glyph shows; a web icon token ("vaadin:list-select") is not a glyph — it printed as
    // raw text above the title.
    val icon = metadata.text("icon").takeUnless { it.contains(':') }.orEmpty()
    if (icon.isNotBlank()) panel.addStacked(JBLabel(icon, SwingConstants.CENTER).apply { font = font.deriveFont(28f) }, 4)
    val title = metadata.text("title")
    if (title.isNotBlank()) panel.addStacked(JBLabel(title, SwingConstants.CENTER).apply { font = font.deriveFont(Font.BOLD, 15f) }, 2)
    val description = metadata.text("description")
    if (description.isNotBlank()) {
        panel.addStacked(JBLabel(description, SwingConstants.CENTER).apply {
            foreground = ToneColors.secondaryText()
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
    // The VB/Redwood foldout anatomy: a HORIZONTAL row of always-expanded columns — the
    // overview first, then one column per panel, each with its own heading ("Operaciones ·
    // 2 de 7") and widths proportional to the wire's FoldoutPanel.width (rem units; the
    // overview weighs the renderer default, 22).
    val children = component.path("children").toList()
    val panelsInfo = metadata.arr("panels")

    fun column(title: String, subtitle: String, content: JComponent, summary: JComponent? = null): JComponent {
        val col = JPanel(BorderLayout(0, JBUI.scale(8)))
        col.isOpaque = false
        col.border = JBUI.Borders.empty(0, 0, 0, JBUI.scale(16))
        if (title.isNotBlank() || subtitle.isNotBlank() || summary != null) {
            val heading = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false }
            if (title.isNotBlank()) {
                heading.add(JBLabel(title).apply { font = font.deriveFont(Font.BOLD, font.size2D + 3f) })
            }
            if (subtitle.isNotBlank()) {
                heading.add(JBLabel("· $subtitle").apply { foreground = uxMuted() })
            }
            if (summary == null) {
                col.add(heading, BorderLayout.NORTH)
            } else {
                // The panel's `summary` slot — what a FOLDED panel shows. These columns never fold,
                // so it reads as a compact digest line under the heading.
                val top = verticalPanel(2)
                top.addStacked(heading, 2)
                top.addStacked(summary, 0)
                col.add(top, BorderLayout.NORTH)
            }
        }
        // NO inner scroll pane: nested JScrollPanes collapse to 0 in the stacked form (see the
        // renderProbe gotcha) — the page's own scroller handles overflow.
        col.add(content, BorderLayout.CENTER)
        return col
    }

    fun widthUnits(spec: String): Double =
        spec.removeSuffix("rem").trim().toDoubleOrNull() ?: 22.0

    val row = JPanel(java.awt.GridBagLayout())
    row.isOpaque = false
    val constraints = java.awt.GridBagConstraints()
    constraints.gridy = 0
    constraints.anchor = java.awt.GridBagConstraints.NORTHWEST
    constraints.fill = java.awt.GridBagConstraints.BOTH
    constraints.weighty = 1.0

    val overview = children.firstOrNull { it.text("slot") == "overview" }
        ?: children.firstOrNull { !it.text("slot").startsWith("summary-") && !it.text("slot").startsWith("panel-") }
    var gridx = 0
    if (overview != null) {
        constraints.gridx = gridx++
        constraints.weightx = 22.0
        row.add(column(metadata.text("headerTitle"), "", r.render(overview, state, data)), constraints)
    }
    for ((i, info) in panelsInfo.withIndex()) {
        val content = children.firstOrNull { it.text("slot") == "panel-$i" } ?: continue
        constraints.gridx = gridx++
        constraints.weightx = widthUnits(info.text("width", "22rem"))
        val summary = PageSlots.foldoutSummary(children, i)?.let { node ->
            r.render(node, state, data).apply { foreground = uxMuted() }
        }
        row.add(
            column(info.text("title", "Panel ${i + 1}"), info.text("subtitle"), r.render(content, state, data), summary),
            constraints,
        )
    }
    return row
}

/** Gantt: labels column + proportional bars over the tasks' date range, with a today marker. */
fun renderGantt(metadata: JsonNode, ctx: io.mateu.ijp.state.AppContext? = null): JComponent {
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
    // The rows are the minimum too: a JPanel's minimum is its (empty) layout's, i.e. nothing, so a
    // long page squeezed the whole chart to a 10px strip (see ContentHeightScrollPane). The width
    // may still shrink — the lanes scale to it (labelWidth + the 60px lane floor).
    panel.minimumSize = Dimension(130 + 60, tasks.size * 26 + 8)
    // A GanttPage selects a task (its drawer): a click on a row — or Up/Down + Enter — runs
    // onTaskSelectionActionId with the task id. It used to be paint-only here.
    val selectAction = metadata.text("onTaskSelectionActionId")
    if (ctx != null && selectAction.isNotBlank()) {
        var focused = 0
        val select = { i: Int ->
            tasks.getOrNull(i)?.text("id")?.takeIf { it.isNotBlank() }?.let {
                ctx.runAction(selectAction, mapOf("_clickedTaskId" to it))
            }
        }
        panel.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        panel.isFocusable = true
        panel.toolTipText = tasks.getOrNull(0)?.text("title")
        panel.accessibleContext.accessibleName = "Gantt — " + tasks.joinToString(", ") { it.text("title") }
        panel.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) {
                panel.requestFocusInWindow()
                focused = (e.y / 26).coerceIn(0, tasks.size - 1)
                select(focused)
            }
        })
        panel.addKeyListener(object : java.awt.event.KeyAdapter() {
            override fun keyPressed(e: java.awt.event.KeyEvent) {
                when (e.keyCode) {
                    java.awt.event.KeyEvent.VK_DOWN -> focused = (focused + 1).coerceAtMost(tasks.size - 1)
                    java.awt.event.KeyEvent.VK_UP -> focused = (focused - 1).coerceAtLeast(0)
                    java.awt.event.KeyEvent.VK_ENTER, java.awt.event.KeyEvent.VK_SPACE -> { e.consume(); select(focused) }
                    else -> return
                }
                panel.toolTipText = tasks.getOrNull(focused)?.text("title")
                panel.accessibleContext.accessibleDescription = tasks.getOrNull(focused)?.text("title")
            }
        })
    }
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
        // An image Swing cannot decode (an SVG, a broken url): a named placeholder. It used to be
        // the src itself — a data URI dumped as a wall of base64 across the page.
        val shown = if (src.startsWith("data:")) src.substringBefore(";").substringBefore(",").removePrefix("data:") else src
        JBLabel("🖼 $shown").apply {
            toolTipText = shown
            accessibleContext.accessibleName = "Image"
        }
    }
}
