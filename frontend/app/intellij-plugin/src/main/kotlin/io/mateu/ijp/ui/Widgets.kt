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

/** A vertical [StackLayout] panel whose children are left-aligned and stretched to the panel width. */
fun verticalPanel(gap: Int = JBGap): JPanel {
    val panel = JPanel(StackLayout())
    panel.isOpaque = false
    if (gap > 0) panel.border = JBUI.Borders.empty(0)
    return panel
}

/**
 * Adds [child] to a vertical stack, full width + an optional gap after it.
 *
 * The child keeps its CURRENT preferred height, whatever it becomes later: an island, a micro
 * frontend, a crud table whose rows arrive after its search, an image loaded in the background are
 * all filled AFTER they were added. This used to freeze `maximumSize.height` to the height the
 * child had at add time — a still-empty island (1px), a table with no rows — and BoxLayout honoured
 * it forever, so almost every inline example drew as a card title over a 0px strip. A BoxLayout
 * Y panel is switched to [StackLayout], which lays children out at their live preferred height.
 */
fun JPanel.addStacked(child: JComponent, gap: Int = JBGap) {
    ensureStackLayout()
    child.alignmentX = Component.LEFT_ALIGNMENT
    add(child)
    if (gap > 0) add(Box.createVerticalStrut(JBUI.scale(gap)))
}

/** Like [addStacked] but the gap goes BEFORE the child (skip for the first): stacking a list this
 *  way leaves no trailing bottom slack after the last element. */
fun JPanel.addStackedBetween(child: JComponent, gap: Int, first: Boolean) {
    ensureStackLayout()
    if (!first && gap > 0) add(Box.createVerticalStrut(JBUI.scale(gap)))
    child.alignmentX = Component.LEFT_ALIGNMENT
    add(child)
}

/** A vertical BoxLayout panel becomes a [StackLayout] (same stacking, live heights). */
internal fun java.awt.Container.ensureStackLayout() {
    val l = layout
    if (l is BoxLayout && (l.axis == BoxLayout.Y_AXIS || l.axis == BoxLayout.PAGE_AXIS)) layout = StackLayout()
}

/**
 * A vertical stack, the Swing rendering of a block flow: each visible child is laid out at its
 * CURRENT preferred height (re-read on every layout, so content filled in later — an island, rows,
 * an image — makes the stack and every ancestor grow on the next revalidate), at the full width of
 * the panel. A BUTTON keeps its own width, as a `<button>` in a block does (a stacked "Go to the
 * home" button used to stretch across the page), and so does a child whose maximum width was set
 * below the panel's. Like BoxLayout: when the panel gets less height than the children prefer they
 * shrink towards their minimum; extra height goes to vertical glue.
 */
class StackLayout : java.awt.LayoutManager2 {
    override fun addLayoutComponent(comp: Component?, constraints: Any?) {}
    override fun addLayoutComponent(name: String?, comp: Component?) {}
    override fun removeLayoutComponent(comp: Component?) {}
    override fun getLayoutAlignmentX(target: java.awt.Container?) = 0f
    override fun getLayoutAlignmentY(target: java.awt.Container?) = 0f
    override fun invalidateLayout(target: java.awt.Container?) {}

    private fun visible(parent: java.awt.Container) = parent.components.filter { it.isVisible }

    override fun preferredLayoutSize(parent: java.awt.Container): Dimension = size(parent) { it.preferredSize }
    override fun minimumLayoutSize(parent: java.awt.Container): Dimension = size(parent) { it.minimumSize }

    override fun maximumLayoutSize(parent: java.awt.Container): Dimension {
        // a stack does not grow past its content (BoxLayout's sum of the frozen caps did the same),
        // unless it carries vertical glue that is there to absorb the slack
        val glue = visible(parent).any { isGlue(it) }
        return Dimension(Int.MAX_VALUE, if (glue) Int.MAX_VALUE else preferredLayoutSize(parent).height)
    }

    private inline fun size(parent: java.awt.Container, of: (Component) -> Dimension): Dimension {
        var w = 0
        var h = 0L
        for (c in visible(parent)) {
            val d = of(c)
            w = maxOf(w, d.width)
            h += d.height.coerceAtLeast(0)
        }
        val i = parent.insets
        return Dimension(w + i.left + i.right, (h + i.top + i.bottom).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
    }

    override fun layoutContainer(parent: java.awt.Container) {
        val i = parent.insets
        val cw = (parent.width - i.left - i.right).coerceAtLeast(0)
        val available = (parent.height - i.top - i.bottom).coerceAtLeast(0)
        val kids = visible(parent)
        val prefs = kids.map { it.preferredSize }
        val heights = stackHeights(
            IntArray(kids.size) { prefs[it].height.coerceAtLeast(0) },
            IntArray(kids.size) { kids[it].minimumSize.height },
            BooleanArray(kids.size) { isGlue(kids[it]) },
            available,
        )
        var y = i.top
        kids.forEachIndexed { k, c ->
            val w = stackWidth(c, prefs[k], cw)
            val x = i.left + ((cw - w) * c.alignmentX.coerceIn(0f, 1f)).toInt()
            c.setBounds(x, y, w, heights[k])
            y += heights[k]
        }
    }

    private fun isGlue(c: Component) = c is Box.Filler && c.maximumSize.height > c.preferredSize.height

    companion object {
        /** The width a stacked child gets out of [cw]: all of it, but a button keeps its own. */
        internal fun stackWidth(c: Component, pref: Dimension, cw: Int): Int {
            var w = cw
            if (c is javax.swing.AbstractButton && c !is javax.swing.JToggleButton) w = minOf(w, pref.width)
            if (c.isMaximumSizeSet) w = minOf(w, c.maximumSize.width)
            return w.coerceAtLeast(0)
        }

        /**
         * The heights the children get: their preferred ones; when that does not fit [available],
         * each gives up its share of the deficit down to its minimum (BoxLayout's rule); when there
         * is room left, the glue takes it.
         */
        internal fun stackHeights(prefs: IntArray, minimums: IntArray, glue: BooleanArray, available: Int): IntArray {
            val heights = prefs.copyOf()
            val total = heights.sum()
            if (total > available) {
                val mins = IntArray(heights.size) { minimums[it].coerceIn(0, heights[it]) }
                val shrinkable = heights.indices.sumOf { (heights[it] - mins[it]).toLong() }
                if (shrinkable > 0) {
                    val deficit = minOf((total - available).toLong(), shrinkable)
                    var taken = 0L
                    for (k in heights.indices) {
                        val share = (heights[k] - mins[k]) * deficit / shrinkable
                        heights[k] -= share.toInt()
                        taken += share
                    }
                    var rest = deficit - taken // rounding: from the first children that can still give
                    for (k in heights.indices) {
                        if (rest <= 0) break
                        val can = (heights[k] - mins[k]).toLong().coerceAtMost(rest)
                        heights[k] -= can.toInt()
                        rest -= can
                    }
                }
            } else if (total < available) {
                val glueAt = heights.indices.filter { glue[it] }
                if (glueAt.isNotEmpty()) {
                    val extra = available - total
                    glueAt.forEachIndexed { n, k -> heights[k] += extra / glueAt.size + if (n < extra % glueAt.size) 1 else 0 }
                }
            }
            return heights
        }
    }
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
