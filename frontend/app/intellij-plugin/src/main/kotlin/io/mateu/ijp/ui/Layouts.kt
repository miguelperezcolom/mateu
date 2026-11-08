package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.Splitter
import com.intellij.ui.IdeBorderFactory
import com.intellij.ui.components.JBTabbedPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.awt.FlowLayout
import javax.swing.JComponent
import javax.swing.JPanel

/** VerticalLayout / Scroller / Container / Div / FullWidth → a vertical stack of children. */
fun renderVBox(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val gap = if (metadata.bool("spacing", true)) JBGap else 0
    val panel = verticalPanel(gap)
    val children = component.path("children")
    if (children.isArray) {
        children.forEachIndexed { i, child ->
            panel.addStackedBetween(r.render(child, state, data), gap, first = i == 0)
        }
    }
    return panel
}

/** HorizontalLayout → a horizontal row of children. Children carrying flex bases in their style
 *  (`flex: 0 0 64%`, the zones layout) become top-anchored proportional columns; otherwise a
 *  simple left-aligned flow row (buttons etc.). */
fun renderHBox(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val gap = if (metadata.bool("spacing", true)) JBGap else 0
    val children = component.path("children").let { if (it.isArray) it.toList() else emptyList() }
    val specs = children.map { FlexSpec.of(it.text("style")) }
    if (specs.any { it != null }) {
        val row = JPanel(java.awt.GridBagLayout())
        row.isOpaque = false
        children.forEachIndexed { i, child ->
            val spec = specs[i]
            val fixedPx = spec?.fixedPx
            val gbc = java.awt.GridBagConstraints().apply {
                gridx = i
                gridy = 0
                weightx = spec?.weight ?: 10.0
                weighty = 1.0
                // Preferred height anchored NORTH: every column starts at the top of the row
                // (the wire even says so: align-items: flex-start).
                fill = java.awt.GridBagConstraints.HORIZONTAL
                anchor = java.awt.GridBagConstraints.NORTH
                insets = JBUI.insets(0, if (i == 0) 0 else gap, 0, 0)
            }
            val rendered = r.render(child, state, data)
            row.add(if (fixedPx != null) FixedWidth(JBUI.scale(fixedPx), rendered) else rendered, gbc)
        }
        return row
    }
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(gap), 0))
    row.isOpaque = false
    for (child in children) row.add(r.render(child, state, data))
    return row
}

/**
 * A child's CSS `flex` in a row, as GridBag terms. `flex: G S NN%` weighs NN (the zones'
 * percentages); `flex: G` / `flex: G S <length>` with G > 0 grows with weight G; `flex: 0 0 <len>`
 * is a FIXED column of that width. Only the percentage form was read: the RAIL wizard's
 * `flex: 1` form beside its `flex: 0 0 15rem` rail fell back to equal weights at preferred
 * widths, and the form shrank to a 130px column at the far left.
 */
data class FlexSpec(val weight: Double, val fixedPx: Int? = null) {
    companion object {
        private val FLEX = Regex("""(?:^|;)\s*flex:\s*([^;]+)""")
        private val LENGTH = Regex("""^(\d+(?:\.\d+)?)(px|rem|em)$""")

        private val PERCENT = Regex("""(\d+(?:\.\d+)?)%""")

        fun of(style: String): FlexSpec? {
            val value = FLEX.find(style)?.groupValues?.get(1)?.trim() ?: return null
            val parts = value.split(Regex("\\s+"))
            val grow = parts.getOrNull(0)?.toDoubleOrNull() ?: return null
            // a percentage basis, bare or inside calc() (the zones: `calc(64% - var(--gap))`), weighs it
            PERCENT.find(value)?.groupValues?.get(1)?.toDoubleOrNull()?.let { return FlexSpec(it) }
            val basis = parts.getOrNull(2) ?: parts.getOrNull(1)?.takeUnless { it.toDoubleOrNull() != null }
            val px = basis?.let { LENGTH.matchEntire(it) }?.let { m ->
                val n = m.groupValues[1].toDouble()
                (if (m.groupValues[2] == "px") n else n * 16).toInt()
            }
            return if (grow <= 0.0 && px != null) FlexSpec(0.0, px) else FlexSpec(grow.coerceAtLeast(0.01) * 100)
        }
    }
}

/** Lays its child out at exactly [width] (a `flex: 0 0 <len>` column). */
private class FixedWidth(private val width: Int, child: JComponent) : JPanel(java.awt.BorderLayout()) {
    init {
        isOpaque = false
        add(child, java.awt.BorderLayout.CENTER)
    }
    override fun getPreferredSize() = java.awt.Dimension(width, super.getPreferredSize().height)
    override fun getMinimumSize() = java.awt.Dimension(width, super.getMinimumSize().height)
}

/** TabLayout → a [JBTabbedPane]; each child is a tab (label from its metadata, body = its children). */
fun renderTabs(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val tabs = JBTabbedPane()
    val children = component.path("children")
    if (children.isArray) {
        for ((i, tab) in children.withIndex()) {
            val label = tab.path("metadata").text("label", "Tab ${i + 1}")
            val body = verticalPanel()
            val inner = tab.path("children")
            if (inner.isArray) for (child in inner) body.addStacked(r.render(child, state, data), JBGap)
            tabs.addTab(plain(label), body)
        }
    }
    // Access keys: switching tab changes which buttons are showing — re-assign the screen's letters.
    if (r.ctx.session.accessKeys) tabs.addChangeListener { AccessKeys.scheduleRefreshFrom(tabs) }
    return tabs
}

/** AccordionLayout → each panel rendered as a titled section, stacked (v1: not collapsible). */
fun renderAccordion(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    val children = component.path("children")
    if (children.isArray) {
        for (p in children) {
            val body = verticalPanel()
            body.border = IdeBorderFactory.createTitledBorder(plain(p.path("metadata").text("label")), false)
            val inner = p.path("children")
            if (inner.isArray) for (child in inner) body.addStacked(r.render(child, state, data), JBGap)
            panel.addStacked(body, JBGap)
        }
    }
    return panel
}

/** SplitLayout → a [JBSplitter] (2 children); more than two are stacked vertically as a fallback. */
fun renderSplit(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val children = (component.path("children")).let { if (it.isArray) it.toList() else emptyList() }
    return when (children.size) {
        0 -> JPanel()
        1 -> r.render(children[0], state, data)
        2 -> Splitter(false, 0.5f).apply {
            firstComponent = r.render(children[0], state, data)
            secondComponent = r.render(children[1], state, data)
        }
        else -> {
            val panel = verticalPanel()
            for (child in children) panel.addStacked(r.render(child, state, data), JBGap)
            panel
        }
    }
}
