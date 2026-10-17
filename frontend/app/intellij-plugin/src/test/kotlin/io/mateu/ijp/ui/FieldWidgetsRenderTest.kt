package io.mateu.ijp.ui

import java.awt.Dimension
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JPasswordField
import javax.swing.JSlider
import javax.swing.JTable
import javax.swing.text.JTextComponent

/**
 * The richer field widgets and the editable grid field: what each seeds from the state and what a
 * user's edit writes back into the component state the form saves.
 */
class FieldWidgetsRenderTest : RenderTestCase() {

    private fun field(ctx: io.mateu.ijp.state.AppContext, metadata: String, state: String = "{}"): JComponent =
        renderFormField(ctx, json(metadata), json(state), json("{}"))

    private fun table(c: JComponent) = all(c).filterIsInstance<JTable>().single()

    private fun rows(ctx: io.mateu.ijp.state.AppContext, id: String): List<Map<String, Any?>> {
        @Suppress("UNCHECKED_CAST")
        return ctx.currentComponentState[id] as List<Map<String, Any?>>
    }

    private val gridColumns = """[{"metadata":{"id":"_select"}},{"metadata":{"id":"name","label":"Name"}},
        {"metadata":{"id":"qty","label":"Qty","dataType":"integer"}},{"metadata":{"id":"vip","label":"VIP","dataType":"bool"}}]"""

    fun testAnInlineEditableGridEditsAddsMovesAndRemovesRowsInTheState() {
        val ctx = context()
        val rendered = field(ctx, """{"fieldId":"lines","label":"Lines","stereotype":"grid","inlineEditing":true,
            "columns":$gridColumns}""", """{"lines":[{"name":"Ada","qty":1,"vip":false},{"name":"Grace","qty":2,"vip":true}]}""")
        val t = table(rendered)
        assertEquals("the _select marker column is not shown", listOf("Name", "Qty", "VIP"),
            (0 until t.columnCount).map { t.getColumnName(it) })
        assertEquals(java.lang.Boolean::class.java, t.model.getColumnClass(2))
        assertTrue(t.model.isCellEditable(0, 0))

        t.model.setValueAt("7", 0, 1)
        assertEquals("an integer cell stays an integer", 7, rows(ctx, "lines")[0]["qty"])
        t.model.setValueAt(true, 0, 2)
        assertEquals(true, rows(ctx, "lines")[0]["vip"])
        t.model.setValueAt("x", 0, 1)
        assertEquals("a non-number keeps the old number", 7, rows(ctx, "lines")[0]["qty"])

        val add = buttons(rendered).first { it.toolTipText == "Add row" }
        add.doClick()
        assertEquals(3, rows(ctx, "lines").size)
        assertEquals(false, rows(ctx, "lines")[2]["vip"])
        assertEquals("the new row is selected", 2, t.selectedRow)

        t.setRowSelectionInterval(1, 1)
        buttons(rendered).first { it.toolTipText == "Move row up" }.doClick()
        assertEquals(listOf("Grace", "Ada", null), rows(ctx, "lines").map { it["name"] })
        buttons(rendered).first { it.toolTipText == "Move row up" }.doClick()
        assertEquals("no move past the top", "Grace", rows(ctx, "lines")[0]["name"])
        buttons(rendered).first { it.toolTipText == "Move row down" }.doClick()
        assertEquals("Ada", rows(ctx, "lines")[0]["name"])

        t.setRowSelectionInterval(2, 2)
        buttons(rendered).first { it.toolTipText == "Remove selected rows" }.doClick()
        assertEquals(listOf("Ada", "Grace"), rows(ctx, "lines").map { it["name"] })
        assertTrue("there is no row-form Edit button when cells edit in place",
            buttons(rendered).none { it.toolTipText == "Edit selected row" })
    }

    fun testARowFormGridIsNotEditedInPlace() {
        val ctx = context()
        val rendered = field(ctx, """{"fieldId":"lines","stereotype":"grid","columns":$gridColumns}""",
            """{"lines":[{"name":"Ada","qty":1.5}]}""")
        val t = table(rendered)
        assertFalse(t.model.isCellEditable(0, 0))
        assertTrue(buttons(rendered).any { it.toolTipText == "Edit selected row" })
        assertEquals("1.5", t.model.getValueAt(0, 1))
    }

    fun testAGridWithOnRowSelectedSendsTheClickedRow() {
        val ctx = context()
        val rendered = field(ctx, """{"fieldId":"guests","stereotype":"grid","onItemSelectionActionId":"onGuest",
            "columns":[{"metadata":{"id":"name","label":"Name"}},{"metadata":{"id":"vip","dataType":"bool"}}]}""",
            """{"guests":[{"name":"Ada","vip":true},{"name":"Grace","vip":false}]}""")
        val t = table(rendered)
        assertEquals(true, t.model.getValueAt(0, 1))
        assertFalse(t.model.isCellEditable(0, 0))
        t.setRowSelectionInterval(1, 1)
        awaitRequests(1)
        assertEquals("onGuest", server.actionIds().single())
        assertEquals("Grace", lastParameters().path("_clickedRow").path("name").asText())
    }

    fun testSliderPasswordAndTextareaWriteTheirValues() {
        val ctx = context()
        val slider = all(field(ctx, """{"fieldId":"pct","label":"Pct","stereotype":"slider","sliderMin":10,"sliderMax":50}""",
            """{"pct":80}""")).filterIsInstance<JSlider>().single()
        assertEquals("clamped into the range", 50, slider.value)
        slider.value = 20
        assertEquals(20, ctx.currentComponentState["pct"])

        val pwd = all(field(ctx, """{"fieldId":"pin","label":"PIN","stereotype":"password"}""")).filterIsInstance<JPasswordField>().single()
        pwd.text = "1234"
        assertEquals("1234", ctx.currentComponentState["pin"])

        val area = all(field(ctx, """{"fieldId":"notes","label":"Notes","stereotype":"markdown"}""", """{"notes":"a"}"""))
            .filterIsInstance<javax.swing.JTextArea>().single()
        area.text = "**b**"
        assertEquals("an editable markdown field edits its source", "**b**", ctx.currentComponentState["notes"])
    }

    fun testReadOnlyMarkupRendersAsHtml() {
        val md = all(field(context(), """{"fieldId":"d","label":"D","stereotype":"markdown","readOnly":true}""",
            """{"d":"# Title\n- one\n\n**bold** text"}""")).filterIsInstance<JEditorPane>().single()
        val html = md.text
        assertTrue(html, html.contains("Title") && html.contains("<li>") && html.contains("<b>bold</b>"))
        val rich = all(field(context(), """{"fieldId":"r","label":"R","stereotype":"richText","readOnly":true}""",
            """{"r":"<p>Hi <b>there</b></p>"}""")).filterIsInstance<JEditorPane>().single()
        assertTrue(rich.text.contains("there"))
    }

    fun testALinkAndAnImagePreviewAreShownReadOnly() {
        val link = field(context(), """{"fieldId":"web","label":"Web","stereotype":"link","readOnly":true}""",
            """{"web":"https://mateu.io"}""")
        assertTrue(texts(link).any { it.contains("https://mateu.io") && it.contains("<a") })
        val img = field(context(), """{"fieldId":"pic","label":"Pic","stereotype":"image"}""", """{"pic":"$PIXEL"}""")
        assertTrue("a data URI becomes an icon", all(img).filterIsInstance<javax.swing.JLabel>().any { it.icon != null })
        val none = field(context(), """{"fieldId":"pic","label":"Pic","stereotype":"image"}""")
        assertTrue(texts(none).contains("—"))
    }

    fun testDeletingAnUploadedImageClearsTheValue() {
        val ctx = context()
        val rendered = field(ctx, """{"fieldId":"avatar","label":"Avatar","stereotype":"uploadableImage"}""", """{"avatar":"$PIXEL"}""")
        val delete = button(rendered, "Delete")
        assertTrue(delete.isEnabled)
        assertEquals("Replace", buttons(rendered).first { it.text == "Replace" }.text)
        delete.doClick()
        assertEquals("", ctx.currentComponentState["avatar"])
        assertFalse("nothing left to delete", delete.isEnabled)
        assertTrue(buttons(rendered).any { it.text == "Upload" })
        assertEquals("Upload Avatar", buttons(rendered).first { it.text == "Upload" }.accessibleContext.accessibleName)
    }

    fun testASignatureIsDrawnAndAcceptedAsAPngDataUri() {
        val ctx = context()
        val rendered = field(ctx, """{"fieldId":"sig","label":"Signature","stereotype":"signature"}""")
        val canvas = all(rendered).filterIsInstance<JComponent>()
            .first { it.mouseMotionListeners.isNotEmpty() && it.preferredSize == Dimension(320, 120) }
        assertEquals("the drawing area carries the field's name", "Signature", canvas.accessibleContext.accessibleName)
        canvas.size = Dimension(320, 120)
        val press = MouseEvent(canvas, MouseEvent.MOUSE_PRESSED, 0, 0, 10, 10, 1, false)
        val drag = MouseEvent(canvas, MouseEvent.MOUSE_DRAGGED, 0, 0, 80, 40, 0, false)
        canvas.mouseListeners.forEach { it.mousePressed(press) }
        canvas.mouseMotionListeners.forEach { it.mouseDragged(drag) }
        assertTrue(painted(paint(canvas, Dimension(320, 120))))
        button(rendered, "Accept").doClick()
        val uri = ctx.currentComponentState["sig"] as String
        assertTrue(uri, uri.startsWith("data:image/png;base64,"))

        val signed = field(ctx, """{"fieldId":"sig","label":"Signature","stereotype":"signature"}""", """{"sig":"$PIXEL"}""")
        button(signed, "Sign again").doClick()
        assertEquals("", ctx.currentComponentState["sig"])
        val readOnly = field(ctx, """{"fieldId":"sig","label":"Signature","stereotype":"signature","readOnly":true}""", """{"sig":"$PIXEL"}""")
        assertTrue(buttons(readOnly).isEmpty())
    }

    fun testAColorFieldShowsTheSwatchOfItsValue() {
        val rendered = field(context(), """{"fieldId":"c","label":"Colour","stereotype":"color"}""", """{"c":"#ff0000"}""")
        assertEquals("#ff0000", buttons(rendered).single().text)
        assertTrue(all(rendered).any { it.background == java.awt.Color(255, 0, 0) })
        assertEquals("Pick…", buttons(field(context(), """{"fieldId":"c","label":"Colour","stereotype":"color"}""")).single().text)
    }

    fun testAReferenceComboOffersTheFieldsRemoteOptions() {
        val ctx = context()
        val rendered = renderFormField(ctx, json("""{"fieldId":"country","label":"Country","dataType":"reference"}"""),
            json("{}"), json("""{"country":{"content":[{"label":"Spain"},{"name":"France"}]}}"""))
        val combo = all(rendered).filterIsInstance<javax.swing.JComboBox<*>>().single()
        assertEquals(-1, combo.selectedIndex)
        assertEquals(listOf("Spain", "France"), (0 until combo.itemCount).map { combo.getItemAt(it) })
        combo.selectedIndex = 1
        assertEquals("France", ctx.currentComponentState["country"])
    }

    fun testALookupSearchesTheServerForItsOptions() {
        val ctx = context()
        val lookup = field(ctx, """{"fieldId":"supplier","label":"Supplier","stereotype":"searchable"}""")
        assertEquals("Select…", buttons(lookup).single().text)
        // opening the popup needs a screen; the search it sends on open does not
        runCatching { buttons(lookup).single().doClick() }
        awaitRequests(1)
        assertEquals("search-supplier", server.actionIds().single())
        assertEquals("", lastParameters().path("searchText").asText())
    }

    fun testAnAmountKeepsItsCurrencyWhenTheValueIsEdited() {
        val ctx = context()
        val input = all(field(ctx, """{"fieldId":"price","label":"Price"}""", """{"price":{"value":10,"currency":"EUR","locale":"es-ES"}}"""))
            .filterIsInstance<JTextComponent>().single()
        input.text = "12,5"
        val committed = ctx.currentComponentState["price"]
        assertTrue("$committed", committed.toString().contains("EUR") && committed.toString().contains("12.5"))
    }

    private companion object {
        // a 1×1 PNG
        const val PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }
}
