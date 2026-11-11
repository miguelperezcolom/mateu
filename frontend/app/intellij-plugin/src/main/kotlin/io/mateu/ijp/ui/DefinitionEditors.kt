package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.node.ObjectNode
import com.intellij.openapi.ui.ComboBox
import com.intellij.ui.IdeBorderFactory
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextArea
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.FormBuilder
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.FocusAdapter
import java.awt.event.FocusEvent
import javax.swing.DefaultComboBoxModel
import javax.swing.DefaultListModel
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JSpinner
import javax.swing.ListSelectionModel
import javax.swing.SpinnerNumberModel

/**
 * The editable `Workflow` and `FormEditor` on the desktop — the web's mateu-workflow and
 * mateu-form-editor, laid out as a list + a properties form instead of a canvas: Settings (the
 * definition's own properties), Add, and for the selected step / field the same properties the web's
 * panel edits. Every edit writes the definition's JSON into the component state under the
 * component's id (what the web's `value-changed` carries), through [AppContext.putState]. The
 * operations themselves are pure: [DefinitionModels].
 */

/** A text field committing on Enter and when it loses the focus (the web's `change`). */
private fun committingText(initial: String, name: String, onCommit: (String) -> Unit): JBTextField =
    JBTextField(initial).apply {
        accessibleName(name)
        var last = initial
        val commit = { if (text != last) { last = text; onCommit(text) } }
        addActionListener { commit() }
        addFocusListener(object : FocusAdapter() { override fun focusLost(e: FocusEvent) = commit() })
    }

private fun committingArea(initial: String, name: String, onCommit: (String) -> Unit): JComponent {
    val area = JBTextArea(initial, 2, 24).apply { lineWrap = true; wrapStyleWord = true; accessibleName(name) }
    var last = initial
    area.addFocusListener(object : FocusAdapter() {
        override fun focusLost(e: FocusEvent) { if (area.text != last) { last = area.text; onCommit(area.text) } }
    })
    return JBScrollPane(area)
}

private fun choice(options: List<String>, selected: String?, name: String, onPick: (String) -> Unit): ComboBox<String> =
    ComboBox(DefaultComboBoxModel(options.toTypedArray())).apply {
        accessibleName(name)
        selectedItem = selected?.takeIf { it in options } ?: options.firstOrNull()
        addActionListener { (selectedItem as? String)?.let(onPick) }
    }

private fun checkbox(label: String, checked: Boolean, onToggle: (Boolean) -> Unit): JBCheckBox =
    JBCheckBox(plain(label), checked).apply { addActionListener { onToggle(isSelected) } }

private fun numberSpinner(value: Int, name: String, onChange: (Int) -> Unit): JSpinner =
    JSpinner(SpinnerNumberModel(value.coerceAtLeast(0), 0, Int.MAX_VALUE, 1)).apply {
        accessibleName(name)
        addChangeListener { onChange((this.value as Number).toInt()) }
    }

/** A reference to another item: "— none —" (null) or one of [others] (id to label). */
private fun reference(others: List<Pair<String, String>>, selected: String?, name: String, onPick: (String?) -> Unit): ComboBox<String> {
    val labels = listOf("— none —") + others.map { it.second }
    return ComboBox(DefaultComboBoxModel(labels.toTypedArray())).apply {
        accessibleName(name)
        val i = others.indexOfFirst { it.first == selected }
        selectedIndex = if (i >= 0) i + 1 else 0
        addActionListener { onPick(if (selectedIndex <= 0) null else others[selectedIndex - 1].first) }
    }
}

private fun toolbarRow(vararg items: JComponent): JPanel =
    JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false; items.forEach { add(it) } }

/** Holds the definition being edited and repaints the parts an edit changes. */
private class DefinitionEditor(
    private val ctx: AppContext,
    private val stateKey: String,
    var def: ObjectNode,
) {
    var onChanged: (() -> Unit)? = null

    fun commit(next: ObjectNode, repaint: Boolean = true) {
        def = next
        if (stateKey.isNotBlank()) ctx.putState(stateKey, DefinitionModels.serialize(next))
        if (repaint) onChanged?.invoke()
    }
}

// ── workflow ─────────────────────────────────────────────────────────────────────────────────

fun renderWorkflowEditor(ctx: AppContext, componentId: String, value: String): JComponent {
    val editor = DefinitionEditor(ctx, componentId, DefinitionModels.parseWorkflow(value))
    var selected: String? = null
    var showSettings = false

    val root = JPanel(BorderLayout(0, JBUI.scale(6)))
    root.border = IdeBorderFactory.createTitledBorder("Workflow", false)
    root.accessibleName("Workflow")

    val header = JBLabel().apply { font = font.deriveFont(Font.BOLD) }
    val settingsButton = JButton("Settings")
    val addButton = JButton("Add step")
    val north = verticalPanel(4)
    val settingsHolder = JPanel(BorderLayout()).apply { isOpaque = false }
    north.addStacked(toolbarRow(header, settingsButton, addButton), 0)
    north.addStacked(settingsHolder, 0)

    val listModel = DefaultListModel<String>()
    val list = JBList(listModel).apply {
        selectionMode = ListSelectionModel.SINGLE_SELECTION
        emptyText.text = "No steps yet. Click Add step to start."
        accessibleName("Steps")
    }
    val propsHolder = JPanel(BorderLayout()).apply { isOpaque = false }

    var refreshing = false
    fun settingsPanel(): JComponent {
        val d = editor.def
        val limit = d.path("limitConcurrentExecutions").asBoolean(false)
        val form = FormBuilder.createFormBuilder()
            .addLabeledComponent("Name", committingText(d.path("name").asText(""), "Name") { editor.commit(DefinitionModels.setWorkflow(editor.def, "name", it)) })
            .addLabeledComponent("Description", committingArea(d.path("description").asText(""), "Description") { editor.commit(DefinitionModels.setWorkflow(editor.def, "description", it), repaint = false) })
            .addLabeledComponent("Status", choice(DefinitionModels.WORKFLOW_STATUSES, d.path("status").asText("DRAFT"), "Status") { editor.commit(DefinitionModels.setWorkflow(editor.def, "status", it)) })
            .addComponent(checkbox("Limit concurrent executions", limit) { editor.commit(DefinitionModels.setWorkflow(editor.def, "limitConcurrentExecutions", it)) })
        if (limit) {
            form.addLabeledComponent("Max concurrent", numberSpinner(d.path("maxConcurrentExecutions").asInt(0), "Max concurrent") {
                editor.commit(DefinitionModels.setWorkflow(editor.def, "maxConcurrentExecutions", it), repaint = false)
            })
            form.addComponent(checkbox("Enqueue on limit", d.path("enqueueOnLimit").asBoolean(false)) {
                editor.commit(DefinitionModels.setWorkflow(editor.def, "enqueueOnLimit", it), repaint = false)
            })
        }
        return form.panel.apply { border = JBUI.Borders.empty(4) }
    }

    fun stepPanel(id: String): JComponent? {
        val step = DefinitionModels.steps(editor.def).firstOrNull { it.path("id").asText() == id } ?: return null
        val others = DefinitionModels.steps(editor.def).filter { it.path("id").asText() != id }
            .map { it.path("id").asText() to "${it.path("name").asText("")} (${it.path("id").asText()})" }
        fun set(key: String, v: Any?, repaint: Boolean = true) = editor.commit(DefinitionModels.updateStep(editor.def, id, key, v), repaint)
        fun text(key: String) = step.path(key).asText("")
        val type = step.path("type").asText("ACTION")
        val rollbackable = step.path("rollbackable").asBoolean(false)
        val form = FormBuilder.createFormBuilder()
            .addLabeledComponent("ID", JBTextField(id).apply { isEditable = false; accessibleName("ID") })
            .addLabeledComponent("Name", committingText(text("name"), "Name") { set("name", it) })
            .addLabeledComponent("Type", choice(DefinitionModels.STEP_TYPES, type, "Type") { set("type", it) })
            .addLabeledComponent("Description", committingArea(text("description"), "Description") { set("description", it, false) })
            .addLabeledComponent("Precondition step", reference(others, step.path("preconditionStepId").asText(null), "Precondition step") { set("preconditionStepId", it) })
            .addLabeledComponent("Precondition expression", committingText(text("preconditionExpression"), "Precondition expression") { set("preconditionExpression", it.ifBlank { null }, false) })
            .addComponent(checkbox("Parallel", step.path("parallel").asBoolean(false)) { set("parallel", it, false) })
            .addLabeledComponent("Timeout (ms)", numberSpinner(step.path("timeout").asInt(0), "Timeout (ms)") { set("timeout", it, false) })
            .addLabeledComponent("Retries", numberSpinner(step.path("retries").asInt(0), "Retries") { set("retries", it, false) })
            .addComponent(checkbox("Rollbackable", rollbackable) { set("rollbackable", it) })
        if (rollbackable) form.addLabeledComponent("Compensation step",
            reference(others, step.path("compensationStepId").asText(null), "Compensation step") { set("compensationStepId", it, false) })
        when (type) {
            "ACTION" -> form.addLabeledComponent("Topic", committingText(text("topic"), "Topic") { set("topic", it.ifBlank { null }, false) })
            "USER_TASK" -> form.addLabeledComponent("Form ID", committingText(text("formId"), "Form ID") { set("formId", it.ifBlank { null }, false) })
            "PROCESS" -> form.addLabeledComponent("Child workflow ID", committingText(text("childWorkflowDefinitionId"), "Child workflow ID") { set("childWorkflowDefinitionId", it.ifBlank { null }, false) })
        }
        val delete = JButton("Delete step").apply {
            addActionListener { selected = null; editor.commit(DefinitionModels.deleteStep(editor.def, id)) }
        }
        val panel = verticalPanel(4)
        panel.border = IdeBorderFactory.createTitledBorder("Step properties", false)
        panel.addStacked(form.panel, 0)
        panel.addStacked(toolbarRow(delete), 0)
        return panel
    }

    fun refresh() {
        refreshing = true
        val d = editor.def
        header.text = plain("${d.path("name").asText("")} · ${d.path("status").asText("DRAFT")}")
        val steps = DefinitionModels.steps(d)
        listModel.clear()
        steps.forEach { s ->
            val pre = s.path("preconditionStepId").asText("")
            listModel.addElement(plain("${s.path("type").asText("")} — ${s.path("name").asText("")} (${s.path("id").asText()})" +
                if (pre.isNotBlank()) "  ← $pre" else ""))
        }
        val index = steps.indexOfFirst { it.path("id").asText() == selected }
        if (index < 0) selected = null
        list.selectedIndex = index
        settingsHolder.removeAll()
        if (showSettings) settingsHolder.add(settingsPanel())
        propsHolder.removeAll()
        selected?.let { stepPanel(it) }?.let { propsHolder.add(it) }
        root.revalidate(); root.repaint()
        refreshing = false
    }

    editor.onChanged = ::refresh
    settingsButton.addActionListener { showSettings = !showSettings; refresh() }
    addButton.addActionListener {
        val id = DefinitionModels.newId("step")
        selected = id
        editor.commit(DefinitionModels.addStep(editor.def, id))
    }
    list.addListSelectionListener { e ->
        if (refreshing || e.valueIsAdjusting) return@addListSelectionListener
        selected = DefinitionModels.steps(editor.def).getOrNull(list.selectedIndex)?.path("id")?.asText()
        refresh()
    }

    root.add(north, BorderLayout.NORTH)
    root.add(JBScrollPane(list).apply { preferredSize = JBUI.size(320, 140) }, BorderLayout.CENTER)
    root.add(propsHolder, BorderLayout.SOUTH)
    refresh()
    return root
}

// ── form definition ──────────────────────────────────────────────────────────────────────────

fun renderFormDefinitionEditor(ctx: AppContext, componentId: String, value: String): JComponent {
    val editor = DefinitionEditor(ctx, componentId, DefinitionModels.parseForm(value))
    var selected: String? = null
    var showSettings = false

    val root = JPanel(BorderLayout(0, JBUI.scale(6)))
    root.border = IdeBorderFactory.createTitledBorder("Form definition", false)
    root.accessibleName("Form definition")

    val header = JBLabel().apply { font = font.deriveFont(Font.BOLD) }
    val settingsButton = JButton("Settings")
    val addButton = JButton("Add field")
    val up = JButton("Move up")
    val down = JButton("Move down")
    val duplicate = JButton("Duplicate")
    val delete = JButton("Delete")
    val north = verticalPanel(4)
    val settingsHolder = JPanel(BorderLayout()).apply { isOpaque = false }
    north.addStacked(toolbarRow(header, settingsButton, addButton), 0)
    north.addStacked(settingsHolder, 0)

    val listModel = DefaultListModel<String>()
    val list = JBList(listModel).apply {
        selectionMode = ListSelectionModel.SINGLE_SELECTION
        emptyText.text = "No fields yet. Click Add field to start."
        accessibleName("Fields")
    }
    val propsHolder = JPanel(BorderLayout()).apply { isOpaque = false }
    var refreshing = false

    fun fieldPanel(id: String): JComponent? {
        val f = DefinitionModels.fields(editor.def).firstOrNull { it.path("id").asText() == id } ?: return null
        fun set(key: String, v: Any?, repaint: Boolean = true) = editor.commit(DefinitionModels.updateField(editor.def, id, key, v), repaint)
        val form = FormBuilder.createFormBuilder()
            .addLabeledComponent("ID", JBTextField(id).apply { isEditable = false; accessibleName("ID") })
            .addLabeledComponent("Label", committingText(f.path("label").asText(""), "Label") { set("label", it) })
            .addLabeledComponent("Data type", choice(DefinitionModels.DATA_TYPES, f.path("dataType").asText("string"), "Data type") { set("dataType", it) })
            .addLabeledComponent("Stereotype", choice(DefinitionModels.STEREOTYPES, f.path("stereotype").asText("regular"), "Stereotype") { set("stereotype", it) })
            .addComponent(checkbox("Required", f.path("required").asBoolean(false)) { set("required", it) })
            .addLabeledComponent("Description / hint", committingArea(f.path("description").asText(""), "Description / hint") { set("description", it.ifBlank { null }, false) })
        val panel = verticalPanel(4)
        panel.border = IdeBorderFactory.createTitledBorder("Field properties", false)
        panel.addStacked(toolbarRow(up, down, duplicate, delete), 0)
        panel.addStacked(form.panel, 0)
        return panel
    }

    fun refresh() {
        refreshing = true
        val d = editor.def
        header.text = plain(d.path("name").asText(""))
        val fields = DefinitionModels.fields(d)
        listModel.clear()
        fields.forEach { f ->
            val stereotype = f.path("stereotype").asText("")
            listModel.addElement(plain("${f.path("dataType").asText("")} — ${f.path("label").asText("")} (${f.path("id").asText()})" +
                (if (f.path("required").asBoolean(false)) " · required" else "") +
                (if (stereotype.isNotBlank() && stereotype != "regular") " · $stereotype" else "")))
        }
        val index = fields.indexOfFirst { it.path("id").asText() == selected }
        if (index < 0) selected = null
        list.selectedIndex = index
        up.isEnabled = index > 0
        down.isEnabled = index in 0 until fields.size - 1
        settingsHolder.removeAll()
        if (showSettings) settingsHolder.add(FormBuilder.createFormBuilder()
            .addLabeledComponent("Name", committingText(d.path("name").asText(""), "Name") { editor.commit(DefinitionModels.setForm(editor.def, "name", it)) })
            .addLabeledComponent("Description", committingArea(d.path("description").asText(""), "Description") { editor.commit(DefinitionModels.setForm(editor.def, "description", it), repaint = false) })
            .panel.apply { border = JBUI.Borders.empty(4) })
        propsHolder.removeAll()
        selected?.let { fieldPanel(it) }?.let { propsHolder.add(it) }
        root.revalidate(); root.repaint()
        refreshing = false
    }

    editor.onChanged = ::refresh
    settingsButton.addActionListener { showSettings = !showSettings; refresh() }
    addButton.addActionListener {
        val id = DefinitionModels.newId("field")
        selected = id
        editor.commit(DefinitionModels.addField(editor.def, id))
    }
    up.addActionListener { selected?.let { editor.commit(DefinitionModels.moveField(editor.def, it, -1)) } }
    down.addActionListener { selected?.let { editor.commit(DefinitionModels.moveField(editor.def, it, 1)) } }
    duplicate.addActionListener {
        selected?.let { id ->
            val copy = DefinitionModels.newId("field")
            selected = copy
            editor.commit(DefinitionModels.duplicateField(editor.def, id, copy))
        }
    }
    delete.addActionListener { selected?.let { id -> selected = null; editor.commit(DefinitionModels.deleteField(editor.def, id)) } }
    list.addListSelectionListener { e ->
        if (refreshing || e.valueIsAdjusting) return@addListSelectionListener
        selected = DefinitionModels.fields(editor.def).getOrNull(list.selectedIndex)?.path("id")?.asText()
        refresh()
    }

    root.add(north, BorderLayout.NORTH)
    root.add(JBScrollPane(list).apply { preferredSize = JBUI.size(320, 140) }, BorderLayout.CENTER)
    root.add(propsHolder, BorderLayout.SOUTH)
    refresh()
    return root
}
