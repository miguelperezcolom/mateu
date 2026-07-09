package io.mateu.ijp.ui

import com.intellij.util.ui.JBUI
import java.awt.Component
import java.awt.Dimension
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.JComponent
import javax.swing.JPanel

/** Default inter-component gap (unscaled; layouts scale as needed). */
const val JBGap = 8

/** A vertical [BoxLayout] panel whose children are left-aligned and stretched to the panel width. */
fun verticalPanel(gap: Int = JBGap): JPanel {
    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
    panel.isOpaque = false
    if (gap > 0) panel.border = JBUI.Borders.empty(0)
    return panel
}

/** Adds [child] to a vertical box panel, forcing full-width alignment + an optional gap after it. */
fun JPanel.addStacked(child: JComponent, gap: Int = JBGap) {
    child.alignmentX = Component.LEFT_ALIGNMENT
    // Let the child grow horizontally but keep its preferred height.
    child.maximumSize = Dimension(Int.MAX_VALUE, child.preferredSize.height.coerceAtLeast(1))
    add(child)
    if (gap > 0) add(Box.createVerticalStrut(JBUI.scale(gap)))
}

/** Like [addStacked] but the gap goes BEFORE the child (skip for the first): stacking a list this
 *  way leaves no trailing bottom slack after the last element. */
fun JPanel.addStackedBetween(child: JComponent, gap: Int, first: Boolean) {
    if (!first && gap > 0) add(Box.createVerticalStrut(JBUI.scale(gap)))
    child.alignmentX = Component.LEFT_ALIGNMENT
    child.maximumSize = Dimension(Int.MAX_VALUE, child.preferredSize.height.coerceAtLeast(1))
    add(child)
}


/** Lays its single child out at full height but capped width, anchored left (IDE-style) — the
 *  Swing rendering of a CSS `max-width` (e.g. the Page's `max-width:900px;margin:auto`). */
internal class MaxWidthPanel(private val maxWidth: Int, private val content: javax.swing.JComponent) :
    javax.swing.JPanel(null) {
    init {
        isOpaque = false
        add(content)
    }
    override fun doLayout() {
        content.setBounds(0, 0, minOf(width, maxWidth), height)
    }
    override fun getPreferredSize(): java.awt.Dimension {
        val p = content.preferredSize
        return java.awt.Dimension(minOf(p.width, maxWidth), p.height)
    }
    override fun getMinimumSize(): java.awt.Dimension = content.minimumSize
}

/** CSS `max-width: NNNpx` in a style string, scaled to the current UI scale; null when absent. */
internal fun parseMaxWidth(style: String): Int? =
    Regex("max-width:\\s*(\\d+)px").find(style)?.groupValues?.get(1)?.toIntOrNull()
        ?.let { com.intellij.util.ui.JBUI.scale(it) }
