package io.mateu.ijp.contract

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Pure unit tests of the palette snippet + indentation logic (no IDE platform needed). */
class PaletteSnippetsTest {

  @Test
  fun everyItemIsAYamlListItem() {
    assertTrue(PaletteSnippets.ITEMS.isNotEmpty())
    PaletteSnippets.ITEMS.forEach { assertTrue(it.snippet.startsWith("- type:")) }
  }

  @Test
  fun byTypeFindsItemsAndMissesUnknowns() {
    assertEquals("Field", PaletteSnippets.byType("FormField")?.label)
    assertNull(PaletteSnippets.byType("Nope"))
  }

  @Test
  fun lineIndentReadsTheLeadingWhitespaceOfTheCaretLine() {
    val text = "a:\n    b: c\n"
    assertEquals("    ", PaletteSnippets.lineIndent(text, text.indexOf("b:")))
    assertEquals("", PaletteSnippets.lineIndent(text, 0))
  }

  @Test
  fun indentPrefixesEveryLine() {
    assertEquals("  - type: X\n    id: y", PaletteSnippets.indent("- type: X\n  id: y", "  "))
  }

  @Test
  fun dndTypeOfParsesTheDragPayload() {
    assertEquals("Button", PaletteDnD.typeOf(PaletteDnD.PREFIX + "Button"))
    assertNull(PaletteDnD.typeOf("something-else"))
    assertNull(PaletteDnD.typeOf(null))
  }
}
