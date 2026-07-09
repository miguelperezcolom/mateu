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
    if (children.isArray) for (child in children) panel.addStacked(r.render(child, state, data), gap)
    return panel
}

/** HorizontalLayout → a horizontal row of children. Children carrying flex bases in their style
 *  (`flex: 0 0 64%`, the zones layout) become top-anchored proportional columns; otherwise a
 *  simple left-aligned flow row (buttons etc.). */
fun renderHBox(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val gap = if (metadata.bool("spacing", true)) JBGap else 0
    val children = component.path("children").let { if (it.isArray) it.toList() else emptyList() }
    val weights = children.map { flexPercent(it.text("style")) }
    if (weights.any { it != null }) {
        val row = JPanel(java.awt.GridBagLayout())
        row.isOpaque = false
        children.forEachIndexed { i, child ->
            val gbc = java.awt.GridBagConstraints().apply {
                gridx = i
                gridy = 0
                weightx = weights[i] ?: 10.0
                weighty = 1.0
                // Preferred height anchored NORTH: every column starts at the top of the row
                // (the wire even says so: align-items: flex-start).
                fill = java.awt.GridBagConstraints.HORIZONTAL
                anchor = java.awt.GridBagConstraints.NORTH
                insets = JBUI.insets(0, if (i == 0) 0 else gap, 0, 0)
            }
            row.add(r.render(child, state, data), gbc)
        }
        return row
    }
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(gap), 0))
    row.isOpaque = false
    for (child in children) row.add(r.render(child, state, data))
    return row
}

/** The flex-basis percentage in a CSS style (`flex: G S NN%`); null when absent. */
private fun flexPercent(style: String): Double? =
    Regex("flex:\\s*\\d+\\s+\\d+\\s+(\\d+(?:\\.\\d+)?)%").find(style)?.groupValues?.get(1)?.toDoubleOrNull()

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
            tabs.addTab(label, body)
        }
    }
    return tabs
}

/** AccordionLayout → each panel rendered as a titled section, stacked (v1: not collapsible). */
fun renderAccordion(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    val children = component.path("children")
    if (children.isArray) {
        for (p in children) {
            val body = verticalPanel()
            body.border = IdeBorderFactory.createTitledBorder(p.path("metadata").text("label"), false)
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
