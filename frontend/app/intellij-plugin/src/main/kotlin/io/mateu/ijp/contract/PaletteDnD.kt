package io.mateu.ijp.contract

import com.intellij.openapi.editor.Document
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.PsiManager
import org.jetbrains.yaml.psi.YAMLFile
import org.jetbrains.yaml.psi.YAMLMapping
import org.jetbrains.yaml.psi.YAMLSequence

/**
 * Drag-and-drop glue between the palette and the live preview. Palette items are dragged as a plain
 * string ([PREFIX] + component type); the preview accepts the drop and adds the component to the
 * page's ROOT layout content list. (Dropping at a precise position between nested components is a
 * later increment — it needs the renderer to tag each Swing component with its YAML source offset.)
 */
object PaletteDnD {

  const val PREFIX = "mateu-component:"

  fun typeOf(transfer: String?): String? =
    transfer?.takeIf { it.startsWith(PREFIX) }?.removePrefix(PREFIX)

  /**
   * Insertion point for a new component: a fresh item after the last one of the page's root layout
   * `content:` list, indented to match. Returns (offset, textToInsert), or null when the page has no
   * such list (the caller then appends at the document end).
   */
  fun appendToRootContent(project: Project, file: VirtualFile, doc: Document, snippet: String): Pair<Int, String>? {
    val psi = PsiManager.getInstance(project).findFile(file) as? YAMLFile ?: return null
    val top = psi.documents.firstOrNull()?.topLevelValue as? YAMLMapping ?: return null
    val layout = (top.getKeyValueByKey("layout")?.value as? YAMLMapping) ?: top
    val content = layout.getKeyValueByKey("content")?.value as? YAMLSequence ?: return null
    val anchor = content.items.lastOrNull() ?: return null
    val indent = PaletteSnippets.lineIndent(doc.text, anchor.textRange.startOffset)
    return anchor.textRange.endOffset to ("\n" + PaletteSnippets.indent(snippet, indent))
  }
}
