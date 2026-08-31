package io.mateu.ijp.visualeditor

import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile

/**
 * Opens Mateu visual-builder pages (YAML files under `specs/ui/`) in the cross-IDE web visual
 * editor, hosted in a JCEF browser. Added as a tab after the default YAML text editor, so the raw
 * source stays available. This is the successor to the Swing split-preview (retired) and shares the
 * exact web bundle with the VSCode host.
 */
class MateuVisualEditorProvider : FileEditorProvider, DumbAware {

    override fun accept(project: Project, file: VirtualFile): Boolean {
        if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) return false
        return file.path.replace('\\', '/').contains("/specs/ui/")
    }

    override fun createEditor(project: Project, file: VirtualFile): FileEditor =
        MateuVisualEditor(project, file)

    override fun getEditorTypeId(): String = "mateu-visual-editor"

    override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.PLACE_AFTER_DEFAULT_EDITOR
}
