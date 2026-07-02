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

/** HorizontalLayout → a horizontal row of children. */
fun renderHBox(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val gap = if (metadata.bool("spacing", true)) JBGap else 0
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(gap), 0))
    row.isOpaque = false
    val children = component.path("children")
    if (children.isArray) for (child in children) row.add(r.render(child, state, data))
    return row
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
