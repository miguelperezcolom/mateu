package io.mateu.ijp.contract

import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.testFramework.fixtures.LightJavaCodeInsightFixtureTestCase

/**
 * Verifies the visual-builder binding validation (phase 2): a YAML page's FormField ids and Button
 * actionIds are checked against the declared ModelView class via PSI — unknown ones are flagged,
 * real ones are not.
 */
class MateuYamlBindingAnnotatorTest : LightJavaCodeInsightFixtureTestCase() {

  private fun errorTexts(yaml: String): List<String> {
    myFixture.addClass(
      """
      package demo;
      public class CustomerView {
        public String name;
        public int age;
        public Object save() { return null; }
      }
      """.trimIndent()
    )
    myFixture.configureByText("page.yaml", yaml)
    val text = myFixture.file.text
    return myFixture.doHighlighting()
      .filter { it.severity == HighlightSeverity.ERROR }
      .map { text.substring(it.startOffset, it.endOffset) }
  }

  fun testKnownFieldsAndActionsAreNotFlagged() {
    val errors = errorTexts(
      """
      modelView: demo.CustomerView
      layout:
        type: VerticalLayout
        content:
          - type: FormField
            id: name
          - type: FormField
            id: age
          - type: Button
            actionId: save
      """.trimIndent()
    )
    assertEmpty(errors)
  }

  fun testUnknownFieldAndActionAreFlagged() {
    val errors = errorTexts(
      """
      modelView: demo.CustomerView
      layout:
        type: VerticalLayout
        content:
          - type: FormField
            id: name
          - type: FormField
            id: nope
          - type: Button
            actionId: doesNotExist
      """.trimIndent()
    )
    assertContainsElements(errors, "nope", "doesNotExist")
    assertDoesntContain(errors, "name")
  }

  fun testUnresolvedModelViewIsFlagged() {
    val errors = errorTexts(
      """
      modelView: demo.NoSuchView
      layout:
        type: FormField
        id: whatever
      """.trimIndent()
    )
    assertContainsElements(errors, "demo.NoSuchView")
  }

  fun testAPlainYamlWithoutAModelViewIsIgnored() {
    val errors = errorTexts(
      """
      type: VerticalLayout
      content:
        - type: FormField
          id: name
        - type: Button
          actionId: whatever
      """.trimIndent()
    )
    assertEmpty(errors)
  }
}
