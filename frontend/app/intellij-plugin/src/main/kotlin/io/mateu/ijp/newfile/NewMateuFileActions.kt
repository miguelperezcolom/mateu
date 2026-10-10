package io.mateu.ijp.newfile

import com.intellij.ide.fileTemplates.FileTemplateManager
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.actionSystem.LangDataKeys
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VfsUtil
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.PsiManager

private val MATEU_ICON = IconLoader.getIcon("/icons/mateu.svg", MateuNewFileGroup::class.java)

/**
 * New | Mateu — one entry per specs/ui file kind (UI mount, routes, app shell, REST sources, field types, page),
 * plus Route… when the specs folder already has a routes file. Shown wherever the platform's New menu
 * is (project view, ⌘N on a folder).
 */
class MateuNewFileGroup : ActionGroup(), DumbAware {

    init {
        templatePresentation.text = "Mateu"
        templatePresentation.icon = MATEU_ICON
        templatePresentation.isPopupGroup = true
    }

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project != null && e.getData(LangDataKeys.IDE_VIEW) != null
    }

    override fun getChildren(e: AnActionEvent?): Array<AnAction> =
        (MateuNewFiles.catalogue.files.map { NewMateuFileAction(it) } + AddMateuRouteAction(fromNewGroup = true)).toTypedArray()
}

/** The specs/ui folder New | Mateu targets for the folder selected in [e], or null. */
internal fun targetDirOf(e: AnActionEvent): String? {
    val project = e.project ?: return null
    val dir = e.getData(LangDataKeys.IDE_VIEW)?.directories?.firstOrNull()?.virtualFile
        ?: e.getData(CommonDataKeys.VIRTUAL_FILE)?.let { if (it.isDirectory) it else it.parent }
        ?: return null
    return MateuNewFiles.targetDir(dir.path, project.basePath) {
        LocalFileSystem.getInstance().findFileByPath(it)?.isDirectory == true
    }
}

class NewMateuFileAction(private val kind: MateuNewFiles.FileKind) :
    AnAction(kind.label, kind.description, MATEU_ICON), DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        // the project descriptor is one per project: offered only while there is none
        e.presentation.isEnabledAndVisible = !kind.singleton || e.project?.let { !ProjectRenderer.hasDescriptor(it) } ?: false
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val view = e.getData(LangDataKeys.IDE_VIEW) ?: return
        val dir = view.orChooseDirectory ?: return
        val target = MateuNewFiles.targetDir(dir.virtualFile.path, project.basePath) {
            LocalFileSystem.getInstance().findFileByPath(it)?.isDirectory == true
        }
        val ws = SpecsWorkspace.scan(MateuRoutes.specsRoot(target))
        val dialog = NewMateuFileDialog(project, kind, MateuNewFiles.catalogue, target, ws)
        if (!dialog.showAndGet()) return
        val templateName = dialog.pageTemplate?.template ?: kind.template ?: return
        var text = MateuNewFiles.render(
            templateText(project, templateName),
            name = dialog.fileBaseName,
            pageWidthStyle = dialog.pageWidth?.style,
        )
        val fileName = MateuNewFiles.fileNameOf(dialog.fileBaseName)
        // Where the new file sits relative to the specs/ui root — what routes and mounts reference.
        val rel = ws.rel("$target/$fileName") ?: fileName
        when (kind.id) {
            "mount" -> dialog.homeRoute?.let { text = MateuRoutes.setHome(text, it) }
            "routes" -> text = MateuRoutes.withBasePath(text, dialog.basePath)
        }
        var created: VirtualFile? = null
        val error = SpecsWorkspace.write(project, "New Mateu File") {
            created = create(target, fileName, text)
            if (kind.id == "routes") {
                dialog.mount?.let { mount ->
                    val entry = MateuRoutes.relativePath(mount.substringBeforeLast('/', ""), rel)
                    SpecsWorkspace.edit(ws.abs(mount)) { MateuRoutes.registerInMount(it, entry) }
                }
            }
            if (kind.page) {
                dialog.pageRoute?.let { pr ->
                    AddMateuRouteDialog.apply(ws, pr.routesFile, MateuRoutes.NewRoute(pr.route, layout = rel), pr.makeHome)
                }
            }
        }
        error?.let { Messages.showErrorDialog(project, it, "New Mateu File") }
        val file = created ?: return
        FileEditorManager.getInstance(project).openFile(file, true)
        PsiManager.getInstance(project).findFile(file)?.let { view.selectElement(it) }
    }

    /** The user's customised template when they edited it in File and Code Templates, else ours. */
    private fun templateText(project: Project, name: String): String =
        runCatching { FileTemplateManager.getInstance(project).getInternalTemplate(name).text }
            .getOrNull()?.ifBlank { null } ?: MateuNewFiles.bundledTemplateText(name)

    /** Create [fileName] in [dirPath] (inside a write command). */
    private fun create(dirPath: String, fileName: String, text: String): VirtualFile {
        val dir = VfsUtil.createDirectoryIfMissing(dirPath) ?: error("Cannot create $dirPath")
        if (dir.findChild(fileName) != null) error("$fileName already exists in $dirPath")
        val file = dir.createChildData(this, fileName)
        VfsUtil.saveText(file, text)
        return file
    }
}

/**
 * Add Route… — on a `type: Routes` file (project view / editor context menu), or under New | Mateu
 * when the specs folder has a routes file. Appends one entry; optionally makes it the mount's home.
 */
class AddMateuRouteAction(private val fromNewGroup: Boolean = false) :
    AnAction(
        if (fromNewGroup) "Route…" else "Add Mateu Route…",
        "Append a route to a Mateu route registry (type: Routes)",
        MATEU_ICON,
    ),
    DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project != null && context(e) != null
    }

    /** (specs root, preselected routes file relative to it). */
    private fun context(e: AnActionEvent): Pair<String, String?>? {
        if (fromNewGroup) {
            val root = MateuRoutes.specsRoot(targetDirOf(e) ?: return null)
            return if (SpecsWorkspace.scan(root).ofKind(MateuRoutes.SpecKind.ROUTES).isEmpty()) null else root to null
        }
        val file = e.getData(CommonDataKeys.VIRTUAL_FILE) ?: return null
        if (file.isDirectory || (file.extension != "yaml" && file.extension != "yml")) return null
        val text = SpecsWorkspace.textOf(file) ?: return null
        if (MateuRoutes.classify(text) != MateuRoutes.SpecKind.ROUTES) return null
        val root = MateuRoutes.specsRoot(file.parent.path)
        return root to file.path.removePrefix("$root/")
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val (root, routesFile) = context(e) ?: return
        val ws = SpecsWorkspace.scan(root)
        val dialog = AddMateuRouteDialog(project, ws, routesFile)
        if (!dialog.showAndGet()) return
        SpecsWorkspace.write(project, "Add Mateu Route") {
            AddMateuRouteDialog.apply(ws, dialog.routesFile, dialog.newRoute, dialog.makeHome)
        }?.let { Messages.showErrorDialog(project, it, "Add Mateu Route") }
    }
}
