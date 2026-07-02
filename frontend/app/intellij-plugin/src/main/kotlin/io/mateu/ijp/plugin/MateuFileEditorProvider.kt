package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile

/** Wraps a [MateuVirtualFile]'s pre-rendered panel in an editor tab (only ours shows for our file). */
class MateuFileEditorProvider : FileEditorProvider, DumbAware {

    override fun accept(project: Project, file: VirtualFile): Boolean = file is MateuVirtualFile

    override fun createEditor(project: Project, file: VirtualFile): FileEditor {
        val vf = file as MateuVirtualFile
        return MateuFileEditor(vf.ui, vf)
    }

    override fun getEditorTypeId(): String = "mateu-view"

    override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.HIDE_DEFAULT_EDITOR
}
