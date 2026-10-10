package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.Font
import java.awt.FlowLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Page — port of the JavaFX `PageRenderer`. Header (title/subtitle + toolbar buttons), optional
 * banners, the body `children`, and a bottom button bar.
 */
fun renderPage(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val root = JPanel(BorderLayout(0, JBUI.scale(JBGap)))
    root.border = JBUI.Borders.empty(16)

    // Header (NORTH): title / subtitle / toolbar / banners.
    val header = verticalPanel(4)
    val exprCtx = mapOf<String, Any?>("state" to r.ctx.currentComponentState, "appState" to r.ctx.appState)
    val title = io.mateu.ijp.state.Expressions.interpolate(metadata.text("title", metadata.text("pageTitle")), exprCtx)
    // Title + (optional) record/context switcher beside it — the header's "which one" selector.
    val switcher = PageSlots.switcherOf(metadata)
    if (title.isNotBlank() || switcher != null) {
        val titleRow = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(12), 0))
        titleRow.isOpaque = false
        if (title.isNotBlank()) {
            val l = JBLabel(title)
            l.font = l.font.deriveFont(Font.BOLD, 20f)
            titleRow.add(l)
        }
        if (switcher != null) titleRow.add(renderRecordSwitcher(r, switcher))
        header.addStacked(titleRow, 4)
    }
    val subtitle = io.mateu.ijp.state.Expressions.interpolate(metadata.text("subtitle"), exprCtx)
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle)
        l.foreground = JBUI.CurrentTheme.Label.disabledForeground()
        header.addStacked(l, 8)
    }
    // Toolbar actions go to the native host toolbar (editor header / tool window title) when the
    // host provides one — the IntelliJ-idiomatic spot; otherwise render the inline button row.
    // @BadgeInHeader chips + KPI band under the title.
    val badges = metadata.arr("badges")
    if (badges.isNotEmpty()) {
        val row = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0))
        row.isOpaque = false
        for (b in badges) row.add(headerBadge(b, exprCtx))
        header.addStacked(row, 6)
    }
    val kpis = metadata.arr("kpis")
    if (kpis.isNotEmpty()) {
        val row = JPanel(FlowLayout(FlowLayout.LEFT, 18, 0))
        row.isOpaque = false
        for (k in kpis) {
            val cell = verticalPanel(0)
            val value = JBLabel(io.mateu.ijp.state.Expressions.interpolate(k.text("text"), exprCtx))
            value.font = value.font.deriveFont(Font.BOLD, 18f)
            cell.addStacked(value, 0)
            cell.addStacked(JBLabel(io.mateu.ijp.state.Expressions.interpolate(k.text("title"), exprCtx)).apply {
                foreground = JBUI.CurrentTheme.Label.disabledForeground()
            }, 0)
            row.add(cell)
        }
        header.addStacked(row, 8)
    }
    val toolbar = metadata.arr("toolbar")
    if (toolbar.isNotEmpty() && !r.ctx.publishToolbar(toolbar)) header.addStacked(buttonRow(r, toolbar), 8)
    // @Fab actions surface as header buttons — the desktop has no floating layer over the editor.
    val fabs = metadata.arr("fabs")
    if (fabs.isNotEmpty()) header.addStacked(buttonRow(r, fabs), 8)
    for (banner in metadata.arr("banners")) header.addStacked(renderBanner(banner), 8)
    // Action-returned banners (UIIncrementDto.banners) render after the static ones.
    for (banner in r.ctx.actionBanners) header.addStacked(renderBanner(banner), 8)
    if (header.componentCount > 0) root.add(header, BorderLayout.NORTH)

    // Body (CENTER): a single child fills; several stack vertically.
    val children = if (component.path("children").isArray) component.path("children").toList() else emptyList()
    val body: JComponent = if (children.size == 1) {
        r.render(children[0], state, data)
    } else {
        val stack = verticalPanel()
        for (child in children) stack.addStacked(r.render(child, state, data), JBGap)
        stack
    }
    root.add(body, BorderLayout.CENTER)

    // Bottom button bar (SOUTH).
    val buttons = metadata.arr("buttons")
    if (buttons.isNotEmpty()) {
        val row = buttonRow(r, buttons)
        row.border = JBUI.Borders.emptyTop(JBGap)
        root.add(row, BorderLayout.SOUTH)
    }
    // The page's own CSS style caps the content width (e.g. `max-width:900px;margin:auto`, how the
    // web keeps forms readable) — anchored left, the IDE way, instead of centered.
    parseMaxWidth(component.text("style"))?.let { return MaxWidthPanel(it, root) }
    return root
}

internal fun buttonRow(r: ComponentRenderer, buttons: List<JsonNode>): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0))
    row.isOpaque = false
    for (b in buttons) row.add(renderButton(r.ctx, b))
    return row
}

private fun renderBanner(banner: JsonNode): JComponent {
    val theme = banner.text("theme", "INFO").uppercase()
    val (bg, fg) = when (theme) {
        "SUCCESS" -> Color(0xE6, 0xF4, 0xEA) to Color(0x1E, 0x4A, 0x2B)
        "WARNING" -> Color(0xFD, 0xF6, 0xE3) to Color(0x6B, 0x53, 0x00)
        "DANGER", "ERROR" -> Color(0xFB, 0xE9, 0xE7) to Color(0x7A, 0x1E, 0x14)
        else -> Color(0xE8, 0xF0, 0xFE) to Color(0x0B, 0x3D, 0x91)
    }
    val panel = JPanel()
    panel.layout = javax.swing.BoxLayout(panel, javax.swing.BoxLayout.Y_AXIS)
    panel.background = bg
    panel.isOpaque = true
    panel.border = JBUI.Borders.empty(10, 12)
    val bTitle = banner.text("title")
    if (bTitle.isNotBlank()) {
        val l = JBLabel(bTitle)
        l.foreground = fg
        l.font = l.font.deriveFont(Font.BOLD)
        l.alignmentX = Component.LEFT_ALIGNMENT
        panel.add(l)
    }
    val desc = banner.text("description")
    if (desc.isNotBlank()) {
        val l = JBLabel(desc)
        l.foreground = fg
        l.alignmentX = Component.LEFT_ALIGNMENT
        panel.add(l)
    }
    return panel
}


private fun headerBadge(badge: JsonNode, exprCtx: Map<String, Any?>): JComponent {
    val bg = when (badge.text("color").lowercase()) {
        "success" -> Color(0xE6, 0xF4, 0xEA)
        "error" -> Color(0xFC, 0xE8, 0xE6)
        "warning" -> Color(0xFE, 0xF7, 0xE0)
        "contrast" -> Color(0xDA, 0xDC, 0xE0)
        else -> Color(0xE8, 0xEA, 0xED)
    }
    return JBLabel(io.mateu.ijp.state.Expressions.interpolate(badge.text("text"), exprCtx)).apply {
        isOpaque = true
        background = bg
        border = JBUI.Borders.empty(2, 8)
    }
}

/**
 * The page header's record/context switcher (`PageDto.switcher`): a muted hint + a combo box on the
 * current value. Picking another entry runs the switcher's action (`_switchRecord`) with
 * `{_record: value}`; `disabled` makes it read-only; `searchable` adds the IDE's speed search
 * (type over the open list to filter/jump), the platform idiom for a filterable combo.
 */
internal fun renderRecordSwitcher(r: ComponentRenderer, switcher: PageSlots.Switcher): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0))
    row.isOpaque = false
    val hint = JBLabel(switcher.label)
    hint.foreground = JBUI.CurrentTheme.Label.disabledForeground()
    row.add(hint)

    val combo = com.intellij.openapi.ui.ComboBox(javax.swing.DefaultComboBoxModel(switcher.options.toTypedArray()))
    combo.renderer = object : com.intellij.ui.ColoredListCellRenderer<PageSlots.SwitcherOption>() {
        override fun customizeCellRenderer(
            list: javax.swing.JList<out PageSlots.SwitcherOption>,
            value: PageSlots.SwitcherOption?,
            index: Int,
            selected: Boolean,
            hasFocus: Boolean,
        ) {
            if (value == null) return
            append(value.label)
            // Descriptions only in the open list — the closed box shows just the current value.
            if (index >= 0 && value.description.isNotBlank()) {
                append("  " + value.description, com.intellij.ui.SimpleTextAttributes.GRAYED_ATTRIBUTES)
            }
        }
    }
    combo.selectedIndex = switcher.selectedIndex
    combo.isEnabled = !switcher.disabled
    hint.labelling(combo)
    combo.accessibleDescription(if (switcher.type == "context") "Changes the context of this page" else "Shows another record")
    if (switcher.searchable) runCatching { com.intellij.ui.ComboboxSpeedSearch.installOn(combo) }
    combo.addItemListener { e ->
        if (e.stateChange != java.awt.event.ItemEvent.SELECTED) return@addItemListener
        val picked = e.item as? PageSlots.SwitcherOption ?: return@addItemListener
        PageSlots.switchParameters(switcher, picked)?.let { r.ctx.runAction(switcher.actionId, it) }
    }
    row.add(combo)
    return row
}
