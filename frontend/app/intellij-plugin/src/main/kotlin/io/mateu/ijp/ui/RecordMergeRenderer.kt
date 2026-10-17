package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import javax.swing.ButtonGroup
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JRadioButton
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

/** Tint of a row whose values differ (amber, light and dark). */
private val DIFFERS_BG = JBColor(0xFFF4D6, 0x4A3F22)

/**
 * Compare and merge (wire `RecordMerge`): a grid with a header row (the records, with their
 * captions), one row per field — a radio per record value in a [ButtonGroup] (named for a screen
 * reader "Use value from {record} for {field}"), plus a free-text value on editable rows. Rows whose
 * values differ are tinted and marked "differs". A "Show only differences" switch, a summary and the
 * merge button (dispatching `mergeActionId` with `_merged` / `_choices`) close it. The picks are
 * client-side state; the model lives in [RecordMerges].
 */
fun renderRecordMerge(ctx: AppContext, metadata: JsonNode): JComponent {
    val records = RecordMerges.recordsOf(metadata)
    val fields = RecordMerges.fieldsOf(metadata)
    val picks = RecordMerges.initialPicks(records, fields)
    val custom = HashMap<String, String>()
    var differencesOnly = metadata.path("differencesOnly").asBoolean(false)
    val anyEditable = fields.any { it.editable }

    val root = JPanel(BorderLayout(0, JBUI.scale(8)))
    root.isOpaque = false
    val grid = JPanel(GridBagLayout())
    grid.isOpaque = false
    val summary = JBLabel()
    summary.foreground = com.intellij.util.ui.UIUtil.getContextHelpForeground()

    fun refreshSummary() {
        summary.text = plain(RecordMerges.summary(fields, picks))
    }

    fun cell(c: JComponent, x: Int, y: Int, differs: Boolean, weight: Double = 1.0) {
        val holder = JPanel(BorderLayout())
        holder.isOpaque = differs
        if (differs) holder.background = DIFFERS_BG
        holder.border = JBUI.Borders.compound(
            JBUI.Borders.customLineBottom(JBColor.border()), JBUI.Borders.empty(4, 6))
        holder.add(c, BorderLayout.CENTER)
        grid.add(holder, GridBagConstraints().apply {
            gridx = x; gridy = y; fill = GridBagConstraints.BOTH; weightx = weight; anchor = GridBagConstraints.WEST
        })
    }

    fun rebuild() {
        grid.removeAll()
        // header row
        cell(JBLabel("Field").apply { font = font.deriveFont(Font.BOLD) }, 0, 0, false, 0.0)
        records.forEachIndexed { i, r ->
            val h = verticalPanel(0)
            h.addStacked(JBLabel(plain(r.label)).apply { font = font.deriveFont(Font.BOLD) }, 0)
            r.caption?.let { h.addStacked(JBLabel(plain(it)).apply { font = JBUI.Fonts.smallFont() }, 0) }
            cell(h, i + 1, 0, false)
        }
        if (anyEditable) cell(JBLabel("Custom").apply { font = font.deriveFont(Font.BOLD) }, records.size + 1, 0, false)

        RecordMerges.visibleFields(fields, differencesOnly).forEachIndexed { row, field ->
            val y = row + 1
            val label = JBLabel(plain(if (field.differs) "${field.label}  · differs" else field.label))
            label.font = label.font.deriveFont(Font.BOLD)
            cell(label, 0, y, field.differs, 0.0)
            val group = ButtonGroup()
            records.forEachIndexed { i, r ->
                val text = RecordMerges.valueText(field.values.getOrNull(i))
                val radio = JRadioButton(plain(text.ifBlank { "(empty)" }))
                radio.isOpaque = false
                radio.isSelected = picks[field.fieldId] == r.id
                radio.accessibleName(RecordMerges.pickName(r.label, field.label))
                radio.addActionListener { picks[field.fieldId] = r.id; refreshSummary() }
                group.add(radio)
                cell(radio, i + 1, y, field.differs)
            }
            if (anyEditable) {
                if (field.editable) {
                    val p = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0))
                    p.isOpaque = false
                    val radio = JRadioButton()
                    radio.isOpaque = false
                    radio.isSelected = picks[field.fieldId] == RecordMerges.CUSTOM
                    radio.accessibleName("Custom value for ${field.label}")
                    radio.addActionListener { picks[field.fieldId] = RecordMerges.CUSTOM; refreshSummary() }
                    group.add(radio)
                    val input = JBTextField(custom[field.fieldId] ?: "", 14)
                    input.accessibleName("Custom value for ${field.label}")
                    input.document.addDocumentListener(object : DocumentListener {
                        private fun changed() {
                            custom[field.fieldId] = input.text
                            picks[field.fieldId] = RecordMerges.CUSTOM
                            radio.isSelected = true
                            refreshSummary()
                        }
                        override fun insertUpdate(e: DocumentEvent) = changed()
                        override fun removeUpdate(e: DocumentEvent) = changed()
                        override fun changedUpdate(e: DocumentEvent) = changed()
                    })
                    p.add(radio)
                    p.add(input)
                    cell(p, records.size + 1, y, field.differs)
                } else {
                    cell(JBLabel(""), records.size + 1, y, field.differs)
                }
            }
        }
        grid.revalidate()
        grid.repaint()
    }

    val top = JPanel(BorderLayout())
    top.isOpaque = false
    metadata.text("title").takeIf { it.isNotBlank() }?.let {
        top.add(JBLabel(plain(it)).apply { font = font.deriveFont(Font.BOLD, font.size2D * 1.15f) }, BorderLayout.WEST)
    }
    val onlyDiffs = JBCheckBox("Show only differences", differencesOnly)
    onlyDiffs.isOpaque = false
    onlyDiffs.addActionListener { differencesOnly = onlyDiffs.isSelected; rebuild() }
    top.add(onlyDiffs, BorderLayout.EAST)

    val footer = JPanel(BorderLayout(JBUI.scale(8), 0))
    footer.isOpaque = false
    footer.add(summary, BorderLayout.CENTER)
    val actionId = metadata.text("mergeActionId")
    if (actionId.isNotBlank()) {
        val merge = JButton(plain(metadata.text("mergeLabel").ifBlank { "Merge" }))
        merge.addActionListener {
            val parameters = RecordMerges.mergeParameters(metadata, records, fields, picks, custom) {
                ctx.mapper.convertValue(it, Any::class.java)
            }
            ctx.runAction(actionId, parameters)
        }
        footer.add(merge, BorderLayout.EAST)
    }

    rebuild()
    refreshSummary()
    root.add(top, BorderLayout.NORTH)
    root.add(grid, BorderLayout.CENTER)
    root.add(footer, BorderLayout.SOUTH)
    root.accessibleName(metadata.text("title").ifBlank { "Compare and merge" })
    return root
}
