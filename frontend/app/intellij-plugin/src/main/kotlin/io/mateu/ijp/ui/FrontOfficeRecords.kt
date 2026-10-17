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
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Front-office UX components about one record (EntityHeader, Meter, TaskProgress, Notice, BulletedList, StatusList, ComparisonCard, ProcessMonitor) on Swing. */

/** EntityHeader: title + badges + subtitle + facts on the left, highlighted metric on the right. A
 *  fact naming an action gets a compact icon button right after its value (the pencil next to
 *  "EMPRESA"), which runs `actionId` with the fact's `parameters` exactly like a Button. */
fun renderEntityHeader(r: ComponentRenderer, metadata: JsonNode): JComponent {
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
            val actionId = fact.text("actionId")
            if (actionId.isNotBlank()) {
                val valueRow = JPanel(FlowLayout(FlowLayout.LEFT, 4, 0)).apply { isOpaque = false }
                valueRow.add(JBLabel(fact.text("value")))
                valueRow.add(factActionButton(r, fact, actionId))
                cell.addStacked(valueRow, 0)
            } else {
                cell.addStacked(JBLabel(fact.text("value")), 0)
            }
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

/** A fact's action: an icon-only, borderless button named (accessible name + tooltip) by the fact's
 *  `actionLabel`, else its label; the click dispatches like [renderButton]. */
private fun factActionButton(r: ComponentRenderer, fact: JsonNode, actionId: String): JButton {
    val label = fact.text("actionLabel").ifBlank { fact.text("label") }
    val parameters = r.ctx.jsonToParams(fact.path("parameters"))
    return JButton(com.intellij.icons.AllIcons.Actions.Edit).apply {
        isBorderPainted = false
        isContentAreaFilled = false
        isFocusPainted = true
        margin = JBUI.emptyInsets()
        toolTipText = label
        accessibleName(label)
        addActionListener { r.ctx.runAction(actionId, parameters.ifEmpty { null }) }
    }
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
    if (!metadata.bool("noIcon")) {
        row.add(JBLabel(glyph).apply { foreground = ink; font = font.deriveFont(Font.BOLD) }, BorderLayout.WEST)
    }
    val label = if (metadata.text("text").isNotBlank()) {
        JBLabel(metadata.text("text")).apply { foreground = ink; font = font.deriveFont(Font.BOLD) }
    } else null
    val children = component.path("children")
    if (metadata.bool("inlineContent")) {
        // label + content share the line (e.g. label + input + action)
        val inline = JPanel(FlowLayout(FlowLayout.LEFT, 8, 0)).apply { isOpaque = false }
        label?.let { inline.add(it) }
        if (children.isArray) {
            children.forEach { child -> inline.add(r.render(child, state, data)) }
        }
        row.add(inline, BorderLayout.CENTER)
    } else {
        val body = verticalPanel(4)
        body.isOpaque = false
        label?.let { body.addStacked(it, 0) }
        if (children.isArray) {
            children.forEach { child -> body.addStacked(r.render(child, state, data), 2) }
        }
        row.add(body, BorderLayout.CENTER)
    }
    val actionId = metadata.text("actionId")
    val actionLabel = metadata.text("actionLabel")
    val status = metadata.text("status")
    if ((actionId.isBlank() || actionLabel.isBlank()) && status.isNotBlank()) {
        row.add(JBLabel(status).apply { foreground = ink; font = font.deriveFont(Font.BOLD, 11f) }, BorderLayout.EAST)
    }
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

/** One StatusList item as a CARD (the VB check-in anatomy): title + status chip on the first
 *  line, muted description under it, timeline lines, and the icon-action row at the bottom. */
private fun uxStatusCard(r: ComponentRenderer, item: JsonNode, rowActionId: String): JComponent {
    val card = verticalPanel(2)
    card.border = JBUI.Borders.compound(
        JBUI.Borders.customLine(JBColor.border(), 1),
        JBUI.Borders.empty(8, 10),
    )
    val head = JPanel(BorderLayout(JBUI.scale(8), 0)).apply { isOpaque = false }
    val avatar = item.text("avatar")
    if (avatar.isNotBlank()) head.add(JBLabel(avatar).apply { font = font.deriveFont(15f) }, BorderLayout.WEST)
    head.add(JBLabel(item.text("title")).apply { font = font.deriveFont(Font.BOLD) }, BorderLayout.CENTER)
    val status = item.text("status")
    if (status.isNotBlank()) head.add(uxChip(status, item.text("statusColor")), BorderLayout.EAST)
    card.addStacked(head, 2)
    val desc = item.text("description")
    if (desc.isNotBlank()) card.addStacked(JBLabel(desc).apply { foreground = uxMuted() }, 1)
    for (line in item.arr("lines")) {
        card.addStacked(JBLabel(line.asText("")).apply {
            foreground = uxMuted()
            font = font.deriveFont(font.size2D - 1f)
        }, 0)
    }
    uxItemActions(r, item)?.let { card.addStacked(it, 2) }
    if (rowActionId.isNotBlank()) {
        val itemId = item.text("id")
        card.activatable {
            r.ctx.runAction(rowActionId, mapOf("_item" to itemId))
        }
    }
    return card
}

fun renderStatusList(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val compact = metadata.bool("compact")
    val rowActionId = metadata.text("rowActionId")
    val columns = metadata.int("columns")
    val items = metadata.arr("items")
    val hasActions = items.any { it.text("actionId").isNotBlank() && it.text("actionLabel").isNotBlank() }

    // The VB/Redwood check-in anatomy: items with their own actions (guests, operations) render
    // as CARDS — columns > 1 lays them out as a grid (the cockpit checklist), one column stacks.
    if (hasActions || columns > 1) {
        if (columns > 1) {
            val grid = JPanel(java.awt.GridLayout(0, columns, JBUI.scale(12), JBUI.scale(12)))
            grid.isOpaque = false
            for (item in items) grid.add(uxStatusCard(r, item, rowActionId))
            return grid
        }
        val panel = verticalPanel(8)
        for (item in items) panel.addStacked(uxStatusCard(r, item, rowActionId), 0)
        return panel
    }

    // Plain informational list (no actions): the classic bordered rows.
    val panel = verticalPanel(0)
    if (!metadata.bool("frameless")) panel.border = JBUI.Borders.customLine(JBColor.border(), 1)
    for (item in items) {
        val row = JPanel(BorderLayout(8, 0))
        row.isOpaque = false
        row.border = if (compact) JBUI.Borders.empty(4, 8) else JBUI.Borders.empty(8, 10)
        if (rowActionId.isNotBlank()) {
            val itemId = item.text("id")
            row.activatable(item.text("title")) { // named up front: the labels are added below
                r.ctx.runAction(rowActionId, mapOf("_item" to itemId))
            }
        }
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
                foreground = ToneColors.secondaryText()
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
            else -> ToneColors.secondaryText()
        }
        row.add(JBLabel("$mark $delta").apply { foreground = color; horizontalAlignment = javax.swing.SwingConstants.CENTER }, BorderLayout.CENTER)
    }
    panel.addStacked(row, 3)
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
