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
    panel.border = if (title.isNotBlank()) IdeBorderFactory.createTitledBorder(plain(title), false) else JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground())
    stackChildren(r, panel, component, state, data)
    return panel
}

/** FormSubSection → bold title + children, no card. */
fun renderSubSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(plain(title))
        l.font = l.font.deriveFont(Font.BOLD)
        panel.addStacked(l, 6)
    }
    stackChildren(r, panel, component, state, data)
    return panel
}

/**
 * Card → the web card's anatomy: `media` (on top, or on the left with the `horizontal` variant), a
 * header row of `headerPrefix` (an Avatar) · title + `subtitle` · `headerSuffix` (a Badge) — or the
 * whole `header` component when given —, then content, children and footer. Only title, content and
 * footer were drawn; the rest of the card was lost.
 */
fun renderCard(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val variants = metadata.path("variants").let { v -> if (v.isArray) v.map { it.asText() } else emptyList() }
    val horizontal = "horizontal" in variants
    val panel = verticalPanel()
    val media = metadata.path("media").takeIf { it.isObject }?.let { r.render(it, state, data) }
    if (media != null && !horizontal) panel.addStacked(media, JBGap)
    cardHeader(r, metadata, state, data)?.let { panel.addStacked(it, 6) }
    val content = metadata.path("content")
    val hasChildren = component.path("children").let { it.isArray && !it.isEmpty }
    val footer = metadata.path("footer")
    // No trailing gap after the LAST block — cards otherwise pile up bottom slack.
    if (content.isObject) panel.addStacked(r.render(content, state, data), if (hasChildren || footer.isObject) JBGap else 0)
    stackChildren(r, panel, component, state, data)
    if (footer.isObject) {
        if (hasChildren || content.isObject) panel.add(javax.swing.Box.createVerticalStrut(com.intellij.util.ui.JBUI.scale(JBGap)))
        panel.addStacked(leftAligned(r.render(footer, state, data)), 0)
    }
    val border = JBUI.Borders.compound(IdeBorderFactory.createRoundedBorder(), JBUI.Borders.empty(10))
    if (media == null || !horizontal) return panel.apply { this.border = border }
    // horizontal: the media on the left, everything else beside it, top-aligned
    val row = javax.swing.JPanel(java.awt.BorderLayout(JBUI.scale(12), 0))
    row.isOpaque = false
    row.border = border
    row.add(javax.swing.JPanel(java.awt.BorderLayout()).apply { isOpaque = false; add(media, java.awt.BorderLayout.NORTH) }, java.awt.BorderLayout.WEST)
    row.add(javax.swing.JPanel(java.awt.BorderLayout()).apply { isOpaque = false; add(panel, java.awt.BorderLayout.NORTH) }, java.awt.BorderLayout.CENTER)
    return row
}

/** The card's header row, or null when it has none. */
private fun cardHeader(r: ComponentRenderer, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent? {
    metadata.path("header").takeIf { it.isObject }?.let { return r.render(it, state, data) }
    val titleNode = metadata.path("title")
    val title: JComponent? = when {
        titleNode.isTextual -> titleNode.asText("").takeIf { it.isNotBlank() }?.let { JBLabel(plain(it)) }
        titleNode.isObject -> r.render(titleNode, state, data)
        else -> null
    }?.also { emphasise(it) }
    val subNode = metadata.path("subtitle")
    val subtitle: JComponent? = when {
        subNode.isTextual -> subNode.asText("").takeIf { it.isNotBlank() }?.let { JBLabel(plain(it)) }
        subNode.isObject -> r.render(subNode, state, data)
        else -> null
    }?.also { mute(it) }
    val prefix = metadata.path("headerPrefix").takeIf { it.isObject }?.let { r.render(it, state, data) }
    val suffix = metadata.path("headerSuffix").takeIf { it.isObject }?.let { r.render(it, state, data) }
    if (title == null && subtitle == null && prefix == null && suffix == null) return null
    if (prefix == null && suffix == null && subtitle == null) return title
    val texts = verticalPanel(0)
    title?.let { texts.addStacked(it, if (subtitle != null) 2 else 0) }
    subtitle?.let { texts.addStacked(it, 0) }
    val row = javax.swing.JPanel(java.awt.BorderLayout(JBUI.scale(8), 0))
    row.isOpaque = false
    prefix?.let { row.add(centred(it), java.awt.BorderLayout.WEST) }
    row.add(texts, java.awt.BorderLayout.CENTER)
    suffix?.let { row.add(centred(it), java.awt.BorderLayout.EAST) }
    return row
}

/** A child kept at its preferred size, vertically centred in its slot (an avatar beside two lines). */
private fun centred(c: JComponent): JComponent =
    javax.swing.JPanel(java.awt.GridBagLayout()).apply { isOpaque = false; add(c) }

/** A child kept at its preferred width at the left of a stack (a footer button stretched full width). */
internal fun leftAligned(c: JComponent): JComponent =
    if (c is javax.swing.AbstractButton) javax.swing.JPanel(java.awt.FlowLayout(java.awt.FlowLayout.LEFT, 0, 0)).apply { isOpaque = false; add(c) } else c

/** Bold, on every label of a rendered title (a Text renders as a label, or a wrapping area). */
private fun emphasise(c: JComponent) {
    if (c is javax.swing.JLabel || c is javax.swing.text.JTextComponent) c.font = c.font.deriveFont(Font.BOLD)
    else c.components.filterIsInstance<JComponent>().forEach(::emphasise)
}

/** The secondary text colour on every label of a rendered subtitle. */
private fun mute(c: JComponent) {
    if (c is javax.swing.JLabel || c is javax.swing.text.JTextComponent) c.foreground = ToneColors.secondaryText()
    else c.components.filterIsInstance<JComponent>().forEach(::mute)
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
        val l = JBLabel(plain(label))
        l.font = l.font.deriveFont(Font.BOLD)
        panel.addStacked(l, 4)
    }
    if (content.isObject) panel.addStacked(r.render(content, state, data), JBGap)
    if (hasChildren) for (c in children) panel.addStacked(r.render(c, state, data), JBGap)
    return panel
}

/**
 * Badge → a chip in Lumo's two looks: `primary` = solid colour with white text, otherwise a light
 * tint of the colour with the colour as text (every badge was solid); `small` is a smaller chip and
 * `pill` fully rounded ends.
 */
fun renderBadge(metadata: JsonNode): JComponent {
    val color = badgeColor(metadata.text("color"))
    val primary = metadata.path("primary").asBoolean(false)
    val pill = metadata.path("pill").asBoolean(false)
    val small = metadata.path("small").asBoolean(false)
    val label = BadgeLabel(plain(metadata.text("text")), pill)
    label.foreground = if (primary) Color.WHITE else badgeInk(color)
    label.background = if (primary) color else Color(color.red, color.green, color.blue, 46)
    label.border = if (small) JBUI.Borders.empty(1, 6) else JBUI.Borders.empty(2, 8)
    if (small) label.font = label.font.deriveFont(label.font.size2D * 0.85f)
    // its icon inside the chip: iconOnLeft before the text, iconOnRight after it (never drawn before)
    badgeIconOf(metadata)?.let { (name, after) ->
        wireIcon(name)?.let { icon ->
            label.icon = icon
            label.horizontalTextPosition = if (after) javax.swing.SwingConstants.LEADING else javax.swing.SwingConstants.TRAILING
        } ?: wireIconText(name)?.let { glyph -> label.text = plain(if (after) "${metadata.text("text")} $glyph" else "$glyph ${metadata.text("text")}") }
    }
    return label
}

/** A badge's text colour on its light tint: the colour itself, darkened enough to read (yellow). */
private fun badgeInk(c: Color): Color =
    if (c.red > 200 && c.green > 150) Color(0x8A, 0x5A, 0x00) else c

/** A label painting a rounded background (a pill: radius = height). */
private class BadgeLabel(text: String, private val pill: Boolean) : JBLabel(text) {
    init { isOpaque = false }
    // a chip keeps its own width in a stack (a vertical layout stretched it into a full-width bar)
    override fun getMaximumSize(): java.awt.Dimension = preferredSize
    override fun paintComponent(g: java.awt.Graphics) {
        val g2 = g.create() as java.awt.Graphics2D
        g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
        g2.color = background
        val arc = if (pill) height else JBUI.scale(8)
        g2.fillRoundRect(0, 0, width, height, arc, arc)
        g2.dispose()
        super.paintComponent(g)
    }
}

/** A Badge's icon and whether it goes AFTER the text — a label holds one: iconOnLeft wins. */
internal fun badgeIconOf(metadata: JsonNode): Pair<String, Boolean>? {
    val left = metadata.text("iconOnLeft")
    if (left.isNotBlank()) return left to false
    val right = metadata.text("iconOnRight")
    return if (right.isNotBlank()) right to true else null
}


fun renderAnchor(ctx: AppContext, metadata: JsonNode): JComponent {
    val text = metadata.text("text", metadata.text("url"))
    val url = metadata.text("url")
    return if (url.startsWith("/")) {
        ActionLink(plain(text)) { ctx.navigate(url, "", null, "") }
    } else {
        val l = JBLabel(plain(text))
        l.foreground = JBUI.CurrentTheme.Link.Foreground.ENABLED
        l
    }
}

fun renderProgressBar(metadata: JsonNode, state: JsonNode): JComponent {
    // a 0 bound means "unset" on the wire (a LongTask's dialog sends min 0, max 0 with a 0..1
    // value): the web's vaadin-progress-bar then keeps its 0..1 default, and so does this bar
    val min = metadata.dbl("min", 0.0)
    val max = metadata.dbl("max", 1.0).takeIf { it != 0.0 } ?: 1.0
    val valueKey = metadata.text("valueKey")
    val value = if (valueKey.isNotBlank()) state.dbl(valueKey, 0.0) else metadata.dbl("value", 0.0)
    val bar = JProgressBar(0, 100)
    val fraction = if (max > min) ((value - min) / (max - min)).coerceIn(0.0, 1.0) else 0.0
    bar.value = (fraction * 100).toInt()
    // IJ-11: the bar's own text (a wizard sends "Step 2") was dropped — the user had a 4px bar and
    // nothing saying where they were. It is painted on the bar and is its accessible name.
    val text = metadata.text("text")
    if (text.isNotBlank()) {
        bar.isStringPainted = true
        bar.string = text
        bar.accessibleName(text)
    }
    // the bar's theme (success / error / warning): the platform's own status colours, as the
    // test runner's bar uses them — every bar used to be the accent colour
    progressBarStatus(metadata.text("theme"))?.let { status ->
        bar.putClientProperty("ProgressBar.status", status)
        bar.foreground = when (status) {
            "passed" -> ToneColors.solid(ToneColors.Tone.SUCCESS).first
            "warning" -> ToneColors.solid(ToneColors.Tone.WARNING).first
            else -> ToneColors.solid(ToneColors.Tone.DANGER).first
        }
    }
    return bar
}

/** A ProgressBar's wire theme as the platform's ProgressBar.status (passed / warning / error). */
internal fun progressBarStatus(theme: String): String? = when (theme.trim().lowercase()) {
    "success" -> "passed"
    "warning" -> "warning"
    "error", "danger" -> "error"
    else -> null
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
