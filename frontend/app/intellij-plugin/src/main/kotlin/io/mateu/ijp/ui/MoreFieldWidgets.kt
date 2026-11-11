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

/**
 * `fileUpload`: a "Choose file…" button (filtered by `accept`), the chosen files, Remove. With an
 * `uploadTicket` (the app registered a storage port) the file is STREAMED to the server — or to the
 * store's pre-signed target — in a cancellable background task with progress, and the value becomes
 * the `mateu-file:` reference the server answers (design/uploads/file-uploads-contract.md); without
 * one it is read into a data URI, as before, up to `maxBytes` (10 MB when undeclared). `multiple`
 * keeps a list. A stored file shows its name and size, linked when its url is http(s).
 */
fun fileUploadField(ctx: AppContext, fieldId: String, metadata: JsonNode, raw: JsonNode, enabled: Boolean, label: String): JComponent {
    val config = FileUploads.configOf(metadata)
    var entries = FileUploads.valuesOf(raw)
    val panel = JPanel().apply {
        layout = javax.swing.BoxLayout(this, javax.swing.BoxLayout.Y_AXIS)
        isOpaque = false
    }
    val files = JPanel().apply {
        layout = javax.swing.BoxLayout(this, javax.swing.BoxLayout.Y_AXIS)
        isOpaque = false
        alignmentX = java.awt.Component.LEFT_ALIGNMENT
    }
    val status = JBLabel().apply { isVisible = false; alignmentX = java.awt.Component.LEFT_ALIGNMENT }
    val progress = javax.swing.JProgressBar(0, 100).apply { isVisible = false; isStringPainted = true }
    val cancel = JButton("Cancel").apply { isVisible = false; accessibleName("Cancel the upload of $label") }
    val choose = JButton(if (config.multiple) "Add file…" else "Choose file…").apply { isEnabled = enabled; accessibleName("Choose file for $label") }
    val cancelled = java.util.concurrent.atomic.AtomicBoolean(false)

    fun commit(value: Any) {
        ctx.putState(fieldId, value)
        @Suppress("UNCHECKED_CAST")
        entries = if (value is List<*>) value as List<String> else listOfNotNull((value as String).takeIf { it.isNotEmpty() })
    }

    fun showError(message: String?) {
        status.text = message?.let { plain(it) } ?: ""
        status.foreground = com.intellij.ui.JBColor.RED
        status.isVisible = message != null
    }

    lateinit var redraw: () -> Unit
    redraw = {
        files.removeAll()
        if (entries.isEmpty()) files.add(JBLabel(plain("No file chosen")).apply { foreground = ToneColors.secondaryText() })
        entries.forEachIndexed { i, entry ->
            val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false; alignmentX = java.awt.Component.LEFT_ALIGNMENT }
            val ref = FileUploads.parse(entry)
            val text = ref?.let { FileUploads.label(it) } ?: FieldValues.fileSummary(entry)
            if (ref != null && FileUploads.isHttpUrl(ref.url)) {
                row.add(com.intellij.ui.components.ActionLink(plain(text)) {
                    SafeHtml.browse(ref.url)
                }.accessibleName("Open $text"))
            } else {
                row.add(JBLabel(plain(text)).apply { foreground = ToneColors.secondaryText() })
            }
            if (enabled) row.add(JButton("Remove").apply {
                accessibleName("Remove $text")
                addActionListener {
                    showError(null)
                    commit(FileUploads.withoutFile(entries, i, config.multiple))
                    redraw()
                }
            })
            files.add(row)
        }
        choose.text = if (config.multiple || entries.isEmpty()) (if (config.multiple) "Add file…" else "Choose file…") else "Replace…"
        files.revalidate()
        files.repaint()
    }

    fun uploadAll(picked: List<java.io.File>) {
        val uploader = FileUploader(ctx.apiClient.baseUrl, { url -> ctx.apiClient.credentialHeaders(url) })
        cancelled.set(false)
        choose.isEnabled = false
        progress.value = 0
        progress.isVisible = true
        cancel.isVisible = true
        val task = object : com.intellij.openapi.progress.Task.Backgroundable(null, "Uploading ${picked.first().name}", true) {
            override fun run(indicator: com.intellij.openapi.progress.ProgressIndicator) {
                indicator.isIndeterminate = false
                for (file in picked) {
                    indicator.text = "Uploading ${file.name}"
                    try {
                        val value = uploader.upload(config, file.toPath(), file.name, FileUploads.contentTypeOf(file.name), file.length(),
                            onProgress = { f ->
                                indicator.fraction = f
                                javax.swing.SwingUtilities.invokeLater { progress.value = (f * 100).toInt() }
                            },
                            cancelled = { cancelled.get() || indicator.isCanceled })
                        javax.swing.SwingUtilities.invokeLater { commit(FileUploads.withFile(entries, value, config.multiple)); redraw() }
                    } catch (e: UploadCancelledException) {
                        break
                    } catch (e: UploadException) {
                        javax.swing.SwingUtilities.invokeLater { showError(e.message) }
                        break
                    }
                }
            }

            override fun onFinished() {
                progress.isVisible = false
                cancel.isVisible = false
                choose.isEnabled = enabled
            }
        }
        com.intellij.openapi.progress.ProgressManager.getInstance().run(task)
    }

    cancel.addActionListener { cancelled.set(true) }
    choose.addActionListener {
        val chooser = javax.swing.JFileChooser()
        chooser.isMultiSelectionEnabled = config.multiple
        val exts = FieldValues.acceptedExtensions(metadata)
        if (exts.isNotEmpty()) chooser.fileFilter = javax.swing.filechooser.FileNameExtensionFilter(exts.joinToString(", ") { ".$it" }, *exts.toTypedArray())
        if (chooser.showOpenDialog(panel) != javax.swing.JFileChooser.APPROVE_OPTION) return@addActionListener
        val picked = (if (config.multiple) chooser.selectedFiles.toList() else listOfNotNull(chooser.selectedFile)).filter { it.isFile }
        if (picked.isEmpty()) return@addActionListener
        showError(null)
        if (config.uploadMode) {
            uploadAll(picked)
            return@addActionListener
        }
        // no storage port: a data URI, refused over the limit
        val max = config.fallbackMaxBytes
        for (file in picked) {
            if (file.length() > max) {
                showError(FileUploads.tooLargeMessage(max))
                continue
            }
            commit(FileUploads.withFile(entries, FieldValues.dataUri(file.name, file.readBytes()), config.multiple))
        }
        redraw()
    }

    redraw()
    val buttons = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false; alignmentX = java.awt.Component.LEFT_ALIGNMENT }
    if (enabled) buttons.add(choose)
    buttons.add(progress)
    buttons.add(cancel)
    panel.add(files)
    panel.add(buttons)
    panel.add(status)
    return panel
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
