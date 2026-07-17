package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.Color
import java.awt.Cursor
import java.awt.Dimension
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.Rectangle
import java.awt.RenderingHints
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale
import javax.swing.JComponent

/**
 * Planning board / tape chart (wire type `PlanningBoard`), read-only Swing port of the web's
 * `mateu-planning-board`: rows = resources (with optional `group` swimlane captions), columns =
 * days between `from` and `to` (ISO-8601), colored blocks spanning date ranges. Clicking a block
 * dispatches the board's `selectActionId` with `{_blockId: block.id}` through the standard action
 * dispatch. Drag/move is intentionally not supported on the desktop (the web handles moveActionId).
 */
fun renderPlanningBoard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val canvas = PlanningBoardCanvas(metadata) { blockId ->
        val selectActionId = metadata.text("selectActionId")
        if (selectActionId.isNotBlank()) r.ctx.runAction(selectActionId, mapOf("_blockId" to blockId))
    }
    val scroll = JBScrollPane(canvas)
    scroll.border = JBUI.Borders.empty()
    return scroll
}

private class PlanningBoardCanvas(
    metadata: JsonNode,
    private val onBlockClicked: (String) -> Unit,
) : JComponent() {

    private data class Block(val id: String, val resourceId: String, val start: LocalDate?, val end: LocalDate?, val label: String, val color: String, val status: String)
    private sealed interface Row
    private data class GroupRow(val caption: String) : Row
    private data class LaneRow(val resourceId: String, val label: String) : Row

    private val blocks: List<Block> = metadata.arr("blocks").map {
        Block(
            it.text("id"), it.text("resourceId"), parseDate(it.text("start")), parseDate(it.text("end")),
            it.text("label"), it.text("color"), it.text("status"),
        )
    }

    private val days: List<LocalDate>
    private val rows: List<Row>

    private val labelW = JBUI.scale(140)
    private val dayW = JBUI.scale(42)
    private val headerH = JBUI.scale(34)
    private val rowH = JBUI.scale(30)
    private val groupH = JBUI.scale(22)

    /** Hit-test regions of the painted blocks, rebuilt on every paint. */
    private val blockBounds = ArrayList<Pair<Rectangle, String>>()

    init {
        val from = parseDate(metadata.text("from"))
            ?: blocks.mapNotNull { it.start }.minOrNull()
            ?: LocalDate.now()
        val to = parseDate(metadata.text("to"))
            ?: blocks.mapNotNull { it.end }.maxOrNull()
            ?: from.plusDays(13)
        val dayList = ArrayList<LocalDate>()
        var d = from
        var guard = 0
        while (!d.isAfter(to) && guard < 400) {
            dayList.add(d)
            d = d.plusDays(1)
            guard++
        }
        days = dayList

        val rowList = ArrayList<Row>()
        var lastGroup: String? = null
        for (res in metadata.arr("resources")) {
            val group = res.text("group")
            if (group.isNotBlank() && group != lastGroup) rowList.add(GroupRow(group))
            if (group.isNotBlank()) lastGroup = group
            rowList.add(LaneRow(res.text("id"), res.text("label", res.text("id"))))
        }
        rows = rowList

        cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
        addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                val hit = blockBounds.lastOrNull { it.first.contains(e.point) } ?: return
                onBlockClicked(hit.second)
            }
        })
        addMouseMotionListener(object : java.awt.event.MouseMotionAdapter() {
            override fun mouseMoved(e: MouseEvent) {
                val over = blockBounds.any { it.first.contains(e.point) }
                cursor = Cursor.getPredefinedCursor(if (over) Cursor.HAND_CURSOR else Cursor.DEFAULT_CURSOR)
                toolTipText = blockBounds.lastOrNull { it.first.contains(e.point) }?.let { hit ->
                    blocks.firstOrNull { it.id == hit.second }?.let { b ->
                        "${b.label.ifBlank { b.id }} (${b.start ?: ""} – ${b.end ?: ""})"
                    }
                }
            }
        })
    }

    override fun getPreferredSize(): Dimension {
        var h = headerH
        for (row in rows) h += if (row is GroupRow) groupH else rowH
        return Dimension(labelW + days.size * dayW, h)
    }

    override fun paintComponent(g: Graphics) {
        val g2 = g as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        blockBounds.clear()

        val bg = JBColor(Color.WHITE, Color(0x2B, 0x2D, 0x30))
        val headBg = JBColor(Color(0xF5, 0xF6, 0xF8), Color(0x33, 0x36, 0x3A))
        val weekendBg = JBColor(Color(0xEC, 0xED, 0xF0), Color(0x38, 0x3B, 0x40))
        val gridColor = JBColor(Color(0xE0, 0xE1, 0xE4), Color(0x45, 0x48, 0x4C))
        val textColor = JBColor(Color(0x22, 0x22, 0x22), Color(0xDD, 0xDD, 0xDD))
        val mutedColor = JBColor(Color(0x77, 0x77, 0x77), Color(0x9A, 0x9A, 0x9A))

        g2.color = bg
        g2.fillRect(0, 0, width, height)

        val baseFont = font ?: JBUI.Fonts.label()
        val smallFont = baseFont.deriveFont(baseFont.size2D * 0.85f)

        // ── day headers ──
        g2.color = headBg
        g2.fillRect(0, 0, width, headerH)
        val today = LocalDate.now()
        for ((i, day) in days.withIndex()) {
            val x = labelW + i * dayW
            val weekend = day.dayOfWeek.value >= 6
            if (weekend) {
                g2.color = weekendBg
                g2.fillRect(x, 0, dayW, headerH)
            }
            g2.font = smallFont
            g2.color = mutedColor
            val dow = day.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.getDefault())
            g2.drawString(dow, x + JBUI.scale(4), JBUI.scale(13))
            g2.font = if (day == today) baseFont.deriveFont(Font.BOLD) else baseFont
            g2.color = textColor
            g2.drawString(day.dayOfMonth.toString(), x + JBUI.scale(4), headerH - JBUI.scale(6))
        }

        // ── rows: swimlane captions + lanes ──
        var y = headerH
        val laneY = HashMap<String, Int>()
        for (row in rows) {
            when (row) {
                is GroupRow -> {
                    g2.color = headBg
                    g2.fillRect(0, y, width, groupH)
                    g2.font = smallFont.deriveFont(Font.BOLD)
                    g2.color = mutedColor
                    g2.drawString(row.caption.uppercase(), JBUI.scale(8), y + groupH - JBUI.scale(6))
                    y += groupH
                }
                is LaneRow -> {
                    laneY[row.resourceId] = y
                    // weekend tint on the lane
                    for ((i, day) in days.withIndex()) {
                        if (day.dayOfWeek.value >= 6) {
                            g2.color = weekendBg
                            g2.fillRect(labelW + i * dayW, y, dayW, rowH)
                        }
                    }
                    g2.font = baseFont
                    g2.color = textColor
                    g2.drawString(clip(g2, row.label, labelW - JBUI.scale(12)), JBUI.scale(8), y + rowH - JBUI.scale(10))
                    y += rowH
                }
            }
        }

        // ── grid lines ──
        g2.color = gridColor
        for (i in 0..days.size) {
            val x = labelW + i * dayW
            g2.drawLine(x, 0, x, y)
        }
        var lineY = headerH
        g2.drawLine(0, lineY, width, lineY)
        for (row in rows) {
            lineY += if (row is GroupRow) groupH else rowH
            g2.drawLine(0, lineY, width, lineY)
        }

        // ── blocks ──
        val firstDay = days.firstOrNull() ?: return
        val lastDay = days.lastOrNull() ?: return
        for (block in blocks) {
            val rowTop = laneY[block.resourceId] ?: continue
            val start = block.start ?: continue
            val end = block.end ?: start
            if (end.isBefore(firstDay) || start.isAfter(lastDay)) continue
            val startIdx = java.time.temporal.ChronoUnit.DAYS.between(firstDay, maxOf(start, firstDay)).toInt()
            val endIdx = java.time.temporal.ChronoUnit.DAYS.between(firstDay, minOf(end, lastDay)).toInt()
            val x = labelW + startIdx * dayW + JBUI.scale(2)
            val w = (endIdx - startIdx + 1) * dayW - JBUI.scale(4)
            val by = rowTop + JBUI.scale(3)
            val bh = rowH - JBUI.scale(6)
            val fill = blockColor(block)
            g2.color = fill
            g2.fillRoundRect(x, by, w, bh, JBUI.scale(8), JBUI.scale(8))
            g2.color = readableTextColor(fill)
            g2.font = smallFont
            val label = block.label.ifBlank { block.id }
            g2.drawString(clip(g2, label, w - JBUI.scale(10)), x + JBUI.scale(5), by + bh - JBUI.scale(6))
            blockBounds.add(Rectangle(x, by, w, bh) to block.id)
        }
    }

    private fun clip(g2: Graphics2D, text: String, maxWidth: Int): String {
        val fm = g2.fontMetrics
        if (fm.stringWidth(text) <= maxWidth) return text
        var t = text
        while (t.isNotEmpty() && fm.stringWidth("$t…") > maxWidth) t = t.dropLast(1)
        return if (t.isEmpty()) "" else "$t…"
    }

    private fun blockColor(block: Block): Color {
        parseColor(block.color)?.let { return it }
        return when (block.status.uppercase()) {
            "SUCCESS", "OK", "CONFIRMED", "DONE" -> Color(0x3E, 0x86, 0x35)
            "ERROR", "DANGER", "KO", "CANCELLED" -> Color(0xC9, 0x19, 0x0B)
            "WARNING", "WARN", "PENDING" -> Color(0xF0, 0xAB, 0x00)
            else -> Color(0x2B, 0x7D, 0xE0)
        }
    }

    private fun parseColor(value: String): Color? {
        val v = value.trim()
        if (v.isEmpty()) return null
        return runCatching {
            when {
                v.startsWith("#") && v.length == 7 -> Color.decode(v)
                v.startsWith("#") && v.length == 4 ->
                    Color.decode("#" + v.drop(1).map { "$it$it" }.joinToString(""))
                else -> null
            }
        }.getOrNull()
    }

    private fun readableTextColor(bg: Color): Color {
        val luminance = (0.299 * bg.red + 0.587 * bg.green + 0.114 * bg.blue) / 255.0
        return if (luminance > 0.6) Color(0x1A, 0x1A, 0x1A) else Color.WHITE
    }

    private companion object {
        fun parseDate(value: String): LocalDate? =
            if (value.isBlank()) null else runCatching { LocalDate.parse(value.take(10)) }.getOrNull()
    }
}
