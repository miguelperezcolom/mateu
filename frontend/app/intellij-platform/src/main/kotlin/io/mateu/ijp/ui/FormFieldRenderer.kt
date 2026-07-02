package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.ComboBox
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBPasswordField
import com.intellij.ui.components.JBTextArea
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.Color
import java.awt.Component
import javax.swing.DefaultComboBoxModel
import javax.swing.JComponent
import javax.swing.JScrollPane
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

private val BOOL_TYPES = setOf("bool", "boolean", "Boolean")
private val DATE_TYPES = setOf("date", "LocalDate")
private val INT_TYPES = setOf("integer", "int", "long", "Integer", "Long")
private val NUMBER_TYPES = setOf("number", "double", "float", "decimal", "BigDecimal")
private val MONEY_STEREOTYPES = setOf("money", "currency")

/**
 * FormField → a concrete Swing/JB input, seeded from `state[fieldId]` (else `metadata.initialValue`),
 * writing user edits back into `ctx.currentComponentState[fieldId]`. Port of the JavaFX
 * `FormFieldRenderer` decision order.
 */
fun renderFormField(ctx: AppContext, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val fieldId = metadata.text("fieldId")
    val label = metadata.text("label", fieldId)
    val dataType = metadata.text("dataType", "string")
    val stereotype = metadata.text("stereotype")
    val required = metadata.bool("required")
    val enabled = !metadata.bool("readOnly") && !metadata.bool("disabled")

    val rawValue: JsonNode = if (!state.isNull && !state.isMissingNode && state.has(fieldId)) {
        state.path(fieldId)
    } else {
        metadata.path("initialValue")
    }
    val value = if (rawValue.isNull || rawValue.isMissingNode) "" else rawValue.asText("")

    val container = verticalPanel(2)

    // Boolean → inline checkbox carrying its own label, no separate caption.
    if (dataType in BOOL_TYPES) {
        val cb = JBCheckBox(label, rawValue.asBoolean(false))
        cb.isEnabled = enabled
        cb.addActionListener { ctx.currentComponentState[fieldId] = cb.isSelected }
        cb.alignmentX = Component.LEFT_ALIGNMENT
        container.add(cb)
        return container
    }

    val caption = JBLabel(if (required) "$label *" else label)
    caption.alignmentX = Component.LEFT_ALIGNMENT
    container.add(caption)

    val options = metadata.arr("options")
    val input: JComponent = when {
        stereotype == "textarea" -> textArea(ctx, fieldId, value, enabled)
        options.isNotEmpty() -> optionsCombo(ctx, fieldId, options, value, enabled)
        dataType == "reference" -> referenceCombo(ctx, fieldId, data, enabled)
        stereotype == "password" -> passwordField(ctx, fieldId, value, enabled)
        dataType in DATE_TYPES -> dateField(ctx, fieldId, value, enabled)
        dataType in INT_TYPES -> numberField(ctx, fieldId, value, enabled, integer = true)
        dataType in NUMBER_TYPES || stereotype in MONEY_STEREOTYPES ->
            numberField(ctx, fieldId, value, enabled, integer = false)
        else -> plainField(ctx, fieldId, value, enabled)
    }
    input.alignmentX = Component.LEFT_ALIGNMENT
    container.add(input)

    val error = ctx.currentFieldErrors[fieldId]
    if (error != null) {
        val err = JBLabel(error)
        err.foreground = Color(0xC9, 0x19, 0x0B)
        err.alignmentX = Component.LEFT_ALIGNMENT
        container.add(err)
    }
    return container
}

private fun plainField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val tf = JBTextField(initial)
    tf.isEnabled = enabled
    tf.onTextChange { ctx.currentComponentState[fieldId] = tf.text }
    return tf
}

private fun passwordField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val pf = JBPasswordField()
    pf.text = initial
    pf.isEnabled = enabled
    pf.onTextChange { ctx.currentComponentState[fieldId] = String(pf.password) }
    return pf
}

private fun textArea(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val ta = JBTextArea(initial, 4, 40)
    ta.isEnabled = enabled
    ta.lineWrap = true
    ta.wrapStyleWord = true
    ta.document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
        override fun removeUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
        override fun changedUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
    })
    return JScrollPane(ta)
}

private fun dateField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    // No date picker in the JB component set for this subset — a plain text field with an ISO hint.
    val tf = JBTextField(initial)
    tf.isEnabled = enabled
    tf.emptyText.text = "YYYY-MM-DD"
    tf.onTextChange { ctx.currentComponentState[fieldId] = tf.text }
    return tf
}

private fun numberField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean, integer: Boolean): JComponent {
    val tf = JBTextField(initial)
    tf.isEnabled = enabled
    tf.onTextChange {
        val raw = tf.text
        if (integer) raw.toIntOrNull()?.let { ctx.currentComponentState[fieldId] = it }
        else raw.replace(',', '.').toDoubleOrNull()?.let { ctx.currentComponentState[fieldId] = it }
    }
    return tf
}

private fun optionsCombo(ctx: AppContext, fieldId: String, options: List<JsonNode>, value: String, enabled: Boolean): JComponent {
    val labels = options.map { it.text("label", it.text("value")) }
    val values = options.map { it.text("value") }
    val combo = ComboBox(DefaultComboBoxModel(labels.toTypedArray()))
    combo.isEnabled = enabled
    val selectedIdx = values.indexOf(value)
    if (selectedIdx >= 0) combo.selectedIndex = selectedIdx
    combo.addActionListener {
        val i = combo.selectedIndex
        if (i in values.indices) ctx.currentComponentState[fieldId] = values[i]
    }
    return combo
}

private fun referenceCombo(ctx: AppContext, fieldId: String, data: JsonNode, enabled: Boolean): JComponent {
    val remote = if (!data.isNull && !data.isMissingNode) {
        if (data.has(fieldId)) data.path(fieldId) else data
    } else {
        data
    }
    val content = if (remote.has("content")) remote.path("content") else remote
    val options = if (content.isArray) content.toList() else emptyList()
    val labels = options.map { it.text("label", it.text("name", it.text("value"))) }
    val combo = ComboBox(DefaultComboBoxModel(labels.toTypedArray()))
    combo.isEnabled = enabled
    combo.selectedIndex = -1
    combo.addActionListener {
        val i = combo.selectedIndex
        if (i in labels.indices) ctx.currentComponentState[fieldId] = labels[i]
    }
    return combo
}

/** Convenience: fire [block] on any text-document change. */
private fun javax.swing.text.JTextComponent.onTextChange(block: () -> Unit) {
    document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) = block()
        override fun removeUpdate(e: DocumentEvent) = block()
        override fun changedUpdate(e: DocumentEvent) = block()
    })
}
