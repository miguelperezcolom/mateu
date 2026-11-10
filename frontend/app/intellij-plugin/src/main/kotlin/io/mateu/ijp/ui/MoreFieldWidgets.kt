package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTabbedPane
import com.intellij.ui.components.JBTextArea
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.FlowLayout
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JSpinner
import javax.swing.ListSelectionModel
import javax.swing.SpinnerDateModel

/**
 * Field widgets the desktop lacked: a file chooser (`fileUpload`), a list box (`listBox`), a time
 * and a date-time picker, an editable markup field with its preview, a lookup's display label and
 * the `@Help` text under a field. Each mirrors the web's widget contract on the wire value.
 */
object FieldValues {
    /** What a lookup's button shows: the label the server sent beside the value (`<field>-label`), the
     *  option of that value in the field's data page, else the value itself. */
    fun lookupLabel(data: JsonNode, fieldId: String, value: String): String {
        if (value.isBlank()) return ""
        data.path("$fieldId-label").takeIf { it.isTextual && it.asText().isNotBlank() }?.let { return it.asText() }
        val page = data.path(fieldId).path("content")
        if (page.isArray) page.firstOrNull { it.text("value") == value }?.let { return it.text("label", value) }
        return value
    }

    /** The file a `fileUpload` value names: "name (12 KB)" for a data URI carrying a name, else a summary. */
    fun fileSummary(value: String): String {
        if (value.isBlank()) return "No file chosen"
        if (!value.startsWith("data:")) return value
        val head = value.substringBefore(',')
        val name = Regex(";name=([^;,]+)").find(head)?.groupValues?.get(1)?.let { java.net.URLDecoder.decode(it, Charsets.UTF_8) }
        val body = value.substringAfter(",")
        val bytes = body.length * 3 / 4 - body.takeLast(2).count { it == '=' }
        val size = if (bytes >= 1024) "${bytes / 1024} KB" else "$bytes B"
        return "${name ?: head.removePrefix("data:").substringBefore(';').ifBlank { "File" }} ($size)"
    }

    /** A picked file as the data URI the web's fileUpload stores (`data:<mime>;name=<file>;base64,…`). */
    fun dataUri(name: String, bytes: ByteArray): String {
        val mime = java.net.URLConnection.guessContentTypeFromName(name) ?: "application/octet-stream"
        val encodedName = java.net.URLEncoder.encode(name, Charsets.UTF_8).replace("+", "%20")
        return "data:$mime;name=$encodedName;base64," + java.util.Base64.getEncoder().encodeToString(bytes)
    }

    /** The `accept` attribute (`.pdf,.txt`) as extensions without dots. */
    fun acceptedExtensions(metadata: JsonNode): List<String> =
        metadata.path("attributes").firstOrNull { it.text("key") == "accept" }?.text("value").orEmpty()
            .split(',').map { it.trim().removePrefix(".") }.filter { it.isNotBlank() && !it.contains('/') }

    /** A time value as a LocalTime ("09:30", "09:30:00", a date-time's time part); null when unreadable. */
    fun time(value: String): LocalTime? = runCatching { LocalTime.parse(value.trim().substringAfter('T')) }.getOrNull()

    /** A date-time value; a bare date reads as its midnight. */
    fun dateTime(value: String): LocalDateTime? = runCatching { LocalDateTime.parse(value.trim()) }.getOrNull()
        ?: runCatching { LocalDate.parse(value.trim()).atStartOfDay() }.getOrNull()

    /** A whole-number double keeps no ".0" in an input ("250.0" → "250"), the web's number field. */
    fun numberInputText(value: String): String {
        val d = value.trim().toDoubleOrNull() ?: return value
        return if (d.isFinite() && d == Math.floor(d) && Math.abs(d) < 1e15 && value.contains('.')) d.toLong().toString() else value
    }
}

/** `fileUpload`: a "Choose file…" button (filtered by `accept`), the chosen file's name, Remove. */
fun fileUploadField(ctx: AppContext, fieldId: String, metadata: JsonNode, value: String, enabled: Boolean, label: String): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false }
    val name = JBLabel(plain(FieldValues.fileSummary(value))).apply { foreground = ToneColors.secondaryText() }
    val choose = JButton("Choose file…").apply { isEnabled = enabled; accessibleName("Choose file for $label") }
    val remove = JButton("Remove").apply { isEnabled = enabled && value.isNotBlank(); accessibleName("Remove file of $label") }
    choose.addActionListener {
        val chooser = javax.swing.JFileChooser()
        val exts = FieldValues.acceptedExtensions(metadata)
        if (exts.isNotEmpty()) chooser.fileFilter = javax.swing.filechooser.FileNameExtensionFilter(exts.joinToString(", ") { ".$it" }, *exts.toTypedArray())
        if (chooser.showOpenDialog(row) != javax.swing.JFileChooser.APPROVE_OPTION) return@addActionListener
        val file = chooser.selectedFile ?: return@addActionListener
        val uri = FieldValues.dataUri(file.name, file.readBytes())
        ctx.putState(fieldId, uri)
        name.text = plain(FieldValues.fileSummary(uri))
        remove.isEnabled = enabled
    }
    remove.addActionListener {
        ctx.putState(fieldId, "")
        name.text = plain(FieldValues.fileSummary(""))
        remove.isEnabled = false
    }
    row.add(choose)
    row.add(remove)
    row.add(name)
    return row
}

/** `listBox`: the options as a visible list (one pick, or several for a collection field). */
fun listBoxField(ctx: AppContext, fieldId: String, options: List<JsonNode>, raw: JsonNode, multiple: Boolean, enabled: Boolean): JComponent {
    val values = options.map { it.text("value") }
    val list = JBList(options.map { it.text("label", it.text("value")) })
    list.cellRenderer = plainItems(list.cellRenderer)
    list.selectionMode = if (multiple) ListSelectionModel.MULTIPLE_INTERVAL_SELECTION else ListSelectionModel.SINGLE_SELECTION
    list.isEnabled = enabled
    val selected = if (raw.isArray) raw.map { it.asText() }.toSet() else setOfNotNull(raw.asText("").takeIf { it.isNotBlank() })
    list.selectedIndices = values.indices.filter { values[it] in selected }.toIntArray()
    list.visibleRowCount = options.size.coerceIn(2, 8)
    list.addListSelectionListener { e ->
        if (e.valueIsAdjusting) return@addListSelectionListener
        if (multiple) ctx.putState(fieldId, list.selectedIndices.map { values[it] })
        else list.selectedIndex.takeIf { it >= 0 }?.let { ctx.putState(fieldId, values[it]) }
    }
    return JBScrollPane(list).apply {
        val h = list.preferredScrollableViewportSize.height + JBUI.scale(4)
        preferredSize = Dimension(JBUI.scale(280), h)
        minimumSize = Dimension(JBUI.scale(120), h)
        maximumSize = Dimension(JBUI.scale(420), h)
    }
}

/** A time picker (hours:minutes spinner); the value travels as ISO "HH:mm". */
fun timeField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    val initial = FieldValues.time(value)
    val spinner = timeSpinner(initial)
    spinner.isEnabled = enabled
    spinner.addChangeListener { ctx.putState(fieldId, spinnerTime(spinner).toString()) }
    return JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply { isOpaque = false; add(spinner) }
}

/** A date-time picker: the date field (with its calendar) beside a time spinner; ISO "yyyy-MM-ddTHH:mm". */
fun dateTimeField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    val initial = FieldValues.dateTime(value)
    var date = initial?.toLocalDate()?.toString().orEmpty()
    val spinner = timeSpinner(initial?.toLocalTime())
    spinner.isEnabled = enabled
    fun commit() {
        if (date.isBlank()) { ctx.putState(fieldId, null); return }
        ctx.putState(fieldId, LocalDateTime.of(LocalDate.parse(date), spinnerTime(spinner)).toString())
    }
    val dateField = DateField(date, enabled) { iso -> date = iso; commit() }
    spinner.addChangeListener { commit() }
    return JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false; add(dateField); add(spinner) }
}

private fun timeSpinner(initial: LocalTime?): JSpinner {
    val cal = java.util.Calendar.getInstance()
    cal.clear()
    cal.set(1970, 0, 1, initial?.hour ?: 0, initial?.minute ?: 0, 0)
    val spinner = JSpinner(SpinnerDateModel(cal.time, null, null, java.util.Calendar.MINUTE))
    spinner.editor = JSpinner.DateEditor(spinner, "HH:mm")
    spinner.accessibleName("Time")
    return spinner
}

private fun spinnerTime(spinner: JSpinner): LocalTime {
    val cal = java.util.Calendar.getInstance()
    cal.time = spinner.value as java.util.Date
    return LocalTime.of(cal.get(java.util.Calendar.HOUR_OF_DAY), cal.get(java.util.Calendar.MINUTE))
}

/**
 * An editable markdown / html / rich-text field: its SOURCE and a Preview, as tabs — the web's
 * mateu-markup-editor. It was a bare text area of raw markup (`<p>Rooms with a <strong>…`).
 */
fun markupEditorField(ctx: AppContext, fieldId: String, value: String, kind: String, enabled: Boolean): JComponent {
    val source = JBTextArea(value, 6, 40)
    source.lineWrap = true
    source.wrapStyleWord = true
    source.isEnabled = enabled
    source.accessibleName(if (kind == "markdown") "Markdown source" else "HTML source")
    source.document.addDocumentListener(object : javax.swing.event.DocumentListener {
        override fun insertUpdate(e: javax.swing.event.DocumentEvent) { ctx.putState(fieldId, source.text) }
        override fun removeUpdate(e: javax.swing.event.DocumentEvent) { ctx.putState(fieldId, source.text) }
        override fun changedUpdate(e: javax.swing.event.DocumentEvent) { ctx.putState(fieldId, source.text) }
    })
    val height = JBUI.scale(140)
    val sourcePane = JBScrollPane(source)
    val previewHost = JPanel(BorderLayout()).apply { isOpaque = false }
    fun refreshPreview() {
        previewHost.removeAll()
        previewHost.add(JBScrollPane(richTextField(source.text, kind)).apply { border = null }, BorderLayout.CENTER)
        previewHost.revalidate()
    }
    refreshPreview()
    val tabs = JBTabbedPane()
    tabs.addTab(if (kind == "markdown") "Markdown" else "Source", sourcePane)
    tabs.addTab("Preview", previewHost)
    tabs.addChangeListener { if (tabs.selectedIndex == 1) refreshPreview() }
    // a field of a few lines: the stacked form freezes heights, so the editor states its own
    return object : JPanel(BorderLayout()) {
        init { isOpaque = false; add(tabs, BorderLayout.CENTER) }
        override fun getPreferredSize() = Dimension(super.getPreferredSize().width, height + tabs.ui.getTabBounds(tabs, 0).height + JBUI.scale(8))
        override fun getMinimumSize() = Dimension(JBUI.scale(160), preferredSize.height)
    }
}

/** `@Help` / a field's description, shown under it in the secondary colour (the web's helper text). */
fun helperText(text: String): JComponent = JBLabel(plain(text)).apply {
    foreground = ToneColors.secondaryText()
    font = JBUI.Fonts.smallFont()
}

/** Puts [placeholder] as the empty text of the text input(s) inside [input] (JBTextField / JBTextArea). */
fun applyPlaceholder(input: JComponent, placeholder: String) {
    if (placeholder.isBlank()) return
    when (input) {
        is com.intellij.ui.components.JBTextField -> input.emptyText.text = placeholder
        is JBTextArea -> input.emptyText.text = placeholder
        else -> input.components.filterIsInstance<JComponent>().forEach { applyPlaceholder(it, placeholder) }
    }
    if (input is javax.swing.JScrollPane) (input.viewport?.view as? JComponent)?.let { applyPlaceholder(it, placeholder) }
}
