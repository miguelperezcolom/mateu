package io.mateu.ijp.contract

/**
 * The visual-builder component palette: a catalog of components and the YAML snippet each inserts
 * into a page. Pure (no IDE deps) so the snippet + indentation logic is unit-testable; the tool
 * window ([MateuPaletteToolWindowFactory]) just places the snippet at the caret. Each snippet is a
 * YAML list item (the form components take inside a `content:` list), authored at zero indent and
 * re-indented to the insertion point.
 */
object PaletteSnippets {

  data class Item(val label: String, val type: String, val snippet: String)

  val ITEMS: List<Item> = listOf(
    Item("Text", "Text", "- type: Text\n  text: \"Text\""),
    Item("Field", "FormField", "- type: FormField\n  id: fieldId\n  label: \"Label\""),
    Item("Button", "Button", "- type: Button\n  label: \"Button\"\n  actionId: actionId"),
    Item(
      "Vertical Layout",
      "VerticalLayout",
      "- type: VerticalLayout\n  spacing: true\n  content:\n    - type: Text\n      text: \"…\"",
    ),
    Item(
      "Horizontal Layout",
      "HorizontalLayout",
      "- type: HorizontalLayout\n  spacing: true\n  content:\n    - type: Text\n      text: \"…\"",
    ),
    Item(
      "Form Layout",
      "FormLayout",
      "- type: FormLayout\n  content:\n    - type: FormField\n      id: fieldId\n      label: \"Label\"",
    ),
  )

  fun byType(type: String): Item? = ITEMS.firstOrNull { it.type == type }

  /** The leading whitespace of the line that contains [offset]. */
  fun lineIndent(text: String, offset: Int): String {
    val safe = offset.coerceIn(0, text.length)
    val lineStart = text.lastIndexOf('\n', (safe - 1).coerceAtLeast(0)).let { if (it < 0) 0 else it + 1 }
    val lineEnd = text.indexOf('\n', lineStart).let { if (it < 0) text.length else it }
    return text.substring(lineStart, lineEnd).takeWhile { it == ' ' || it == '\t' }
  }

  /** Prefix every line of [snippet] with [indent]. */
  fun indent(snippet: String, indent: String): String =
    snippet.split("\n").joinToString("\n") { if (it.isEmpty()) it else indent + it }
}
