package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorState
import com.intellij.openapi.util.UserDataHolderBase
import com.intellij.openapi.vfs.VirtualFile
import java.beans.PropertyChangeListener
import javax.swing.JComponent

/** A [FileEditor] whose UI is a rendered Mateu view — shown as a tab in the central editor area. */
class MateuFileEditor(
    private val ui: JComponent,
    private val file: MateuVirtualFile,
) : UserDataHolderBase(), FileEditor {

    override fun getComponent(): JComponent = ui
    override fun getPreferredFocusedComponent(): JComponent = ui
    override fun getName(): String = file.label
    override fun getFile(): VirtualFile = file
    override fun setState(state: FileEditorState) {}
    override fun isModified(): Boolean = false
    override fun isValid(): Boolean = true
    override fun addPropertyChangeListener(listener: PropertyChangeListener) {}
    override fun removePropertyChangeListener(listener: PropertyChangeListener) {}
    override fun dispose() {}
}
