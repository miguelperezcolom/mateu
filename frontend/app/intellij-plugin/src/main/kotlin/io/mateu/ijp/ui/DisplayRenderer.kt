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
