package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorState
import com.intellij.openapi.util.UserDataHolderBase
import com.intellij.openapi.vfs.VirtualFile
import java.beans.PropertyChangeListener
import javax.swing.JComponent

/** A [FileEditor] whose UI is a rendered Mateu view — shown as a tab in the central editor area.
 *  [isModified] mirrors the view's dirty flag (@ConfirmOnNavigationIfDirty), so the tab carries the
 *  IDE's modified marker while the form has unsaved changes. */
class MateuFileEditor(
    private val ui: JComponent,
    private val file: MateuVirtualFile,
) : UserDataHolderBase(), FileEditor {

    private val listeners = java.util.concurrent.CopyOnWriteArrayList<PropertyChangeListener>()

    init {
        file.ctx?.onDirtyChanged = { modified ->
            val event = java.beans.PropertyChangeEvent(this, FileEditor.getPropModified(), !modified, modified)
            listeners.forEach { it.propertyChange(event) }
        }
    }

    override fun getComponent(): JComponent = ui
    override fun getPreferredFocusedComponent(): JComponent = ui
    override fun getName(): String = file.label
    override fun getFile(): VirtualFile = file
    override fun setState(state: FileEditorState) {}
    override fun isModified(): Boolean = file.ctx?.dirty == true
    override fun isValid(): Boolean = true
    override fun addPropertyChangeListener(listener: PropertyChangeListener) {
        listeners.add(listener)
    }
    override fun removePropertyChangeListener(listener: PropertyChangeListener) {
        listeners.remove(listener)
    }
    override fun dispose() {}
}
