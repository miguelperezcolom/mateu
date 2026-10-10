package io.mateu.ijp.newfile

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.panel
import com.intellij.util.ui.UIUtil
import javax.swing.DefaultComboBoxModel
import javax.swing.JComboBox
import javax.swing.JComponent

/**
 * Name the new file; for a page also pick its TEMPLATE (form, listing, wizard, dashboard and every
 * Redwood-style page template Mateu has) and its page width (defaulted from the template's family).
 */
class NewMateuFileDialog(
    project: Project,
    private val kind: MateuNewFiles.FileKind,
    catalogue: MateuNewFiles.Catalogue,
    private val targetDir: String,
) : DialogWrapper(project) {

    private val nameField = JBTextField(kind.fileName, 24)
    private val templateCombo = JComboBox(DefaultComboBoxModel(catalogue.pageTemplates.toTypedArray()))
    private val widthCombo = JComboBox(DefaultComboBoxModel(catalogue.pageWidths.toTypedArray()))
    private val templateDescription = JBLabel().apply {
        foreground = UIUtil.getContextHelpForeground()
        setCopyable(false)
    }
    private val widths = catalogue.pageWidths

    val fileBaseName: String get() = nameField.text.trim().removeSuffix(".yaml").removeSuffix(".yml")
    val pageTemplate: MateuNewFiles.PageTemplate? get() = if (kind.page) templateCombo.selectedItem as? MateuNewFiles.PageTemplate else null
    val pageWidth: MateuNewFiles.PageWidth? get() = if (kind.page) widthCombo.selectedItem as? MateuNewFiles.PageWidth else null

    init {
        title = "New Mateu ${kind.label.removeSuffix("…")}"
        templateCombo.addActionListener { syncTemplate() }
        syncTemplate()
        init()
    }

    private fun syncTemplate() {
        val t = templateCombo.selectedItem as? MateuNewFiles.PageTemplate ?: return
        templateDescription.text = "<html>${t.description}</html>"
        widths.firstOrNull { it.id == t.pageWidth }?.let { widthCombo.selectedItem = it }
        if (kind.page && (nameField.text.isBlank() || nameField.text == kind.fileName || isTemplateDefault(nameField.text))) {
            nameField.text = t.id.replace(Regex("(?<=[a-z])(?=[A-Z])"), "-").lowercase()
        }
    }

    private fun isTemplateDefault(text: String) =
        (templateCombo.model as DefaultComboBoxModel).let { m ->
            (0 until m.size).any { m.getElementAt(it).id.replace(Regex("(?<=[a-z])(?=[A-Z])"), "-").lowercase() == text }
        }

    override fun createCenterPanel(): JComponent = panel {
        row { comment(kind.description) }
        if (kind.page) {
            row("Template:") { cell(templateCombo).align(AlignX.FILL) }
            row("") { cell(templateDescription).align(AlignX.FILL) }
            row("Page width:") {
                cell(widthCombo).comment("Applied as the root layout's style (fixed / full width / edge to edge).")
            }
        }
        row("File name:") { cell(nameField).align(AlignX.FILL).focused() }
        row { comment("Created in $targetDir") }
    }

    override fun getPreferredFocusedComponent(): JComponent = nameField

    override fun doValidate(): ValidationInfo? {
        val n = fileBaseName
        if (n.isBlank()) return ValidationInfo("Enter a file name", nameField)
        if (!Regex("^[A-Za-z0-9][A-Za-z0-9._-]*$").matches(n)) {
            return ValidationInfo("Use letters, digits, '.', '-' or '_'", nameField)
        }
        val exists = LocalFileSystem.getInstance().findFileByPath("$targetDir/${MateuNewFiles.fileNameOf(n)}") != null
        return if (exists) ValidationInfo("${MateuNewFiles.fileNameOf(n)} already exists there", nameField) else null
    }
}
