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


/**
 * A scroll pane that never gives up its content's HEIGHT. A page is a vertical [BoxLayout] of
 * cards; when it is handed less height than its children prefer (a long page before its host
 * scrolls it, a probe frame, a split pane), BoxLayout shrinks each child towards its MINIMUM — and a
 * plain scroll pane's minimum is its two scroll bars, so a planning board, a matrix grid or a kanban
 * collapsed to a 20px strip while the labels around them kept their size. Here the minimum (and the
 * maximum, so a grid that EXPANDS a section after render can grow past the cap [addStacked] froze)
 * follow the preferred height: the canvas keeps its rows and the PAGE scrolls, which is the only
 * place a long page should scroll vertically. Horizontal overflow still scrolls inside, and the bar
 * it needs is reserved in the preferred height once the pane knows its width — a non-Scrollable
 * view never makes [javax.swing.ScrollPaneLayout] count it, so the bar used to eat the last row.
 */
internal open class ContentHeightScrollPane(view: JComponent) : com.intellij.ui.components.JBScrollPane(view) {
    override fun getPreferredSize(): Dimension {
        val p = super.getPreferredSize()
        val hsb = horizontalScrollBar ?: return p
        if (horizontalScrollBarPolicy == javax.swing.ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER || width <= 0) return p
        val view = viewport?.view ?: return p
        val viewW = view.preferredSize.width
        // What ScrollPaneLayout already counted: a Scrollable view wider than its preferred viewport.
        val counted = view is javax.swing.Scrollable && !view.scrollableTracksViewportWidth &&
            viewW > viewport.preferredSize.width
        val available = width - insets.left - insets.right - (rowHeader?.preferredSize?.width ?: 0) -
            (verticalScrollBar?.takeIf { it.isVisible }?.width ?: 0)
        return if (!counted && viewW > available) Dimension(p.width, p.height + hsb.preferredSize.height) else p
    }

    override fun getMinimumSize(): Dimension = Dimension(super.getMinimumSize().width, preferredSize.height)
    override fun getMaximumSize(): Dimension = Dimension(Int.MAX_VALUE, preferredSize.height)
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
