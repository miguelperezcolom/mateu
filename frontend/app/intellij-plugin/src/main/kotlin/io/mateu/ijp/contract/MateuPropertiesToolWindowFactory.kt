package io.mateu.ijp.contract

import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.event.CaretEvent
import com.intellij.openapi.editor.event.CaretListener
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.psi.PsiDocumentManager
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.ui.content.ContentFactory
import com.intellij.util.ui.JBUI
import java.awt.BorderLayout
import java.awt.Component
import java.awt.Dimension
import java.awt.Font
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.JPanel

/**
 * The visual-builder property panel: shows the component under the caret in a Mateu page and its
 * editable scalar properties; pressing Enter in a field writes the new value straight back into the
 * YAML (and the split-editor preview refreshes). Follows the caret across editors.
 */
class MateuPropertiesToolWindowFactory : ToolWindowFactory, DumbAware {

  override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
    val body = JPanel().apply {
      layout = BoxLayout(this, BoxLayout.Y_AXIS)
      border = JBUI.Borders.empty(8)
    }
    val panel = JPanel(BorderLayout()).apply { add(body, BorderLayout.NORTH) }

    fun refresh() {
      val editor = FileEditorManager.getInstance(project).selectedTextEditor
      val model = editor?.let {
        val psi = PsiDocumentManager.getInstance(project).getPsiFile(it.document)
        if (psi != null && psi.name.endsWith(".yaml")) PropertyModel.at(psi, it.caretModel.offset) else null
      }
      body.removeAll()
      if (model == null) {
        body.add(JBLabel("Place the caret on a component in a Mateu page.").apply { isEnabled = false })
      } else {
        body.add(
          JBLabel(model.type).apply {
            font = font.deriveFont(font.style or Font.BOLD)
            alignmentX = Component.LEFT_ALIGNMENT
          },
        )
        body.add(Box.createVerticalStrut(8))
        for (prop in model.props) {
          val field = JBTextField(prop.value)
          field.addActionListener {
            val target = FileEditorManager.getInstance(project).selectedTextEditor ?: return@addActionListener
            WriteCommandAction.runWriteCommandAction(project) {
              target.document.replaceString(prop.valueStart, prop.valueEnd, field.text)
            }
            refresh() // offsets shifted — re-read
          }
          val row = JPanel(BorderLayout(8, 0)).apply {
            add(
              JBLabel(prop.key).apply { preferredSize = Dimension(90, preferredSize.height) },
              BorderLayout.WEST,
            )
            add(field, BorderLayout.CENTER)
            alignmentX = Component.LEFT_ALIGNMENT
            maximumSize = Dimension(Int.MAX_VALUE, preferredSize.height)
          }
          body.add(row)
          body.add(Box.createVerticalStrut(4))
        }
      }
      body.revalidate()
      body.repaint()
    }

    EditorFactory.getInstance().eventMulticaster.addCaretListener(
      object : CaretListener {
        override fun caretPositionChanged(event: CaretEvent) = refresh()
      },
      toolWindow.disposable,
    )
    refresh()

    toolWindow.contentManager.addContent(ContentFactory.getInstance().createContent(panel, "", false))
  }
}
