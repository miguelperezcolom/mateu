package io.mateu.ijp.newfile

import com.intellij.ide.fileTemplates.FileTemplateManager
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.LangDataKeys
import com.intellij.openapi.command.WriteCommandAction
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
 * New | Mateu — one entry per specs/ui file kind (UI mount, routes, app shell, REST sources, page).
 * Shown wherever the platform's New menu is (project view, ⌘N on a folder).
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
        MateuNewFiles.catalogue.files.map { NewMateuFileAction(it) }.toTypedArray()
}

class NewMateuFileAction(private val kind: MateuNewFiles.FileKind) :
    AnAction(kind.label, kind.description, MATEU_ICON), DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val view = e.getData(LangDataKeys.IDE_VIEW) ?: return
        val dir = view.orChooseDirectory ?: return
        val target = MateuNewFiles.targetDir(dir.virtualFile.path, project.basePath) {
            LocalFileSystem.getInstance().findFileByPath(it)?.isDirectory == true
        }
        val dialog = NewMateuFileDialog(project, kind, MateuNewFiles.catalogue, target)
        if (!dialog.showAndGet()) return
        val templateName = dialog.pageTemplate?.template ?: kind.template ?: return
        val text = MateuNewFiles.render(
            templateText(project, templateName),
            name = dialog.fileBaseName,
            pageWidthStyle = dialog.pageWidth?.style,
        )
        val created = create(project, target, MateuNewFiles.fileNameOf(dialog.fileBaseName), text) ?: return
        FileEditorManager.getInstance(project).openFile(created, true)
        PsiManager.getInstance(project).findFile(created)?.let { view.selectElement(it) }
    }

    /** The user's customised template when they edited it in File and Code Templates, else ours. */
    private fun templateText(project: Project, name: String): String =
        runCatching { FileTemplateManager.getInstance(project).getInternalTemplate(name).text }
            .getOrNull()?.ifBlank { null } ?: MateuNewFiles.bundledTemplateText(name)

    private fun create(project: Project, dirPath: String, fileName: String, text: String): VirtualFile? {
        var result: VirtualFile? = null
        var error: String? = null
        WriteCommandAction.runWriteCommandAction(project, "New Mateu File", null, {
            try {
                val dir = VfsUtil.createDirectoryIfMissing(dirPath) ?: error("Cannot create $dirPath")
                if (dir.findChild(fileName) != null) {
                    error = "$fileName already exists in $dirPath"
                } else {
                    val file = dir.createChildData(this, fileName)
                    VfsUtil.saveText(file, text)
                    result = file
                }
            } catch (ex: Exception) {
                error = ex.message ?: ex.toString()
            }
        })
        error?.let { Messages.showErrorDialog(project, it, "New Mateu File") }
        return result
    }
}
