package io.mateu.ijp.contract

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.fileEditor.TextEditor
import com.intellij.openapi.fileEditor.TextEditorWithPreview
import com.intellij.openapi.fileEditor.impl.text.TextEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.UserDataHolderBase
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.Alarm
import java.awt.Component as AwtComponent
import java.awt.Container
import java.awt.datatransfer.DataFlavor
import java.awt.dnd.DnDConstants
import java.awt.dnd.DropTarget
import java.awt.dnd.DropTargetAdapter
import java.awt.dnd.DropTargetDropEvent
import io.mateu.ijp.plugin.loadMateuConfig
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.ui.ComponentRenderer
import java.awt.BorderLayout
import java.beans.PropertyChangeListener
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.ScrollPaneConstants
import javax.swing.SwingConstants

/**
 * A split editor for a Mateu visual-builder page (a YAML file under `specs/ui/`): the standard YAML
 * text editor on one side and a LIVE PREVIEW on the other. The preview renders the editor's current,
 * unsaved content through the backend's `__preview__` action (so it's faithful — the real mapper)
 * with the plugin's own Swing renderer, and refreshes (debounced) as you type. Needs a running dev
 * backend (configured via `mateu.baseUrl`); shows a hint otherwise.
 */
class YamlPagePreviewProvider : FileEditorProvider, DumbAware {

  override fun accept(project: Project, file: VirtualFile): Boolean {
    val ext = file.extension?.lowercase()
    if (ext != "yaml" && ext != "yml") return false
    // Convention: Mateu pages live under specs/ui/. Keeps this off unrelated YAML.
    return file.path.replace('\\', '/').contains("/specs/ui/")
  }

  override fun createEditor(project: Project, file: VirtualFile): FileEditor {
    val textEditor = TextEditorProvider.getInstance().createEditor(project, file) as TextEditor
    val preview = YamlPagePreviewEditor(project, file)
    return TextEditorWithPreview(
      textEditor,
      preview,
      "Mateu Page",
      TextEditorWithPreview.Layout.SHOW_EDITOR_AND_PREVIEW,
    )
  }

  override fun getEditorTypeId(): String = "mateu-yaml-page-preview"

  // Keep the plain YAML editor available too (the split editor is offered alongside it).
  override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.PLACE_AFTER_DEFAULT_EDITOR
}

private class YamlPagePreviewEditor(
  private val project: Project,
  private val file: VirtualFile,
) : UserDataHolderBase(), FileEditor {

  private val root = JPanel(BorderLayout())
  private val session = AppSession(loadMateuConfig().baseUrl)
  private val alarm = Alarm(Alarm.ThreadToUse.SWING_THREAD, this)
  private val document = FileDocumentManager.getInstance().getDocument(file)

  private val documentListener = object : DocumentListener {
    override fun documentChanged(event: DocumentEvent) = scheduleRefresh()
  }

  /** Accepts a component dragged from the palette and drops it into the page (root content). */
  private val dropListener = object : DropTargetAdapter() {
    override fun drop(event: DropTargetDropEvent) {
      try {
        event.acceptDrop(DnDConstants.ACTION_COPY)
        val transfer = event.transferable.getTransferData(DataFlavor.stringFlavor) as? String
        val type = PaletteDnD.typeOf(transfer)
        if (type != null) onDrop(type)
        event.dropComplete(type != null)
      } catch (e: Exception) {
        event.dropComplete(false)
      }
    }
  }

  init {
    root.add(hint("Rendering preview…  (drag components here from the palette)"), BorderLayout.CENTER)
    DropTarget(root, DnDConstants.ACTION_COPY, dropListener, true)
    document?.addDocumentListener(documentListener, this)
    scheduleRefresh(delayMs = 0)
  }

  /** Make the whole preview a drop zone: Swing has no drop bubbling, so install the target on every
   *  rendered widget, not just the container. */
  private fun installDropTargets(component: AwtComponent) {
    DropTarget(component, DnDConstants.ACTION_COPY, dropListener, true)
    if (component is Container) component.components.forEach { installDropTargets(it) }
  }

  private fun onDrop(type: String) {
    val item = PaletteSnippets.byType(type) ?: return
    val doc = document ?: return
    val insertion = PaletteDnD.appendToRootContent(project, file, doc, item.snippet)
      ?: (doc.textLength to ("\n" + item.snippet))
    WriteCommandAction.runWriteCommandAction(project) {
      doc.insertString(insertion.first, insertion.second)
    }
    scheduleRefresh(delayMs = 0)
  }

  private fun scheduleRefresh(delayMs: Int = 350) {
    alarm.cancelAllRequests()
    alarm.addRequest({ refresh() }, delayMs)
  }

  /** Read the current text (EDT), fetch the preview off the EDT, render back on the EDT. */
  private fun refresh() {
    val yaml = document?.text ?: return
    ApplicationManager.getApplication().executeOnPooledThread {
      val rendered: JComponent = try {
        val increment = session.apiClient.runAction(
          route = "",
          consumedRoute = "",
          actionId = "__preview__",
          serverSideType = null,
          initiatorComponentId = "preview",
          componentState = emptyMap(),
          appState = session.appState,
          parameters = mapOf("_yaml" to yaml),
        )
        renderIncrement(increment)
      } catch (e: Exception) {
        hint("Preview unavailable — is the Mateu backend running at ${session.baseUrl}?")
      }
      ApplicationManager.getApplication().invokeLater({
        if (!project.isDisposed) {
          root.removeAll()
          val wrapped = wrapScroll(rendered)
          root.add(wrapped, BorderLayout.CENTER)
          installDropTargets(wrapped) // every rendered widget accepts palette drops
          root.revalidate()
          root.repaint()
        }
      }, { project.isDisposed })
    }
  }

  private fun renderIncrement(increment: JsonNode): JComponent {
    val fragment = increment.path("fragments").firstOrNull() ?: return hint("Nothing to preview.")
    val component = fragment.path("component")
    if (component.isMissingNode || component.isNull) return hint("Nothing to preview.")
    val state = fragment.path("state")
    val data = fragment.path("data")
    val ctx = AppContext(session)
    return ComponentRenderer(ctx).render(component, state, data)
  }

  private fun wrapScroll(content: JComponent): JComponent =
    JBScrollPane(content).apply {
      horizontalScrollBarPolicy = ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED
      verticalScrollBarPolicy = ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED
      border = null
    }

  private fun hint(text: String): JComponent =
    JLabel(text, SwingConstants.CENTER).apply { isEnabled = false }

  override fun getComponent(): JComponent = root
  override fun getPreferredFocusedComponent(): JComponent = root
  override fun getName(): String = "Preview"
  override fun setState(state: com.intellij.openapi.fileEditor.FileEditorState) {}
  override fun isModified(): Boolean = false
  override fun isValid(): Boolean = true
  override fun addPropertyChangeListener(listener: PropertyChangeListener) {}
  override fun removePropertyChangeListener(listener: PropertyChangeListener) {}
  override fun getFile(): VirtualFile = file

  // The Alarm and document listener are parented to this editor (Disposable), so the platform
  // cleans them up on dispose; nothing extra to do.
  override fun dispose() {}
}
