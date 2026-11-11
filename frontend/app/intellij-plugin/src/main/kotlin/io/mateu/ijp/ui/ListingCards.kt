package io.mateu.ijp.ui

import com.intellij.ui.IdeBorderFactory
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import java.awt.Dimension
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.table.TableModel

/**
 * A listing's `gridLayout: cards` / `list` (a hero search's results, a gallery): the rows as cards —
 * the first column is the card's title, the others "Label value" lines — wrapped across the width,
 * or (list) one full-width card per row. It fell back to the table. The table stays the model: the
 * cards are redrawn from it whenever a search answers.
 */
internal object ListingCards {
    /** Whether a listing's `gridLayout` is drawn as cards / a list instead of a table. */
    fun isCardLayout(gridLayout: String): Boolean = gridLayout == "cards" || gridLayout == "list"

    /** One card's texts: its title and its (label, value) lines, blanks left out. The [images]
     *  columns are the card's picture, not text: the title is the first OTHER column (a works
     *  gallery led with its image column, so every card was titled with a url). */
    fun cardOf(model: TableModel, row: Int, images: Set<Int> = emptySet()): Pair<String, List<Pair<String, String>>> {
        val cells = (0 until model.columnCount).filter { it !in images }
            .map { c -> model.getColumnName(c) to (model.getValueAt(row, c)?.let(::textOf) ?: "") }
        val title = cells.firstOrNull()?.second.orEmpty()
        return title to cells.drop(1).filter { it.second.isNotBlank() }
    }

    /** The url of a card's first picture, else null. */
    fun imageOf(model: TableModel, row: Int, images: Set<Int>): String? =
        images.sorted().firstNotNullOfOrNull { c -> model.getValueAt(row, c)?.let(::textOf)?.takeIf { it.isNotBlank() } }

    private fun textOf(v: Any): String = when (v) {
        is Boolean -> if (v) "✓" else ""
        is com.fasterxml.jackson.databind.JsonNode -> when {
            v.isValueNode -> v.asText()
            v.has("label") -> v.path("label").asText()
            v.has("text") -> v.path("text").asText()
            else -> ""
        }
        else -> v.toString()
    }

    /** The cards panel over [model]; a click on a card (or Enter on it) runs [onOpen] with its model row. */
    fun panel(
        model: TableModel, list: Boolean, isDataRow: (Int) -> Boolean, onOpen: ((Int) -> Unit)?,
        images: Set<Int> = emptySet(), baseUrl: String? = null,
    ): JComponent {
        val panel = WrappingCards(if (list) 0 else JBUI.scale(260))
        fun rebuild() {
            panel.removeAll()
            for (row in 0 until model.rowCount) {
                if (!isDataRow(row)) continue
                val (title, lines) = cardOf(model, row, images)
                val card = verticalPanel(2)
                card.border = JBUI.Borders.compound(IdeBorderFactory.createRoundedBorder(), JBUI.Borders.empty(10))
                imageOf(model, row, images)?.let { src ->
                    val meta = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode().put("src", src).put("alt", title)
                    card.addStacked(renderStandaloneImage(meta, baseUrl, "max-width: 236px"), 6)
                }
                card.addStacked(JBLabel(plain(title)).apply { font = font.deriveFont(Font.BOLD) }, if (lines.isEmpty()) 0 else 4)
                for ((label, value) in lines) {
                    val line = JPanel(java.awt.BorderLayout(JBUI.scale(8), 0)).apply { isOpaque = false }
                    line.add(JBLabel(plain(label)).apply { foreground = ToneColors.secondaryText() }, java.awt.BorderLayout.WEST)
                    line.add(JBLabel(plain(value)), java.awt.BorderLayout.CENTER)
                    card.addStacked(line, 0)
                }
                if (onOpen != null) card.activatable(title) { onOpen(row) }
                panel.add(card)
            }
            if (panel.componentCount == 0) panel.add(JBLabel("No data").apply { foreground = ToneColors.secondaryText() })
            // its height follows its cards: a page that stacked it empty grows with them
            regrowStacked(panel)
            panel.repaint()
        }
        // how many cards a line holds depends on the width it gets: re-measure once it has one
        panel.addComponentListener(object : java.awt.event.ComponentAdapter() {
            private var lastWidth = -1
            override fun componentResized(e: java.awt.event.ComponentEvent) {
                if (panel.width == lastWidth) return
                lastWidth = panel.width
                javax.swing.SwingUtilities.invokeLater { regrowStacked(panel) }
            }
        })
        model.addTableModelListener { rebuild() }
        rebuild()
        return panel
    }
}

/** Cards [cardWidth] wide wrapped across the width (0 = one full-width card per row), rows of equal height. */
private class WrappingCards(private val cardWidth: Int) : JPanel(null) {
    init { isOpaque = false }

    private val gap get() = JBUI.scale(8)

    private fun columns(width: Int): Int =
        if (cardWidth <= 0) 1 else ((width + gap) / (cardWidth + gap)).coerceAtLeast(1)

    override fun doLayout() {
        val cols = columns(width)
        val w = if (cardWidth <= 0) width else (width - gap * (cols - 1)) / cols
        var y = 0
        components.toList().chunked(cols).forEach { line ->
            val h = line.maxOf { it.preferredSize.height }
            line.forEachIndexed { i, c -> c.setBounds(i * (w + gap), y, w, h) }
            y += h + gap
        }
    }

    override fun getPreferredSize(): Dimension {
        val width = if (width > 0) width else JBUI.scale(800)
        val cols = columns(width)
        val h = components.toList().chunked(cols).sumOf { line -> line.maxOf { it.preferredSize.height } + gap }
        return Dimension(if (cardWidth <= 0) width else minOf(width, cols * (cardWidth + gap)), h)
    }
}
