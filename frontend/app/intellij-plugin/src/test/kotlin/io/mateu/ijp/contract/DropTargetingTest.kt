package io.mateu.ijp.contract

import com.intellij.testFramework.fixtures.LightJavaCodeInsightFixtureTestCase

/** Verifies the precise-drop insertion point: a component lands as a sibling of the wire node at a
 *  given child-index path, not just at the page root. */
class DropTargetingTest : LightJavaCodeInsightFixtureTestCase() {

  private val page = """
    modelView: demo.X
    layout:
      type: VerticalLayout
      content:
        - type: Text
          text: "A"
        - type: Text
          text: "B"
  """.trimIndent()

  /** Applies the computed insertion to the current text and returns the result. */
  private fun applied(path: List<Int>): String {
    myFixture.configureByText("page.yaml", page)
    val doc = myFixture.editor.document
    val insertion =
      DropTargeting.insertionAtPath(project, myFixture.file.virtualFile, doc, path, "- type: Button")!!
    return doc.text.substring(0, insertion.first) + insertion.second + doc.text.substring(insertion.first)
  }

  fun testDroppingOnTheFirstChildInsertsAfterIt() {
    val text = applied(listOf(0))
    // the new Button lands between A and B
    assertTrue(text.indexOf("Button") > text.indexOf("\"A\""))
    assertTrue(text.indexOf("Button") < text.indexOf("\"B\""))
  }

  fun testDroppingOnTheSecondChildInsertsAfterIt() {
    val text = applied(listOf(1))
    assertTrue(text.indexOf("Button") > text.indexOf("\"B\""))
  }

  fun testEmptyPathAppendsAtTheRoot() {
    val text = applied(emptyList())
    // appended after the last item
    assertTrue(text.indexOf("Button") > text.indexOf("\"B\""))
  }
}
