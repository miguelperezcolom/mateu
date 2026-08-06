package io.mateu.ijp.contract

import com.intellij.codeInsight.daemon.impl.HighlightInfo
import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.testFramework.fixtures.LightJavaCodeInsightFixtureTestCase

/**
 * Verifies the visual-builder binding validation: PSI catches ids/actionIds that do not exist at
 * all (errors), and the backend contract — when present — refines that to what actually BINDS
 * (weak warnings for a field/method that exists but is hidden/excluded/not an @Action, or a
 * declared dataType that conflicts).
 */
class MateuYamlBindingAnnotatorTest : LightJavaCodeInsightFixtureTestCase() {

  override fun setUp() {
    super.setUp()
    ContractCache.getInstance(project).networkEnabled = false // no real HTTP in tests
  }

  private val customerView = """
    package demo;
    public class CustomerView {
      public String name;
      public int age;
      public String secret;
      public Object save() { return null; }
      public Object internalHelper() { return null; }
    }
  """.trimIndent()

  private fun highlight(yaml: String): List<HighlightInfo> {
    myFixture.addClass(customerView)
    myFixture.configureByText("page.yaml", yaml)
    return myFixture.doHighlighting()
  }

  private fun List<HighlightInfo>.errors(): List<String> = at(HighlightSeverity.ERROR) { true }

  /** Our binding weak-warnings only (ignore any unrelated YAML inspections). */
  private fun List<HighlightInfo>.bindingWarnings(): List<String> =
    at(HighlightSeverity.WEAK_WARNING) {
      it.contains("bindable field") || it.contains("Mateu action") || it.contains("not the declared")
    }

  private fun List<HighlightInfo>.at(severity: HighlightSeverity, keep: (String) -> Boolean): List<String> {
    val text = myFixture.file.text
    return filter { it.severity == severity && keep(it.description ?: "") }
      .map { text.substring(it.startOffset, it.endOffset) }
  }

  fun testKnownFieldsAndActionsAreNotFlagged() {
    val errors = highlight(
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
    ).errors()
    assertEmpty(errors)
  }

  fun testUnknownFieldAndActionAreErrors() {
    val errors = highlight(
      """
      modelView: demo.CustomerView
      layout:
        type: VerticalLayout
        content:
          - type: FormField
            id: nope
          - type: Button
            actionId: doesNotExist
      """.trimIndent()
    ).errors()
    assertContainsElements(errors, "nope", "doesNotExist")
  }

  fun testUnresolvedModelViewIsFlagged() {
    val errors = highlight(
      """
      modelView: demo.NoSuchView
      layout:
        type: FormField
        id: whatever
      """.trimIndent()
    ).errors()
    assertContainsElements(errors, "demo.NoSuchView")
  }

  fun testPlainYamlWithoutModelViewIsIgnored() {
    assertEmpty(
      highlight(
        """
        type: VerticalLayout
        content:
          - type: FormField
            id: name
          - type: Button
            actionId: whatever
        """.trimIndent()
      ).errors()
    )
  }

  fun testContractFlagsExistingButNonBindableFieldAndAction() {
    ContractCache.getInstance(project).seed(
      "demo.CustomerView",
      ModelViewContract(
        "demo.CustomerView",
        listOf(
          ContractField("name", "string", "regular", required = true, readOnly = false),
          ContractField("age", "integer", "regular", required = false, readOnly = false),
        ),
        listOf("save"),
      ),
    )
    val infos = highlight(
      """
      modelView: demo.CustomerView
      layout:
        type: VerticalLayout
        content:
          - type: FormField
            id: name
          - type: FormField
            id: secret
          - type: Button
            actionId: save
          - type: Button
            actionId: internalHelper
      """.trimIndent()
    )
    // everything exists via PSI → no errors …
    assertEmpty(infos.errors())
    // … but the contract flags what exists yet does not bind
    val warnings = infos.bindingWarnings()
    assertContainsElements(warnings, "secret", "internalHelper")
    assertDoesntContain(warnings, "name", "save")
  }

  fun testContractFlagsDataTypeMismatch() {
    ContractCache.getInstance(project).seed(
      "demo.CustomerView",
      ModelViewContract(
        "demo.CustomerView",
        listOf(ContractField("name", "string", "regular", required = true, readOnly = false)),
        listOf("save"),
      ),
    )
    val warnings = highlight(
      """
      modelView: demo.CustomerView
      layout:
        type: FormField
        id: name
        dataType: number
      """.trimIndent()
    ).bindingWarnings()
    // the mismatch is flagged on the field id (an annotator may only mark its own element)
    assertContainsElements(warnings, "name")
  }
}
