package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.IdeBorderFactory
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.dbl
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.Color
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JProgressBar

/** FormSection → children in a titled, outlined card. */
fun renderSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    val title = metadata.text("title")
    panel.border = if (title.isNotBlank()) IdeBorderFactory.createTitledBorder(title, false) else JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground())
    stackChildren(r, panel, component, state, data)
    return panel
}

/** FormSubSection → bold title + children, no card. */
fun renderSubSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD)
        panel.addStacked(l, 6)
    }
    stackChildren(r, panel, component, state, data)
    return panel
}

/** Card → optional title (string or component), content, children, footer. */
fun renderCard(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    panel.border = JBUI.Borders.compound(
        IdeBorderFactory.createRoundedBorder(),
        JBUI.Borders.empty(10),
    )
    val titleNode = metadata.path("title")
    if (titleNode.isTextual) {
        val t = titleNode.asText("")
        if (t.isNotBlank()) {
            val l = JBLabel(t)
            l.font = l.font.deriveFont(Font.BOLD)
            panel.addStacked(l, 6)
        }
    } else if (titleNode.isObject) {
        panel.addStacked(r.render(titleNode, state, data), 6)
    }
    val content = metadata.path("content")
    val hasChildren = component.path("children").let { it.isArray && !it.isEmpty }
    val footer = metadata.path("footer")
    // No trailing gap after the LAST block — cards otherwise pile up bottom slack.
    if (content.isObject) panel.addStacked(r.render(content, state, data), if (hasChildren || footer.isObject) JBGap else 0)
    stackChildren(r, panel, component, state, data)
    if (footer.isObject) {
        if (hasChildren || content.isObject) panel.add(javax.swing.Box.createVerticalStrut(com.intellij.util.ui.JBUI.scale(JBGap)))
        panel.addStacked(r.render(footer, state, data), 0)
    }
    return panel
}

/**
 * CustomField → renders its `metadata.content` (the field's actual UI). The content may be a plain
 * component tree or an embedded **ServerSide island** (an `@Inline` orchestrator / adapter, e.g. the
 * check-in guests/cardex sections) — either way [ComponentRenderer.render] handles it (a ServerSide
 * goes through `loadServerSideComponent`). An optional label + `children` are stacked around it.
 */
fun renderCustomField(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val label = metadata.text("label")
    val content = metadata.path("content")
    val children = component.path("children")
    val hasChildren = children.isArray && !children.isEmpty

    if (label.isBlank() && !hasChildren && content.isObject) {
        return r.render(content, state, data) // pure pass-through (the common case)
    }
    val panel = verticalPanel(4)
    if (label.isNotBlank()) {
        val l = JBLabel(label)
        l.font = l.font.deriveFont(Font.BOLD)
        panel.addStacked(l, 4)
    }
    if (content.isObject) panel.addStacked(r.render(content, state, data), JBGap)
    if (hasChildren) for (c in children) panel.addStacked(r.render(c, state, data), JBGap)
    return panel
}

fun renderBadge(metadata: JsonNode): JComponent {
    val label = JBLabel(metadata.text("text"))
    label.foreground = Color.WHITE
    label.isOpaque = true
    label.background = badgeColor(metadata.text("color"))
    label.border = JBUI.Borders.empty(2, 8)
    return label
}

fun renderAnchor(ctx: AppContext, metadata: JsonNode): JComponent {
    val text = metadata.text("text", metadata.text("url"))
    val url = metadata.text("url")
    return if (url.startsWith("/")) {
        ActionLink(text) { ctx.navigate(url, "", null, "") }
    } else {
        val l = JBLabel(text)
        l.foreground = JBUI.CurrentTheme.Link.Foreground.ENABLED
        l
    }
}

fun renderProgressBar(metadata: JsonNode, state: JsonNode): JComponent {
    val min = metadata.dbl("min", 0.0)
    val max = metadata.dbl("max", 1.0)
    val valueKey = metadata.text("valueKey")
    val value = if (valueKey.isNotBlank()) state.dbl(valueKey, 0.0) else metadata.dbl("value", 0.0)
    val bar = JProgressBar(0, 100)
    val fraction = if (max > min) ((value - min) / (max - min)).coerceIn(0.0, 1.0) else 0.0
    bar.value = (fraction * 100).toInt()
    return bar
}

private fun stackChildren(r: ComponentRenderer, panel: javax.swing.JPanel, component: JsonNode, state: JsonNode, data: JsonNode) {
    val children = component.path("children")
    if (children.isArray) {
        children.forEachIndexed { i, child ->
            panel.addStackedBetween(r.render(child, state, data), JBGap, first = i == 0 && panel.componentCount == 0)
        }
    }
}

internal fun badgeColor(color: String): Color = when (color.lowercase()) {
    "success" -> Color(0x3E, 0x86, 0x35)
    "error", "danger" -> Color(0xC9, 0x19, 0x0B)
    "warning" -> Color(0xF0, 0xAB, 0x00)
    "info" -> Color(0x2B, 0x9A, 0xF3)
    else -> Color(0x6A, 0x6E, 0x73)
}
