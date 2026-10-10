package io.mateu.ijp.newfile

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.ComboBox
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.panel
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.newfile.MateuRoutes.SpecKind
import javax.swing.DefaultComboBoxModel
import javax.swing.JComponent
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

/** A combo entry: a label and its value (null = "none"). */
data class Choice(val label: String, val value: String?) {
    override fun toString() = label
}

/**
 * Add Route…: append ONE entry to a `type: Routes` file — route (relative to the mount, "" = its
 * root), the layout it renders (a discovered page or app shell), an optional view model and an
 * optional parent route — and optionally make it the mount's home page.
 */
class AddMateuRouteDialog(
    project: Project,
    private val ws: SpecsWorkspace,
    routesFile: String?,
) : DialogWrapper(project) {

    private val routesFiles = ws.ofKind(SpecKind.ROUTES).map { it.path }
    private val routesCombo = ComboBox(DefaultComboBoxModel(routesFiles.toTypedArray()))
    private val routeField = JBTextField(24)
    private val layoutCombo = ComboBox(
        DefaultComboBoxModel(
            (listOf(Choice("(none — the view model supplies its own tree)", null)) +
                ws.ofKind(SpecKind.PAGE, SpecKind.APP_SHELL).map {
                    Choice(if (it.kind == SpecKind.APP_SHELL) "${it.path}  (app shell)" else it.path, it.path)
                }).toTypedArray(),
        ),
    )
    private val viewModelField = JBTextField(24)
    private val parentCombo = ComboBox<Choice>()
    private val homeCheck = JBCheckBox("Make this the home page")
    private val homeHint = JBLabel().apply { foreground = UIUtil.getContextHelpForeground() }
    private var routeEdited = false

    val routesFile: String get() = routesCombo.selectedItem as String
    val newRoute: MateuRoutes.NewRoute
        get() = MateuRoutes.NewRoute(
            route = routeField.text.trim().trim('/'),
            layout = (layoutCombo.selectedItem as? Choice)?.value,
            viewModel = viewModelField.text.trim().ifEmpty { null },
            parent = (parentCombo.selectedItem as? Choice)?.value,
        )
    val makeHome: Boolean get() = homeCheck.isEnabled && homeCheck.isSelected

    init {
        title = "Add Mateu Route"
        routesFile?.let { routesCombo.selectedItem = it }
        routesCombo.addActionListener { syncRoutesFile() }
        layoutCombo.addActionListener { syncRouteName() }
        parentCombo.addActionListener { syncRouteName() }
        routeField.document.addDocumentListener(object : DocumentListener {
            override fun insertUpdate(e: DocumentEvent) = edited()
            override fun removeUpdate(e: DocumentEvent) = edited()
            override fun changedUpdate(e: DocumentEvent) = edited()
        })
        syncRoutesFile()
        syncRouteName()
        init()
    }

    private var syncing = false
    private fun edited() { if (!syncing) routeEdited = true }

    private fun syncRoutesFile() {
        val text = ws.text(routesFile).orEmpty()
        parentCombo.model = DefaultComboBoxModel(
            (listOf(Choice("(none — a top-level route)", null)) +
                MateuRoutes.existingRoutes(text).filter { it.isNotEmpty() }.map { Choice(it, it) }).toTypedArray(),
        )
        val mount = ws.mountListing(routesFile)
        homeCheck.isEnabled = mount != null
        if (mount == null) homeCheck.isSelected = false
        homeHint.text = if (mount == null) {
            "No type: UI mount lists $routesFile — register it in a mount to set its home page."
        } else {
            "Sets home: in $mount. Current home: " + (MateuRoutes.homeOf(ws.text(mount).orEmpty()) ?: "(none)")
        }
    }

    private fun syncRouteName() {
        if (routeEdited) return
        val layout = (layoutCombo.selectedItem as? Choice)?.value
        val kindOf = ws.files.firstOrNull { it.path == layout }?.kind
        val base = when {
            layout == null -> ""
            kindOf == SpecKind.APP_SHELL -> ""
            else -> MateuRoutes.routeNameOf(layout)
        }
        val parent = (parentCombo.selectedItem as? Choice)?.value
        syncing = true
        routeField.text = if (parent != null) "$parent/${base.substringAfterLast('/')}" else base
        syncing = false
    }

    override fun createCenterPanel(): JComponent = panel {
        row { comment("Appends one entry to the route registry with a minimal edit — the rest of the file is untouched.") }
        row("Routes file:") { cell(routesCombo).align(AlignX.FILL) }
        row("Layout:") {
            cell(layoutCombo).align(AlignX.FILL)
                .comment("The definition the route renders (key <code>layout:</code>, relative to specs/ui).")
        }
        row("Route:") {
            cell(routeField).align(AlignX.FILL).focused()
                .comment("Relative to the mount; empty = the mount root (typically the app shell). <code>:name</code> segments are path parameters.")
        }
        row("View model:") {
            cell(viewModelField).align(AlignX.FILL)
                .comment("Optional fully qualified class; empty = a definition-only route (valid, e.g. statically served).")
        }
        row("Parent route:") {
            cell(parentCombo).align(AlignX.FILL)
                .comment("Optional: the route renders in that screen's slot (emits <code>parent:</code>; the route stays absolute).")
        }
        row { cell(homeCheck) }
        row { cell(homeHint).align(AlignX.FILL) }
    }

    override fun getPreferredFocusedComponent(): JComponent = routeField

    override fun doValidate(): ValidationInfo? {
        if (routesFiles.isEmpty()) return ValidationInfo("There is no type: Routes file in ${ws.root}", routesCombo)
        val r = routeField.text.trim().trim('/')
        if (r.contains(Regex("\\s"))) return ValidationInfo("A route cannot contain spaces", routeField)
        if (r in MateuRoutes.existingRoutes(ws.text(routesFile).orEmpty())) {
            return ValidationInfo("Route \"$r\" is already declared in $routesFile", routeField)
        }
        if ((layoutCombo.selectedItem as? Choice)?.value == null && viewModelField.text.isBlank()) {
            return ValidationInfo("Pick a layout or enter a view model", layoutCombo)
        }
        return null
    }

    companion object {
        /**
         * Append [route] to [routesRel] and, when [makeHome], set it as the home of the mount that lists
         * that routes file. Throws on failure. Must run inside a write command (see [SpecsWorkspace.write]).
         */
        fun apply(ws: SpecsWorkspace, routesRel: String, route: MateuRoutes.NewRoute, makeHome: Boolean) {
            SpecsWorkspace.edit(ws.abs(routesRel)) { MateuRoutes.appendRoute(it, route) }
            if (makeHome) {
                val mount = ws.mountListing(routesRel) ?: error("No mount lists $routesRel")
                SpecsWorkspace.edit(ws.abs(mount)) { MateuRoutes.setHome(it, route.route) }
            }
        }
    }
}
