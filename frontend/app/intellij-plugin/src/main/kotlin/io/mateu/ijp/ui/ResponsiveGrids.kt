package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import javax.swing.Box
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * A ResponsiveGrid's CSS grid on a GridBag: the column TRACKS of `gridTemplateColumns` (a `10rem`
 * track is 160px, `1fr` / `2fr` share what is left, `auto` hugs its content) and the named
 * `gridTemplateAreas` (`"main aside" "footer footer"`), where a child goes to the area its `slot`
 * names. Children used to be placed in declaration order in equal columns, so an aside declared
 * first came before main and a 10rem track measured 280px.
 */
object ResponsiveGrids {
    sealed interface Track {
        data class Fixed(val px: Int) : Track
        data class Fraction(val weight: Double) : Track
        data object Auto : Track
    }

    /** The tracks of a grid-template-columns value; `repeat(n, x)` expands, blank → two 1fr. */
    fun tracks(template: String): List<Track> {
        val t = template.trim()
        if (t.isBlank()) return listOf(Track.Fraction(1.0), Track.Fraction(1.0))
        return tokens(t).flatMap { token ->
            val repeat = Regex("""^repeat\(\s*(\d+)\s*,\s*(.+)\)$""").matchEntire(token)
            when {
                repeat != null -> List(repeat.groupValues[1].toInt()) { trackOf(repeat.groupValues[2].trim()) }
                token.startsWith("repeat(") -> List(3) { Track.Fraction(1.0) } // auto-fit/auto-fill
                else -> listOf(trackOf(token))
            }
        }.ifEmpty { listOf(Track.Fraction(1.0)) }
    }

    private fun trackOf(token: String): Track {
        Regex("""^(\d+(?:\.\d+)?)fr$""").matchEntire(token)?.let { return Track.Fraction(it.groupValues[1].toDouble()) }
        cssLengthPx(token)?.let { return Track.Fixed(it) }
        // minmax(a, Nfr) grows like its max; minmax(a, <len>) is that length
        Regex("""^minmax\(\s*[^,]+,\s*(.+)\)$""").matchEntire(token)?.let { return trackOf(it.groupValues[1].trim()) }
        return when (token) {
            "auto", "min-content", "max-content", "fit-content" -> Track.Auto
            else -> Track.Fraction(1.0)
        }
    }

    /** Space-separated tokens, keeping parenthesised groups whole. */
    private fun tokens(t: String): List<String> {
        val out = ArrayList<String>()
        val sb = StringBuilder()
        var depth = 0
        for (c in t) {
            when {
                c == '(' -> { depth++; sb.append(c) }
                c == ')' -> { depth--; sb.append(c) }
                c.isWhitespace() && depth == 0 -> { if (sb.isNotEmpty()) out.add(sb.toString()); sb.clear() }
                else -> sb.append(c)
            }
        }
        if (sb.isNotEmpty()) out.add(sb.toString())
        return out
    }

    /** The area rows: `"main aside" "footer footer"` → [[main, aside], [footer, footer]]. */
    fun areas(template: String?): List<List<String>> =
        Regex("\"([^\"]*)\"").findAll(template.orEmpty()).map { m -> m.groupValues[1].trim().split(Regex("\\s+")).filter { it.isNotBlank() } }
            .filter { it.isNotEmpty() }.toList()

    /** Where an area sits: its first row/column and how many it spans (a rectangle, as CSS requires). */
    data class Cell(val row: Int, val col: Int, val rowSpan: Int, val colSpan: Int)

    fun cellOf(areas: List<List<String>>, name: String): Cell? {
        val hits = areas.flatMapIndexed { r, row -> row.mapIndexedNotNull { c, n -> if (n == name) r to c else null } }
        if (hits.isEmpty()) return null
        val r0 = hits.minOf { it.first }
        val c0 = hits.minOf { it.second }
        return Cell(r0, c0, hits.maxOf { it.first } - r0 + 1, hits.maxOf { it.second } - c0 + 1)
    }
}

fun renderResponsiveGridTracks(r: ComponentRenderer, children: List<JsonNode>, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val tracks = ResponsiveGrids.tracks(metadata.text("gridTemplateColumns"))
    val areas = ResponsiveGrids.areas(metadata.text("gridTemplateAreas"))
    val columns = maxOf(tracks.size, areas.maxOfOrNull { it.size } ?: 0)
    val gap = cssLengthPx(metadata.text("gap"))?.let { JBUI.scale(it) } ?: JBUI.scale(JBGap)
    val colSpans = metadata.path("colSpans").let { s -> if (s.isArray) s.map { it.asInt(1) } else emptyList() }
    val panel = JPanel(GridBagLayout())
    panel.isOpaque = false
    var nextRow = areas.size
    var col = 0
    var row = nextRow
    children.forEachIndexed { i, child ->
        val cell = child.text("slot").takeIf { it.isNotBlank() }?.let { ResponsiveGrids.cellOf(areas, it) } ?: run {
            // not in an area: the next free cells after the areas, in order (with its colSpan)
            // a KPI band spans the row; a dashboard panel its own colSpan (a dashboard's grid)
            val meta = child.path("metadata")
            val span = (colSpans.getOrNull(i) ?: when (meta.text("type")) {
                "Scoreboard" -> columns
                "DashboardPanel" -> meta.text("colSpan").toIntOrNull()
                else -> null
            } ?: 1).coerceIn(1, columns)
            if (col + span > columns) { col = 0; row++ }
            ResponsiveGrids.Cell(row, col, 1, span).also { col += span; if (col >= columns) { col = 0; row++ } }
        }
        nextRow = maxOf(nextRow, cell.row + cell.rowSpan)
        val gbc = GridBagConstraints().apply {
            gridx = cell.col; gridy = cell.row; gridwidth = cell.colSpan; gridheight = cell.rowSpan
            weightx = 0.0
            fill = GridBagConstraints.BOTH
            anchor = GridBagConstraints.NORTHWEST
            insets = JBUI.insets(0, 0, gap, if (cell.col + cell.colSpan < columns) gap else 0)
        }
        val rendered = r.render(child, state, data)
        // a child alone in a fixed track IS that wide (its content does not widen the track)
        val fixed = if (cell.colSpan == 1) tracks.getOrNull(cell.col) as? ResponsiveGrids.Track.Fixed else null
        // a fixed-size leaf (an avatar, a badge) keeps its size at the cell start, as an inline box does
        if (rendered.maximumSize.width <= rendered.preferredSize.width) gbc.fill = GridBagConstraints.NONE
        panel.add(if (fixed != null && gbc.fill != GridBagConstraints.NONE) TrackWidth(JBUI.scale(fixed.px), rendered) else rendered, gbc)
    }
    val lastRow = maxOf(nextRow, row + if (col > 0) 1 else 0)
    // one zero-height strut per track fixes the column widths: a fixed track's width, an fr track's
    // weight (an auto track hugs its content, no weight)
    for (c in 0 until columns) {
        val track = tracks.getOrElse(c) { ResponsiveGrids.Track.Fraction(1.0) }
        val strut = when (track) {
            is ResponsiveGrids.Track.Fixed -> Box.createHorizontalStrut(JBUI.scale(track.px))
            else -> Box.createHorizontalStrut(0)
        }
        panel.add(strut, GridBagConstraints().apply {
            gridx = c; gridy = lastRow; weightx = (track as? ResponsiveGrids.Track.Fraction)?.weight ?: 0.0
            fill = GridBagConstraints.HORIZONTAL
            insets = JBUI.insets(0, 0, 0, if (c < columns - 1) gap else 0)
        })
    }
    return panel
}

/** Lays its child out at exactly [width] (a fixed grid track). */
private class TrackWidth(private val width: Int, child: JComponent) : JPanel(java.awt.BorderLayout()) {
    init {
        isOpaque = false
        add(child, java.awt.BorderLayout.CENTER)
    }
    override fun getPreferredSize() = java.awt.Dimension(width, super.getPreferredSize().height)
    override fun getMinimumSize() = java.awt.Dimension(width, super.getMinimumSize().height)
    override fun getMaximumSize() = java.awt.Dimension(width, super.getMaximumSize().height)
}
