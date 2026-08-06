package io.mateu.ijp.contract

import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.components.JBLabel
import com.intellij.ui.content.ContentFactory
import com.intellij.util.ui.JBUI
import java.awt.Component
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JPanel

/**
 * The visual-builder component palette (first rung of drag-and-drop): a tool window of components;
 * clicking one inserts its YAML on a fresh line after the caret, re-indented to the caret's line —
 * so you build a page by adding components instead of memorising the YAML. Full drag-onto-the-
 * preview-canvas is a later increment.
 */
class MateuPaletteToolWindowFactory : ToolWindowFactory, DumbAware {

  override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
    val panel = JPanel().apply {
      layout = BoxLayout(this, BoxLayout.Y_AXIS)
      border = JBUI.Borders.empty(8)
    }
    panel.add(
      JBLabel("Insert into the active Mateu page at the caret:").apply {
        alignmentX = Component.LEFT_ALIGNMENT
      },
    )
    panel.add(Box.createVerticalStrut(8))
    for (item in PaletteSnippets.ITEMS) {
      panel.add(
        JButton(item.label).apply {
          alignmentX = Component.LEFT_ALIGNMENT
          maximumSize = java.awt.Dimension(Int.MAX_VALUE, preferredSize.height)
          addActionListener { insert(project, item) }
        },
      )
      panel.add(Box.createVerticalStrut(4))
    }
    val content = ContentFactory.getInstance().createContent(panel, "", false)
    toolWindow.contentManager.addContent(content)
  }

  private fun insert(project: Project, item: PaletteSnippets.Item) {
    val editor = FileEditorManager.getInstance(project).selectedTextEditor ?: return
    val doc = editor.document
    val caret = editor.caretModel.offset
    val lineEnd = doc.getLineEndOffset(doc.getLineNumber(caret))
    val indented = PaletteSnippets.indent(item.snippet, PaletteSnippets.lineIndent(doc.text, caret))
    WriteCommandAction.runWriteCommandAction(project) {
      doc.insertString(lineEnd, "\n" + indented)
    }
    editor.caretModel.moveToOffset((lineEnd + 1 + indented.length).coerceAtMost(doc.textLength))
  }
}
