package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/** Shared Swing helpers of the front-office UX components (money format, badge palette, chips, avatars, item actions). */

/** de-DE style money formatting: 1234.5 → "1.234,50" (fixed 2 decimals, thousands dots). */
internal fun uxFormatAmount(value: Double): String =
    java.text.DecimalFormat("#,##0.00", java.text.DecimalFormatSymbols(java.util.Locale.GERMANY)).format(value)

/** Badge palette (normal | success | warning | error | contrast) as theme-aware foregrounds. */
internal fun uxPaletteColor(color: String): Color = when (color.lowercase()) {
    "success", "ok" -> JBColor(0x3E8635, 0x4CAF50)
    "error", "danger" -> JBColor(0xC9190B, 0xE57373)
    "warning" -> JBColor(0xF0AB00, 0xFFB74D)
    "contrast" -> JBColor(0x1F2937, 0xCBD5E1)
    else -> JBColor(0x6A6E73, 0x9AA0A6)
}

/** Badge palette as solid chip backgrounds (white text stays readable in both themes). */
internal fun uxChipBg(color: String): Color = when (color.lowercase()) {
    "success", "ok" -> Color(0x3E, 0x86, 0x35)
    "error", "danger" -> Color(0xC9, 0x19, 0x0B)
    "warning" -> Color(0xF0, 0xAB, 0x00)
    "contrast" -> Color(0x1F, 0x29, 0x37)
    else -> Color(0x6A, 0x6E, 0x73)
}

internal fun uxChip(text: String, color: String): JBLabel = JBLabel(plain(text)).apply {
    foreground = Color.WHITE
    isOpaque = true
    background = uxChipBg(color)
    border = JBUI.Borders.empty(1, 6)
    font = font.deriveFont(Font.BOLD, 10f)
}

internal fun uxMuted(): Color = ToneColors.secondaryText()

internal fun uxAccent(): Color = JBColor(0x1A73E8, 0x548AF7)

/** Circular initials avatar (e.g. a guest's initials on a StatusList row). */
internal fun uxAvatar(initials: String, sizePx: Int): JComponent = object : JComponent() {
    init {
        val s = JBUI.scale(sizePx)
        preferredSize = Dimension(s, s)
        minimumSize = preferredSize
        maximumSize = preferredSize
    }
    override fun paintComponent(g: Graphics) {
        val g2 = g as Graphics2D
        g2.setRenderingHint(
            java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
        val d = minOf(width, height)
        g2.color = Color(0x1A, 0x73, 0xE8, 0x22)
        g2.fillOval((width - d) / 2, (height - d) / 2, d, d)
        g2.color = uxAccent()
        g2.font = font.deriveFont(Font.BOLD, JBUI.scale(10).toFloat())
        val fm = g2.fontMetrics
        g2.drawString(
            initials,
            (width - fm.stringWidth(initials)) / 2,
            (height - fm.height) / 2 + fm.ascent)
    }
}

internal fun uxTint(base: Color): Color = Color(base.red, base.green, base.blue, 24)

internal fun uxMono(base: Font, style: Int = Font.BOLD, size: Int = 0): Font =
    Font(Font.MONOSPACED, style, if (size > 0) size else base.size)

/** Maps the wire's neutral (Vaadin-set) action icon names to the IDE's own AllIcons glyphs;
 *  null → no icon known, the caller falls back to a labelled button. */
internal fun uxActionIcon(name: String): javax.swing.Icon? = when (name) {
    "vaadin:pencil", "vaadin:pen", "vaadin:edit" -> com.intellij.icons.AllIcons.Actions.Edit
    "vaadin:ban" -> com.intellij.icons.AllIcons.Actions.Cancel
    "vaadin:check" -> com.intellij.icons.AllIcons.Actions.Checked
    "vaadin:barcode", "vaadin:search" -> com.intellij.icons.AllIcons.Actions.Search
    "vaadin:rotate-left", "vaadin:refresh" -> com.intellij.icons.AllIcons.Actions.Refresh
    "vaadin:trash" -> com.intellij.icons.AllIcons.Actions.GC
    "vaadin:plus" -> com.intellij.icons.AllIcons.General.Add
    "vaadin:exchange" -> com.intellij.icons.AllIcons.Actions.SwapPanels
    "vaadin:wifi" -> com.intellij.icons.AllIcons.General.Web
    "vaadin:key" -> com.intellij.icons.AllIcons.CodeWithMe.CwmPermissions
    "vaadin:credit-card" -> com.intellij.icons.AllIcons.Actions.Commit
    "vaadin:gift" -> com.intellij.icons.AllIcons.Nodes.Favorite
    else -> null
}

/** Up to three per-item actions (actionId/actionLabel/actionIcon, 2, 3) as a row of buttons —
 *  icon-only (label as tooltip) when the icon maps to an AllIcons glyph, labelled otherwise. */
internal fun uxItemActions(r: ComponentRenderer, item: JsonNode): JComponent? {
    val id = item.text("id")
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0)).apply { isOpaque = false }
    for (suffix in listOf("", "2", "3")) {
        val actionId = item.text("actionId$suffix")
        val label = item.text("actionLabel$suffix")
        if (actionId.isBlank() || label.isBlank()) continue
        val icon = uxActionIcon(item.text("actionIcon$suffix"))
        val button = if (icon != null) {
            JButton(icon).apply {
                toolTipText = plainTip(label)
                putClientProperty("JButton.buttonType", "toolbar")
                preferredSize = Dimension(JBUI.scale(28), JBUI.scale(26))
            }
        } else {
            JButton(plain(label))
        }
        button.addActionListener { r.ctx.runAction(actionId, mapOf("_item" to id)) }
        row.add(button)
    }
    return if (row.componentCount > 0) row else null
}
