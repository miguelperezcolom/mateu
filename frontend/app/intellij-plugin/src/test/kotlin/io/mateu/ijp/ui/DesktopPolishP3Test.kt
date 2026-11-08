package io.mateu.ijp.ui

import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import java.awt.Dimension
import java.util.Locale
import javax.swing.JButton
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingConstants

/**
 * The P3 polish of the desktop UX review (design/ux-review/desktop-findings.md, D-15…D-22), pinned
 * through the real renderers.
 */
class DesktopPolishP3Test : RenderTestCase() {

    private fun crud(metadata: String, data: String) =
        ComponentRenderer(context().also { it.currentServerSideType = "x.Products" }).render(
            json("""{"type":"ClientSide","id":"crud1","metadata":$metadata,"children":[]}"""), json("{}"), json(data))

    // D-15 / IJ-16 — dates in the user's locale, the web's rule (order, separator, padding; 4-digit year)
    fun testDatesFollowTheLocaleOrderWithAFourDigitYear() {
        assertEquals("11/5/2026", DateValues.text("2026-05-11", Locale.forLanguageTag("es-ES")))
        assertEquals("5/11/2026", DateValues.text("2026-05-11", Locale.US))
        assertEquals("11.05.2026", DateValues.text("2026-05-11", Locale.GERMANY))
        assertEquals("11/05/2026", DateValues.text("2026-05-11", Locale.UK))
        assertEquals("2026/05/11", DateValues.text("2026-05-11", Locale.JAPAN))
        assertTrue(DateValues.text("2026-05-11T09:30:00", Locale.forLanguageTag("es-ES")).startsWith("11/5/2026 9:30"))
        assertEquals("not a date stays as is", "next week", DateValues.text("next week", Locale.US))
        assertEquals("an ISO value in a column typed string (a LocalDate on the wire)", "5/11/2026",
            DateValues.cellText("2026-05-11", "string", Locale.US))
        assertEquals("other strings are untouched", "P-2026-05", DateValues.cellText("P-2026-05", "string", Locale.US))
        assertEquals("a code that only starts like a date stays", "2026-05-11-A", DateValues.cellText("2026-05-11-A", "string", Locale.US))
        val readOnly = ReadOnlyValues.textOf(json("""{"dataType":"date"}"""), json("\"2026-05-11\""))
        assertEquals(DateValues.text("2026-05-11"), readOnly)
    }

    fun testAListingDateColumnReadsInTheUiLocale() {
        MoneyValues.setAppLocale("de-DE")
        try {
            // the server types a LocalDate listing column as "string": the value's shape decides
            val view = crud("""{"type":"Crud","columns":[{"metadata":{"id":"added","label":"Added","dataType":"string"}}]}""",
                """{"page":{"content":[{"added":"2026-05-11"}],"totalElements":1,"pageNumber":0,"pageSize":10}}""")
            val table = all(view).filterIsInstance<JBTable>().single()
            assertEquals("11.05.2026", table.getValueAt(0, 0))
        } finally {
            MoneyValues.setAppLocale(null)
        }
    }

    // D-16 / IJ-14 — a header lines up with its cells ──────────────────────────────────────────────
    fun testNumericHeadersAlignWithTheirNumbers() {
        assertEquals(ColumnAlign.Align.END, ColumnAlign.of("number"))
        assertEquals(ColumnAlign.Align.END, ColumnAlign.of("string", "money"))
        assertEquals(ColumnAlign.Align.CENTER, ColumnAlign.of("bool"))
        assertEquals(ColumnAlign.Align.START, ColumnAlign.of("string"))
        assertEquals("a declared align wins", ColumnAlign.Align.START, ColumnAlign.of("number", declared = "left"))
        val view = crud("""{"type":"Crud","columns":[{"metadata":{"id":"name","label":"Name"}},
            {"metadata":{"id":"price","label":"Price","dataType":"number"}},{"metadata":{"id":"ok","label":"Ok","dataType":"bool"}}]}""",
            """{"page":{"content":[{"name":"a","price":650,"ok":true}],"totalElements":1}}""")
        val table = all(view).filterIsInstance<JBTable>().single()
        fun headerAlign(col: Int): Int {
            val c = table.tableHeader.defaultRenderer.getTableCellRendererComponent(table, table.getColumnName(col), false, false, -1, col)
            return (c as JLabel).horizontalAlignment
        }
        assertEquals(SwingConstants.LEADING, headerAlign(0))
        assertEquals(SwingConstants.TRAILING, headerAlign(1))
        assertEquals(SwingConstants.CENTER, headerAlign(2))
        assertEquals("the header painted after the numeric one is aligned again", SwingConstants.LEADING, headerAlign(0))
    }

    // D-17 — status chips are pills centred in the row ─────────────────────────────────────────────
    fun testStatusChipsAreCentredPills() {
        val view = crud("""{"type":"Crud","columns":[{"metadata":{"id":"status","label":"Status","dataType":"status"}}]}""",
            """{"page":{"content":[{"status":{"type":"SUCCESS","message":"Available"}}],"totalElements":1}}""")
        val table = all(view).filterIsInstance<JBTable>().single()
        val cell = table.getCellRenderer(0, 0).getTableCellRendererComponent(table, table.getValueAt(0, 0), false, false, 0, 0) as JPanel
        cell.setSize(200, table.rowHeight)
        cell.doLayout()
        val chip = cell.components.single() as RoundedChip
        assertEquals("Available", chip.text)
        assertFalse("a pill paints its own rounded fill", chip.isOpaque)
        val above = chip.y
        val below = table.rowHeight - chip.y - chip.height
        assertTrue("centred: $above above, $below below", kotlin.math.abs(above - below) <= 1)
    }

    // D-18 — the calendar's weekday row is as tall as its text ─────────────────────────────────────
    fun testTheMonthViewHasNoEmptyBandUnderTheWeekdays() {
        val view = render(context(), """{"type":"Calendar","month":"2026-03-01","events":[{"id":"e","title":"Retro","date":"2026-03-27"}]}""")
        val weekdays = all(view).filterIsInstance<JPanel>().single { it.name == "calendar-weekdays" }
        assertEquals(7, weekdays.componentCount)
        assertTrue("the header row is a text line, not a day cell: ${weekdays.preferredSize.height}",
            weekdays.preferredSize.height < JBUI.scale(30))
    }

    // D-19 — a read-only checkbox is a value ───────────────────────────────────────────────────────
    fun testAReadOnlyBooleanIsAValueNotADisabledCheckbox() {
        val view = renderFormField(context(), json("""{"fieldId":"certified","label":"Certified","dataType":"bool","readOnly":true}"""),
            json("""{"certified":true}"""), json("{}"))
        assertTrue(all(view).none { it is javax.swing.JCheckBox })
        assertEquals(listOf("Certified", "✓"), texts(view))
        val value = all(view).filterIsInstance<JLabel>().last()
        assertEquals("Certified", value.accessibleContext.accessibleName)
        assertEquals("Yes", value.accessibleContext.accessibleDescription)
        val off = renderFormField(context(), json("""{"fieldId":"c","label":"Certified","dataType":"bool","readOnly":true}"""),
            json("""{"c":false}"""), json("{}"))
        assertEquals("No", all(off).filterIsInstance<JLabel>().last().accessibleContext.accessibleDescription)
        // a DISABLED one (a rule, `disabled`) keeps its control: there the input is the message
        val disabled = renderFormField(context(), json("""{"fieldId":"c","label":"Certified","dataType":"bool","disabled":true}"""),
            json("""{"c":true}"""), json("{}"))
        assertTrue(all(disabled).any { it is javax.swing.JCheckBox && !it.isEnabled })
    }

    // D-20 — the platform's pager ──────────────────────────────────────────────────────────────────
    fun testThePagerUsesIconButtonsAndAPlainCaption() {
        assertEquals("Page 2 of 20 · 200 items", pagerText(1, 20, 200))
        assertEquals("Page 1 of 1 · 1 item", pagerText(0, 1, 1))
        val view = crud("""{"type":"Crud","columns":[{"metadata":{"id":"name","label":"Name"}}]}""",
            """{"page":{"content":[{"name":"a"}],"totalElements":25,"pageNumber":0,"pageSize":10}}""")
        val pager = buttons(view).filter { it.accessibleContext.accessibleName in setOf("Previous page", "Next page") }
        assertEquals(2, pager.size)
        pager.forEach {
            assertNotNull("an icon button", it.icon)
            assertTrue(it.text.isNullOrEmpty())
            assertTrue("keyboard reachable", it.isFocusable)
            assertEquals("square", (it as JButton).getClientProperty("JButton.buttonType"))
        }
    }

    // D-21 — the RAIL's divider ────────────────────────────────────────────────────────────────────
    fun testACssSideBorderBecomesTheThemeDivider() {
        val rule = SideRule.of("flex: 0 0 15rem; border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); padding-left: 1.5rem;")
        assertEquals(SideRule(1, 0, 24, 0), rule)
        assertNull(SideRule.of("flex: 1; padding-left: 1rem"))
        assertNull(SideRule.of("border-left: none"))
        val row = render(context(), """{"type":"HorizontalLayout"}""",
            children = """[{"type":"ClientSide","metadata":{"type":"Text","text":"form"},"style":"flex: 1","children":[]},
                {"type":"ClientSide","metadata":{"type":"Text","text":"rail"},"style":"flex: 0 0 15rem; border-left: 1px solid #ccc; padding-left: 1.5rem","children":[]}]""")
        val rail = row.components[1] as javax.swing.JComponent
        val insets = rail.border.getBorderInsets(rail)
        assertEquals(JBUI.scale(1) + JBUI.scale(24), insets.left)
    }

    // D-22 — rows start at the edge ────────────────────────────────────────────────────────────────
    fun testARowsFirstItemStartsAtTheEdge() {
        val row = flushRow(8)
        val a = JButton("Do nothing"); val b = JButton("Edit")
        row.add(a); row.add(b)
        val pref = row.preferredSize
        assertEquals(a.preferredSize.width + JBUI.scale(8) + b.preferredSize.width, pref.width)
        row.size = pref
        row.doLayout()
        assertEquals("no gap before the first item", 0, a.x)
        assertEquals(a.width + JBUI.scale(8), b.x)
        assertEquals("fits on one line at its preferred width", a.y, b.y)
        // too narrow: the second item wraps to a new line, again at the edge
        row.size = Dimension(a.preferredSize.width + 4, pref.height * 2)
        row.doLayout()
        assertEquals(0, b.x)
        assertTrue(b.y > a.y)
        // the page header's toolbar is such a row
        val header = render(context(), """{"type":"Form","title":"Product","toolbar":[{"type":"Button","label":"Edit","actionId":"edit"}]}""")
        val edit = buttons(header).single { it.text == "Edit" }
        assertTrue((edit.parent as JPanel).layout is FlushFlowLayout)
    }
}
