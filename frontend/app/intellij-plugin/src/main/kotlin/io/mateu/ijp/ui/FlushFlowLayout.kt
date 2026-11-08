package io.mateu.ijp.ui

import java.awt.Component
import java.awt.Container
import java.awt.Dimension
import java.awt.LayoutManager

/**
 * A left-to-right row whose FIRST item starts at the row's edge (D-22).
 *
 * `FlowLayout` puts its horizontal gap BEFORE the first item and after the last one, so every
 * button row, the page title row and the pager started 8–12 px right of the subtitle and of the
 * content above and below them — a ragged left edge on every page. This lays items out the same way
 * (left to right, vertically centred on their line, wrapping to a new line when the row is too
 * narrow) with [hgap] only BETWEEN items and [vgap] only between lines.
 */
class FlushFlowLayout(val hgap: Int, val vgap: Int = 0) : LayoutManager {

    override fun addLayoutComponent(name: String?, comp: Component?) = Unit
    override fun removeLayoutComponent(comp: Component?) = Unit

    override fun preferredLayoutSize(target: Container): Dimension = size(target) { it.preferredSize }

    override fun minimumLayoutSize(target: Container): Dimension = size(target) { it.minimumSize }

    /** One line (like FlowLayout, the preferred size never wraps). */
    private fun size(target: Container, of: (Component) -> Dimension): Dimension {
        synchronized(target.treeLock) {
            val visible = visible(target)
            var w = 0
            var h = 0
            visible.forEachIndexed { i, c ->
                val d = of(c)
                w += d.width + if (i > 0) hgap else 0
                h = maxOf(h, d.height)
            }
            val ins = target.insets
            return Dimension(w + ins.left + ins.right, h + ins.top + ins.bottom)
        }
    }

    override fun layoutContainer(target: Container) {
        synchronized(target.treeLock) {
            val ins = target.insets
            val available = target.width - ins.left - ins.right
            val ltr = target.componentOrientation.isLeftToRight
            // split into lines that fit, then place each line vertically centred
            val lines = ArrayList<List<Component>>()
            var line = ArrayList<Component>()
            var x = 0
            for (c in visible(target)) {
                val w = c.preferredSize.width
                if (line.isNotEmpty() && x + hgap + w > available) {
                    lines.add(line); line = ArrayList(); x = 0
                }
                x += (if (line.isEmpty()) 0 else hgap) + w
                line.add(c)
            }
            if (line.isNotEmpty()) lines.add(line)
            var y = ins.top
            for (l in lines) {
                val height = l.maxOf { it.preferredSize.height }
                var cx = 0
                for (c in l) {
                    val d = c.preferredSize
                    val left = if (ltr) ins.left + cx else target.width - ins.right - cx - d.width
                    c.setBounds(left, y + (height - d.height) / 2, d.width, d.height)
                    cx += d.width + hgap
                }
                y += height + vgap
            }
        }
    }

    private fun visible(target: Container) = (0 until target.componentCount).map { target.getComponent(it) }.filter { it.isVisible }
}

/** A transparent row laid out by [FlushFlowLayout] ([gap] is in unscaled pixels). */
internal fun flushRow(gap: Int, vgap: Int = 0): javax.swing.JPanel =
    javax.swing.JPanel(FlushFlowLayout(com.intellij.util.ui.JBUI.scale(gap), com.intellij.util.ui.JBUI.scale(vgap))).apply { isOpaque = false }
