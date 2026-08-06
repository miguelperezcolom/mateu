package io.mateu.ijp.contract

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.editor.Document
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.PsiManager
import org.jetbrains.yaml.psi.YAMLFile
import org.jetbrains.yaml.psi.YAMLMapping
import org.jetbrains.yaml.psi.YAMLSequence

/**
 * Precise drop targeting: maps the rendered widget a component was dropped ON back to a YAML
 * insertion point, so the new component lands next to where you dropped it (not just at the page
 * root). The renderer tags every widget with the wire component it rendered ([WIRE_KEY]); from that
 * we find the component's child-index path in the wire tree and walk the YAML `content` lists by the
 * same path. When the wire and YAML structures don't line up (e.g. a FormLayout wraps fields in
 * rows), navigation returns null and the caller falls back to appending at the page root — degrades,
 * never breaks.
 */
object DropTargeting {

  const val WIRE_KEY = "mateu.wireComponent"

  /** Child-index path from [root] to the [target] wire node (by identity), or null if not found. */
  fun pathOf(root: JsonNode?, target: JsonNode?): List<Int>? {
    if (root == null || target == null) return null
    if (root === target) return emptyList()
    val children = root.path("children")
    children.forEachIndexed { i, child ->
      pathOf(child, target)?.let { return listOf(i) + it }
    }
    return null
  }

  /**
   * The (offset, textToInsert) to add [snippet] as a sibling right after the component at [path] in
   * the page's YAML, or null to fall back to a root append.
   */
  fun insertionAtPath(
    project: Project,
    file: VirtualFile,
    doc: Document,
    path: List<Int>,
    snippet: String,
  ): Pair<Int, String>? {
    if (path.isEmpty()) return PaletteDnD.appendToRootContent(project, file, doc, snippet)
    val psi = PsiManager.getInstance(project).findFile(file) as? YAMLFile ?: return null
    val top = psi.documents.firstOrNull()?.topLevelValue as? YAMLMapping ?: return null
    val rootLayout = (top.getKeyValueByKey("layout")?.value as? YAMLMapping) ?: top
    var seq = rootLayout.getKeyValueByKey("content")?.value as? YAMLSequence ?: return null
    for (idx in path.dropLast(1)) {
      val item = seq.items.getOrNull(idx)?.value as? YAMLMapping ?: return null
      seq = item.getKeyValueByKey("content")?.value as? YAMLSequence ?: return null
    }
    val anchor = seq.items.getOrNull(path.last()) ?: return null
    val indent = PaletteSnippets.lineIndent(doc.text, anchor.textRange.startOffset)
    return anchor.textRange.endOffset to ("\n" + PaletteSnippets.indent(snippet, indent))
  }
}
