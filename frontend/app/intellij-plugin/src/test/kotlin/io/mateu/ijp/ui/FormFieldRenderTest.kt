package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.ui.ComboBox
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import javax.swing.JCheckBox
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JRadioButton
import javax.swing.JTable
import javax.swing.text.JTextComponent

/**
 * The FormField → Swing decision order and its contract with the form: the value it seeds, where
 * the user's edit goes, the caption bound to the control it names, and how required / help /
 * a rejected value reach a screen reader.
 */
class FormFieldRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)

    private fun context(): AppContext {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        return ctx
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun field(rendered: JComponent): JComponent =
        all(rendered).filterIsInstance<JComponent>().first { it.getClientProperty("mateu.fieldId") != null }

    private fun render(ctx: AppContext, metadata: String, state: String = "{}"): JComponent =
        renderFormField(ctx, json(metadata), json(state), json("{}"))

    fun testTextFieldSeedsFromStateAndWritesEditsBack() {
        val ctx = context()
        val rendered = render(ctx, """{"fieldId":"name","label":"Name","dataType":"string"}""", """{"name":"Ada"}""")
        val input = field(rendered) as JTextComponent
        assertEquals("Ada", input.text)
        assertEquals("name", input.getClientProperty("mateu.fieldId"))
        input.text = "Grace"
        assertEquals("Grace", ctx.currentComponentState["name"])
    }

    fun testInitialValueIsUsedWhenTheStateHasNone() {
        val input = field(render(context(), """{"fieldId":"city","label":"City","initialValue":"Palma"}""")) as JTextComponent
        assertEquals("Palma", input.text)
    }

    fun testCaptionNamesTheControlAndRequiredIsSaidInWords() {
        val rendered = render(context(), """{"fieldId":"email","label":"Email","required":true,"description":"Work address"}""")
        val caption = all(rendered).filterIsInstance<JLabel>().first()
        val input = field(rendered)
        assertEquals("Email *", caption.text)
        assertSame(input, caption.labelFor)
        // the asterisk is not part of the announced name; the required state is in the description
        assertEquals("Email", input.accessibleContext.accessibleName)
        assertEquals("Required. Work address", input.accessibleContext.accessibleDescription)
    }

    fun testARejectedValueIsShownAndFoldedIntoTheDescription() {
        val ctx = context()
        ctx.currentFieldErrors["email"] = "Cannot be empty"
        val rendered = render(ctx, """{"fieldId":"email","label":"Email","required":true}""")
        assertTrue(all(rendered).filterIsInstance<JLabel>().any { it.text == "Cannot be empty" })
        assertEquals("Required. Invalid: Cannot be empty", field(rendered).accessibleContext.accessibleDescription)
    }

    fun testLabelsInterpolateTheLiveState() {
        val ctx = context()
        ctx.currentComponentState["customer"] = "ACME"
        val rendered = render(ctx, """{"fieldId":"notes","label":"Notes for ${'$'}{state.customer}"}""")
        assertEquals("Notes for ACME", all(rendered).filterIsInstance<JLabel>().first().text)
    }

    fun testRuleAttributesHideDisableAndRequire() {
        val ctx = context()
        ctx.fieldAttributes["a"] = hashMapOf("hidden" to true)
        val hidden = render(ctx, """{"fieldId":"a","label":"A"}""")
        assertTrue(all(hidden).none { it is JTextComponent })

        ctx.fieldAttributes["b"] = hashMapOf("disabled" to true, "required" to true)
        val disabled = render(ctx, """{"fieldId":"b","label":"B"}""")
        assertFalse(field(disabled).isEnabled)
        assertEquals("B *", all(disabled).filterIsInstance<JLabel>().first().text)

        // a rule can also take `required` AWAY from a field the server marked required
        ctx.fieldAttributes["c"] = hashMapOf("required" to false)
        val optional = render(ctx, """{"fieldId":"c","label":"C","required":true}""")
        assertEquals("C", all(optional).filterIsInstance<JLabel>().first().text)
    }

    fun testReadOnlyAndDisabledFieldsAreNotEditable() {
        assertFalse(field(render(context(), """{"fieldId":"x","label":"X","readOnly":true}""")).isEnabled)
        assertFalse(field(render(context(), """{"fieldId":"x","label":"X","disabled":true}""")).isEnabled)
    }

    fun testBooleanIsACheckboxCarryingItsOwnLabel() {
        val ctx = context()
        val rendered = render(ctx, """{"fieldId":"active","label":"Active","dataType":"bool"}""", """{"active":true}""")
        val cb = all(rendered).filterIsInstance<JCheckBox>().single()
        assertTrue(cb.isSelected)
        assertEquals("Active", cb.accessibleContext.accessibleName)
        cb.doClick()
        assertEquals(false, ctx.currentComponentState["active"])
    }

    fun testOptionsBecomeAComboWritingTheValueNotTheLabel() {
        val ctx = context()
        val rendered = render(ctx,
            """{"fieldId":"status","label":"Status","options":[{"value":"A","label":"Active"},{"value":"I","label":"Inactive"}]}""",
            """{"status":"I"}""")
        val combo = field(rendered) as ComboBox<*>
        assertEquals("Inactive", combo.selectedItem)
        combo.selectedIndex = 0
        assertEquals("A", ctx.currentComponentState["status"])
    }

    fun testRadioStereotype() {
        val ctx = context()
        val rendered = render(ctx,
            """{"fieldId":"size","label":"Size","stereotype":"radio","options":[{"value":"S"},{"value":"L","label":"Large"}]}""",
            """{"size":"S"}""")
        val radios = all(rendered).filterIsInstance<JRadioButton>().toList()
        assertEquals(listOf("S", "Large"), radios.map { it.text })
        assertTrue(radios[0].isSelected)
        radios[1].doClick()
        assertEquals("L", ctx.currentComponentState["size"])
    }

    fun testMultiSelectWritesTheSelectedValues() {
        val ctx = context()
        val rendered = render(ctx,
            """{"fieldId":"tags","label":"Tags","stereotype":"multiSelect","options":[{"value":"a"},{"value":"b"}]}""",
            """{"tags":["a"]}""")
        val boxes = all(rendered).filterIsInstance<JCheckBox>().toList()
        assertTrue(boxes[0].isSelected)
        boxes[1].doClick()
        assertEquals(setOf("a", "b"), (ctx.currentComponentState["tags"] as List<*>).toSet())
    }

    fun testIntegerFieldRejectsLettersAndClearingItClearsTheValue() {
        val ctx = context()
        val input = field(render(ctx, """{"fieldId":"qty","label":"Qty","dataType":"integer"}""", """{"qty":3}""")) as JTextComponent
        assertEquals("3", input.text)
        input.document.insertString(input.document.length, "x", null)
        assertEquals("3", input.text)
        input.text = "42"
        assertEquals(42, ctx.currentComponentState["qty"])
        input.text = ""
        assertTrue(ctx.currentComponentState.containsKey("qty"))
        assertNull("an emptied number must not keep the last value", ctx.currentComponentState["qty"])
    }

    fun testDecimalFieldAcceptsACommaAsDecimalSeparator() {
        val ctx = context()
        val input = field(render(ctx, """{"fieldId":"price","label":"Price","dataType":"number"}""")) as JTextComponent
        input.text = "2,5"
        assertEquals(2.5, ctx.currentComponentState["price"])
    }

    fun testReadOnlyMoneyIsFormatted() {
        val rendered = render(context(), """{"fieldId":"total","label":"Total","dataType":"money","readOnly":true}""", """{"total":1234.5}""")
        assertTrue(all(rendered).filterIsInstance<JLabel>().any { it.text == "1.234,50" })
        val plain = render(context(), """{"fieldId":"t","label":"T","dataType":"money","stereotype":"plainText"}""", """{"t":10}""")
        assertTrue(all(plain).filterIsInstance<JLabel>().any { it.text == "10,00" })
    }

    fun testPropertyRowShowsLabelAndValueReadOnly() {
        val row = render(context(), """{"fieldId":"doc","label":"Document","propertyRow":true}""", """{"doc":"X123"}""")
        val texts = all(row).filterIsInstance<JLabel>().map { it.text }.toList()
        assertEquals(listOf("Document", "X123"), texts)
        assertTrue(all(row).none { it is JTextComponent })
        val empty = render(context(), """{"fieldId":"doc","label":"Document","propertyRow":true}""")
        assertTrue(all(empty).filterIsInstance<JLabel>().any { it.text == "—" })
        val bool = render(context(), """{"fieldId":"ok","label":"Verified","dataType":"bool","propertyRow":true}""", """{"ok":true}""")
        assertTrue(all(bool).filterIsInstance<JLabel>().any { it.text == "✓" })
    }

    fun testBulletedListAndBadge() {
        val list = render(context(), """{"fieldId":"p","label":"Prefs","stereotype":"bulletedList"}""", """{"p":["Quiet","Sea view"]}""")
        assertEquals(listOf("Prefs", "• Quiet", "• Sea view"), all(list).filterIsInstance<JLabel>().map { it.text }.toList())
        val badge = render(context(), """{"fieldId":"vip","label":"VIP","stereotype":"badge"}""", """{"vip":true}""")
        assertTrue(all(badge).filterIsInstance<JLabel>().any { it.text == "VIP" })
    }

    fun testAStepperNamesItsEditorAndItsArrowButtons() {
        val ctx = context()
        val rendered = render(ctx, """{"fieldId":"age","label":"Age","dataType":"integer","stepButtonsVisible":true}""", """{"age":3}""")
        val editor = all(rendered).filterIsInstance<javax.swing.JFormattedTextField>().single()
        assertEquals("Age", editor.accessibleContext.accessibleName)
        val buttons = all(rendered).filterIsInstance<javax.swing.AbstractButton>().map { it.accessibleContext.accessibleName }.toSet()
        assertEquals(setOf("Increase Age", "Decrease Age"), buttons)
        (all(rendered).filterIsInstance<javax.swing.JSpinner>().single()).value = 4
        assertEquals(4, ctx.currentComponentState["age"])
    }

    fun testATextareaNamesTheTextNotItsScrollPane() {
        val rendered = render(context(), """{"fieldId":"notes","label":"Notes","stereotype":"textarea"}""")
        assertEquals("Notes", all(rendered).filterIsInstance<javax.swing.JTextArea>().single().accessibleContext.accessibleName)
    }

    fun testStarsCanBeSetFromTheKeyboard() {
        val ctx = context()
        val rendered = render(ctx, """{"fieldId":"rating","label":"Rating","dataType":"integer","stereotype":"stars"}""", """{"rating":2}""")
        val stars = field(rendered)
        assertTrue("the rating takes keyboard focus", stars.isFocusable)
        assertEquals("2 of 5", stars.accessibleContext.accessibleDescription)
        fun press(code: Int) = stars.keyListeners.forEach {
            it.keyPressed(java.awt.event.KeyEvent(stars, java.awt.event.KeyEvent.KEY_PRESSED, 0, 0, code, java.awt.event.KeyEvent.CHAR_UNDEFINED))
        }
        press(java.awt.event.KeyEvent.VK_RIGHT)
        assertEquals(3, ctx.currentComponentState["rating"])
        press(java.awt.event.KeyEvent.VK_END)
        press(java.awt.event.KeyEvent.VK_RIGHT)
        assertEquals("never above 5", 5, ctx.currentComponentState["rating"])
        press(java.awt.event.KeyEvent.VK_1)
        assertEquals(1, ctx.currentComponentState["rating"])
        press(java.awt.event.KeyEvent.VK_HOME)
        assertEquals(0, ctx.currentComponentState["rating"])
        assertEquals("0 of 5", stars.accessibleContext.accessibleDescription)
        // read-only: not focusable, no keys
        assertFalse(field(render(context(), """{"fieldId":"r","label":"R","stereotype":"stars","readOnly":true}""")).isFocusable)
    }

    fun testGridFieldShowsTheRowsReadOnlyWhenTheFormIsReadOnly() {
        val rendered = render(context(),
            """{"fieldId":"lines","label":"Lines","stereotype":"grid","readOnly":true,
                "columns":[{"metadata":{"id":"sku","label":"SKU"}},{"metadata":{"id":"qty","label":"Qty"}}]}""",
            """{"lines":[{"sku":"A","qty":1},{"sku":"B","qty":2}]}""")
        val table = all(rendered).filterIsInstance<JTable>().single()
        assertEquals(2, table.rowCount)
        assertFalse(table.isCellEditable(0, 0))
    }
}
