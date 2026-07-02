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
