package io.mateu.ijp.contract

import com.intellij.testFramework.fixtures.LightJavaCodeInsightFixtureTestCase

/** Verifies the property panel's core: the component under the caret and its editable props. */
class PropertyModelTest : LightJavaCodeInsightFixtureTestCase() {

  private val page = """
    modelView: demo.X
    layout:
      type: VerticalLayout
      content:
        - type: FormField
          id: name
          label: "Name"
  """.trimIndent()

  fun testFindsTheEnclosingComponentAndItsScalarProps() {
    myFixture.configureByText("page.yaml", page)
    val props = PropertyModel.at(myFixture.file, myFixture.file.text.indexOf("id: name"))!!
    assertEquals("FormField", props.type)
    val byKey = props.props.associate { it.key to it.value }
    assertEquals("name", byKey["id"])
    assertTrue(byKey["label"]!!.contains("Name"))
    // the `type` key is not an editable prop, and there is no nested list here
    assertFalse(byKey.containsKey("type"))
  }

  fun testWalksUpToTheNearestComponentFromANestedValue() {
    myFixture.configureByText("page.yaml", page)
    // caret on the outer VerticalLayout's `spacing`-less mapping (the `content:` line)
    val props = PropertyModel.at(myFixture.file, myFixture.file.text.indexOf("content:"))!!
    assertEquals("VerticalLayout", props.type)
  }

  fun testReturnsNullOutsideAnyComponent() {
    myFixture.configureByText("page.yaml", "modelView: demo.X\n")
    assertNull(PropertyModel.at(myFixture.file, 0))
  }
}
