package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.dbl
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/** Front-office UX components for selling and charging (OfferCard, AddOnPicker, Ledger, PaymentPicker) on Swing. */

/** OfferCard: optional image + tag chip + title/subtitle + feature chips + footer CTA/current label. */
fun renderOfferCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val current = metadata.bool("current")
    val panel = verticalPanel(4)
    panel.border =
        if (current) JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(12))
        else JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(11))
    val image = metadata.text("image")
    if (image.isNotBlank()) {
        val img = runCatching { javax.imageio.ImageIO.read(java.net.URI.create(image).toURL()) }.getOrNull()
        if (img != null) {
            val scale = minOf(1.0, 320.0 / img.width)
            panel.addStacked(JBLabel(javax.swing.ImageIcon(
                img.getScaledInstance((img.width * scale).toInt(), (img.height * scale).toInt(), java.awt.Image.SCALE_SMOOTH))), 6)
        }
    }
    val tag = metadata.text("tag")
    if (tag.isNotBlank()) panel.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
        isOpaque = false
        add(uxChip(tag, "contrast"))
    }, 4)
    panel.addStacked(JBLabel(plain(metadata.text("title"))).apply { font = font.deriveFont(Font.BOLD, 15f) }, 2)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) panel.addStacked(JBLabel(plain(subtitle)).apply { foreground = uxMuted() }, 4)
    val features = metadata.arr("features")
    if (features.isNotEmpty()) {
        val row = JPanel(FlowLayout(FlowLayout.LEFT, 6, 2)).apply { isOpaque = false }
        for (feature in features) row.add(JBLabel(plain(feature.asText())).apply {
            border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(1, 6))
        })
        panel.addStacked(row, 6)
    }
    if (current) {
        val currentLabel = metadata.text("currentLabel")
        if (currentLabel.isNotBlank()) panel.addStacked(JBLabel(plain(currentLabel)).apply { foreground = uxMuted() }, 0)
    } else {
        val actionLabel = metadata.text("actionLabel")
        val actionId = metadata.text("actionId")
        if (actionLabel.isNotBlank()) {
            // toggle offers: while added the CTA shows addedLabel in success green
            val added = metadata.bool("added")
            val addedLabel = metadata.text("addedLabel")
            val label = if (added && addedLabel.isNotBlank()) addedLabel else actionLabel
            val priceLabel = metadata.text("priceLabel")
            val text = label + (if (priceLabel.isNotBlank()) "   $priceLabel" else "")
            panel.addStacked(JButton(plain(text)).apply {
                if (added) foreground = JBColor(0x3E8635, 0x4CAF50)
                if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
            }, 0)
        }
    }
    return panel
}

/** AddOnPicker: priced extras cards with a +/✓ toggle and a live running total. */
fun renderAddOnPicker(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val currency = metadata.text("currency")
    val totalLabelText = metadata.text("totalLabel")
    val items = metadata.arr("items")
    val added = items.filter { it.bool("added") }.map { it.text("id") }.toMutableSet()
    fun total() = items.filter { added.contains(it.text("id")) }.sumOf { it.dbl("price") }
    val totalLabel = JBLabel().apply {
        font = font.deriveFont(Font.BOLD)
        foreground = uxAccent()
    }
    fun updateTotal() {
        totalLabel.text = plain((if (totalLabelText.isNotBlank()) "$totalLabelText: " else "") +
            (if (currency.isNotBlank()) "$currency " else "") + uxFormatAmount(total()))
    }
    updateTotal()
    val panel = verticalPanel(6)
    panel.addStacked(JPanel(BorderLayout()).apply {
        isOpaque = false
        add(totalLabel, BorderLayout.EAST)
    }, 6)
    for (item in items) {
        val id = item.text("id")
        val includedLabel = item.text("includedLabel")
        val card = JPanel(BorderLayout(10, 0))
        card.isOpaque = false
        card.border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(10))
        val icon = item.text("icon")
        if (icon.isNotBlank()) card.add(JBLabel(plain(icon)).apply { font = font.deriveFont(16f) }, BorderLayout.WEST)
        val body = verticalPanel(1)
        body.addStacked(JBLabel(plain(item.text("title"))).apply { font = font.deriveFont(Font.BOLD) }, 1)
        val desc = item.text("description")
        if (desc.isNotBlank()) body.addStacked(JBLabel(plain(desc)).apply { foreground = uxMuted() }, 1)
        if (includedLabel.isNotBlank()) {
            body.addStacked(JBLabel(plain(includedLabel)).apply { foreground = uxMuted() }, 0)
        } else {
            val unit = item.text("unit")
            body.addStacked(JBLabel(plain((if (currency.isNotBlank()) "$currency " else "") +
                uxFormatAmount(item.dbl("price")) + (if (unit.isNotBlank()) " / $unit" else ""))).apply {
                font = uxMono(font)
                foreground = uxAccent()
            }, 0)
        }
        card.add(body, BorderLayout.CENTER)
        if (includedLabel.isBlank()) {
            val toggle = JButton(plain(if (added.contains(id)) "✓" else "+"))
            toggle.addActionListener {
                val nowAdded = !added.contains(id)
                if (nowAdded) added.add(id) else added.remove(id)
                toggle.text = if (nowAdded) "✓" else "+"
                updateTotal()
                if (actionId.isNotBlank()) {
                    r.ctx.runAction(actionId, mapOf("_item" to id, "_added" to nowAdded, "_total" to total()))
                }
            }
            card.add(toggle, BorderLayout.EAST)
        }
        panel.addStacked(card, 6)
    }
    return panel
}

private fun uxLedgerAmount(amount: Double, currency: String): String =
    (if (amount < 0) "-" else "") + (if (currency.isNotBlank()) "$currency " else "") +
        uxFormatAmount(kotlin.math.abs(amount))

/** Ledger: concept/amount rows (included lines show a label), a divider and the big total. */
fun renderLedger(metadata: JsonNode): JComponent {
    val currency = metadata.text("currency")
    val lines = metadata.arr("lines")
    val panel = verticalPanel(4)
    for (line in lines) {
        val row = JPanel(BorderLayout(12, 0)).apply { isOpaque = false }
        row.add(JBLabel(plain("● " + line.text("concept"))), BorderLayout.CENTER)
        if (line.bool("included")) {
            row.add(JBLabel(plain(line.text("includedLabel", "Included"))).apply { foreground = uxMuted() }, BorderLayout.EAST)
        } else {
            val amount = line.dbl("amount")
            row.add(JBLabel(plain(uxLedgerAmount(amount, currency))).apply {
                font = uxMono(font)
                if (amount < 0) foreground = uxPaletteColor("error")
            }, BorderLayout.EAST)
        }
        panel.addStacked(row, 4)
    }
    panel.addStacked(javax.swing.JSeparator(), 4)
    val totalNode = metadata.path("total")
    val total =
        if (totalNode.isNumber) totalNode.asDouble()
        else lines.filter { !it.bool("included") }.sumOf { it.dbl("amount") }
    val totalRow = JPanel(BorderLayout(12, 0)).apply { isOpaque = false }
    totalRow.add(JBLabel(plain(metadata.text("totalLabel", "Total"))).apply { font = font.deriveFont(Font.BOLD) }, BorderLayout.WEST)
    totalRow.add(JBLabel(plain(uxLedgerAmount(total, currency))).apply { font = uxMono(font, Font.BOLD, font.size + 3) }, BorderLayout.EAST)
    panel.addStacked(totalRow, 0)
    return panel
}

/** PaymentPicker: segmented method toggles + optional context chip + confirm button. */
fun renderPaymentPicker(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val methodActionId = metadata.text("methodActionId")
    var selected = metadata.text("selected")
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 8, 0)).apply { isOpaque = false }
    val group = javax.swing.ButtonGroup()
    for (method in metadata.arr("methods")) {
        val id = method.text("id")
        if (selected.isBlank()) selected = id
        val btn = javax.swing.JToggleButton(plain(method.text("label", id)))
        btn.isSelected = id == selected
        btn.addActionListener {
            selected = id
            if (methodActionId.isNotBlank()) r.ctx.runAction(methodActionId, mapOf("_method" to id))
        }
        group.add(btn)
        row.add(btn)
    }
    val contextValue = metadata.text("contextValue")
    if (contextValue.isNotBlank()) {
        val ctxBox = verticalPanel(1)
        ctxBox.isOpaque = true
        ctxBox.background = uxTint(uxChipBg("success"))
        ctxBox.border = JBUI.Borders.empty(4, 8)
        val contextLabel = metadata.text("contextLabel")
        if (contextLabel.isNotBlank()) ctxBox.addStacked(JBLabel(plain(contextLabel)).apply {
            font = font.deriveFont(Font.BOLD, 9f)
            foreground = uxPaletteColor("success")
        }, 1)
        ctxBox.addStacked(JBLabel(plain(contextValue)).apply { font = uxMono(font) }, 0)
        row.add(ctxBox)
    }
    val panel = JPanel(BorderLayout(8, 0)).apply { isOpaque = false }
    panel.add(row, BorderLayout.WEST)
    val confirmLabel = metadata.text("confirmLabel")
    if (confirmLabel.isNotBlank()) {
        panel.add(JButton(plain(confirmLabel)).apply {
            if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, mapOf("_method" to selected)) }
        }, BorderLayout.EAST)
    }
    return panel
}
