package io.mateu.ijp.newfile

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.ComboBox
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.panel
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.newfile.MateuRoutes.SpecKind
import javax.swing.DefaultComboBoxModel
import javax.swing.JComboBox
import javax.swing.JComponent
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

/**
 * Name the new file; for a page also pick its TEMPLATE (form, listing, wizard, dashboard and every
 * Redwood-style page template Mateu has), its page width (defaulted from the template's family) and,
 * when a routes file exists, a route to it. A routes file is registered in a mount; a mount may name
 * its home page route.
 */
class NewMateuFileDialog(
    project: Project,
    private val kind: MateuNewFiles.FileKind,
    catalogue: MateuNewFiles.Catalogue,
    private val targetDir: String,
    private val ws: SpecsWorkspace,
    /**
     * Creates the file(s) from this dialog's choices when OK is pressed; returns what went wrong, or
     * null. Run BEFORE the dialog closes, so a failure is shown inline and nothing typed is lost.
     */
    private val create: (NewMateuFileDialog) -> String? = { null },
) : DialogWrapper(project) {

    /** The page wizard's "add a route" choice. */
    data class PageRoute(val routesFile: String, val route: String, val makeHome: Boolean)

    private val nameField = JBTextField(kind.fileName, 24)

    /** The project's renderer (specs/ui/project.yaml), shown by the mount wizard. */
    private val renderer = ProjectRenderer.rendererOf(project)
    private val templateCombo = JComboBox(DefaultComboBoxModel(catalogue.pageTemplates.toTypedArray()))
    private val widthCombo = JComboBox(DefaultComboBoxModel(catalogue.pageWidths.toTypedArray()))
    private val templateDescription = JBLabel().apply {
        foreground = UIUtil.getContextHelpForeground()
        setCopyable(false)
    }
    private val widths = catalogue.pageWidths

    // UI Mount
    private val homeField = JBTextField(24)

    // Routes File
    private val mounts = ws.ofKind(SpecKind.MOUNT)
    private val mountCombo = ComboBox(
        DefaultComboBoxModel((listOf(Choice("(none)", null)) + mounts.map { Choice(it.path, it.path) }).toTypedArray()),
    ).apply { if (mounts.size == 1) selectedIndex = 1 }
    private val basePathField = JBTextField(24)

    // Page: add a route to an existing routes file
    private val routesFiles = ws.ofKind(SpecKind.ROUTES).map { it.path }
    private val routesCombo = ComboBox(DefaultComboBoxModel(routesFiles.toTypedArray()))
    private val addRouteCheck = JBCheckBox("Add a route to", routesFiles.isNotEmpty())
    private val routeField = JBTextField(24)
    private val homeCheck = JBCheckBox("Make this the home page")
    private val homeHint = JBLabel().apply { foreground = UIUtil.getContextHelpForeground() }
    private var routeEdited = false
    private var syncing = false

    /** A failure the write itself reported, kept inline until the name or the route changes. */
    private val creationProblem = MateuNewFiles.StickyProblem<Pair<String, String?>>()

    val fileBaseName: String get() = nameField.text.trim().removeSuffix(".yaml").removeSuffix(".yml")
    val pageTemplate: MateuNewFiles.PageTemplate? get() = if (kind.page) templateCombo.selectedItem as? MateuNewFiles.PageTemplate else null
    val pageWidth: MateuNewFiles.PageWidth? get() = if (kind.page) widthCombo.selectedItem as? MateuNewFiles.PageWidth else null
    val homeRoute: String? get() = homeField.text.trim().trim('/').ifEmpty { null }
    val mount: String? get() = (mountCombo.selectedItem as? Choice)?.value
    val basePath: String? get() = basePathField.text.trim().ifEmpty { null }
    val pageRoute: PageRoute?
        get() = if (!kind.page || routesFiles.isEmpty() || !addRouteCheck.isSelected) null else PageRoute(
            routesCombo.selectedItem as String,
            routeField.text.trim().trim('/'),
            homeCheck.isEnabled && homeCheck.isSelected,
        )

    init {
        title = "New Mateu ${kind.label.removeSuffix("…")}"
        templateCombo.addActionListener { syncTemplate() }
        nameField.document.addDocumentListener(listener { syncRouteName() })
        routeField.document.addDocumentListener(listener { if (!syncing) routeEdited = true })
        routesCombo.addActionListener { syncHome() }
        addRouteCheck.addActionListener { syncEnabled() }
        syncTemplate()
        syncRouteName()
        syncHome()
        syncEnabled()
        init()
        // Validate as the user types (not only on OK): a clash shows next to its field at once and
        // clears the moment the name changes — the dialog never has to be closed to get past it.
        initValidation()
    }

    /** On the real disk (a file created outside the IDE is not in the VFS yet) or in the VFS. */
    private fun existsOnDisk(path: String): Boolean =
        java.io.File(path).exists() || LocalFileSystem.getInstance().findFileByPath(path) != null

    private fun creationInput() = fileBaseName to pageRoute?.route

    private fun listener(block: () -> Unit) = object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) = block()
        override fun removeUpdate(e: DocumentEvent) = block()
        override fun changedUpdate(e: DocumentEvent) = block()
    }

    private fun syncTemplate() {
        val t = templateCombo.selectedItem as? MateuNewFiles.PageTemplate ?: return
        templateDescription.text = "<html>${t.description}</html>"
        widths.firstOrNull { it.id == t.pageWidth }?.let { widthCombo.selectedItem = it }
        if (kind.page && (nameField.text.isBlank() || nameField.text == kind.fileName || isTemplateDefault(nameField.text))) {
            // a free name: picking a template already used here must not start on an error
            nameField.text = MateuNewFiles.uniqueBaseName(templateDefault(t), targetDir, ::existsOnDisk)
        }
    }

    private fun syncRouteName() {
        if (routeEdited) return
        val rel = ws.rel("$targetDir/${MateuNewFiles.fileNameOf(fileBaseName)}") ?: fileBaseName
        syncing = true
        routeField.text = MateuRoutes.routeNameOf(rel)
        syncing = false
    }

    private fun syncHome() {
        val routes = routesCombo.selectedItem as? String ?: return
        val mountOf = ws.mountListing(routes)
        homeHint.text = if (mountOf == null) {
            "No type: UI mount lists $routes — register it in a mount to set its home page."
        } else {
            "Sets home: in $mountOf. Current home: " + (MateuRoutes.homeOf(ws.text(mountOf).orEmpty()) ?: "(none)")
        }
        syncEnabled()
    }

    private fun syncEnabled() {
        val on = addRouteCheck.isSelected
        routesCombo.isEnabled = on
        routeField.isEnabled = on
        homeCheck.isEnabled = on && (routesCombo.selectedItem as? String)?.let { ws.mountListing(it) } != null
    }

    private fun templateDefault(t: MateuNewFiles.PageTemplate) =
        t.id.replace(Regex("(?<=[a-z])(?=[A-Z])"), "-").lowercase()

    /** The name is one a template proposed (`form`, `form-2`…): changing the template may replace it. */
    private fun isTemplateDefault(text: String) =
        (templateCombo.model as DefaultComboBoxModel).let { m ->
            (0 until m.size).any { Regex("^${Regex.escape(templateDefault(m.getElementAt(it)))}(-\\d+)?$").matches(text) }
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
        when {
            kind.id == "mount" -> {
                row("Home page route:") {
                    cell(homeField).align(AlignX.FILL)
                        .comment("Optional: a route of this mount (relative). Usually empty now — set it later from Add Route….")
                }
                row("Renderer:") {
                    val r = renderer
                    comment("${r.label} — from <code>specs/ui/project.yaml</code> (change it in Settings | Tools | Mateu). " +
                        "To serve this mount, the app depends on <code>${r.coordinates}</code>.")
                }
            }
            kind.id == "routes" -> {
                row("Mount:") {
                    cell(mountCombo).align(AlignX.FILL)
                        .comment(if (mounts.isEmpty()) "No type: UI mount found in ${ws.root}." else "The new file is appended to this mount's <code>routes:</code> list.")
                }
                row("Base path:") {
                    cell(basePathField).align(AlignX.FILL)
                        .comment("Optional, ONLY for a class-declared <code>@UI(\"/shop\")</code> mount: its base path. Leave empty for a type: UI mount.")
                }
            }
            kind.page && routesFiles.isNotEmpty() -> {
                row {
                    cell(addRouteCheck)
                    cell(routesCombo)
                }
                row("Route:") { cell(routeField).align(AlignX.FILL).comment("Relative to the mount.") }
                row { cell(homeCheck) }
                row { cell(homeHint).align(AlignX.FILL) }
            }
        }
        row { comment("Created in $targetDir") }
    }

    override fun getPreferredFocusedComponent(): JComponent = nameField

    override fun doValidate(): ValidationInfo? {
        MateuNewFiles.fileNameProblem(nameField.text, targetDir, ::existsOnDisk)?.let { return ValidationInfo(it, nameField) }
        pageRoute?.let { pr ->
            MateuRoutes.routeProblem(pr.route, pr.routesFile, ws.text(pr.routesFile).orEmpty())
                ?.let { return ValidationInfo(it, routeField) }
        }
        creationProblem.currentFor(creationInput())?.let { return ValidationInfo(it, nameField) }
        return null
    }

    /** Create first, close after: a failed write keeps the dialog open with the error inline. */
    override fun doOKAction() {
        if (!okAction.isEnabled) return
        val problem = create(this)
        if (problem != null) {
            creationProblem.remember(creationInput(), problem)
            setErrorText(problem, nameField)
            return
        }
        super.doOKAction()
    }
}
