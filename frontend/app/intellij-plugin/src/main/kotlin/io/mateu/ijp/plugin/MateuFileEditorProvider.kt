package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import io.mateu.ijp.state.AppContext

/**
 * Turns a [MateuVirtualFile] into an editor tab: builds a fresh [AppContext] for the view, navigates
 * it to the file's route and hands the rendered panel to a [MateuFileEditor]. `HIDE_DEFAULT_EDITOR`
 * ensures only the Mateu editor shows (no text editor for our dummy file).
 */
class MateuFileEditorProvider : FileEditorProvider, DumbAware {

    override fun accept(project: Project, file: VirtualFile): Boolean = file is MateuVirtualFile

    override fun createEditor(project: Project, file: VirtualFile): FileEditor {
        val vf = file as MateuVirtualFile
        val ctx = AppContext(vf.session)
        val content = ctx.newSlot()
        ctx.contentPane = content
        ctx.navigate(vf.route, vf.consumedRoute, vf.sst, vf.actionId)
        return MateuFileEditor(content, vf)
    }

    override fun getEditorTypeId(): String = "mateu-view"

    override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.HIDE_DEFAULT_EDITOR
}
