package io.mateu.ijp.ui

import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JTable

/** The desktop widgets of the Explorer review (stream D2), rendered through the real dispatcher. */
class DesktopWidgetsRenderTest : RenderTestCase() {

    fun testAnAccordionWithNoActivePanelStartsFolded() {
        val view = render(context(), """{"type":"AccordionLayout"}""",
            """[{"type":"ClientSide","metadata":{"type":"AccordionPanel","label":"More options","active":false},
                 "children":[{"type":"ClientSide","metadata":{"type":"Text","text":"Hidden notes"}}]}]""")
        val toggle = buttons(view).first { it.text.contains("More options") }
        assertTrue(toggle.text.startsWith("▸"))
        val hidden = all(view).filterIsInstance<javax.swing.JLabel>().first { it.text == "Hidden notes" }
        assertFalse(hidden.isShowingInTree())
        toggle.doClick()
        assertTrue(hidden.isShowingInTree())
    }

    private fun java.awt.Component.isShowingInTree(): Boolean =
        generateSequence(this) { it.parent }.takeWhile { it !is javax.swing.CellRendererPane }.all { it.isVisible }

    fun testAFoldoutFoldsItsClosedPanelsAndDrawsItsNavigation() {
        val view = render(context(), """{"type":"FoldoutLayout","headerTitle":"Light",
              "panels":[{"title":"Works","open":true},{"title":"Budget","open":false}],
              "navigation":{"title":"Light","parentLabel":"Exhibitions","parentActionId":"up","previousActionId":"prev","nextActionId":"next"}}""",
            """[{"type":"ClientSide","slot":"overview","metadata":{"type":"Text","text":"Overview"}},
                {"type":"ClientSide","slot":"panel-0","metadata":{"type":"Text","text":"Works list"}},
                {"type":"ClientSide","slot":"panel-1","metadata":{"type":"Text","text":"Budget detail"}}]""")
        assertTrue(all(view).any { it is FoldedStrip })
        assertFalse(texts(view).contains("Budget detail"))
        assertTrue(texts(view).contains("Works list"))
        val next = buttons(view).first { it.accessibleContext.accessibleName == "Next" }
        next.doClick()
        awaitRequests(1)
        assertEquals("next", server.actionIds().last())
    }

    fun testATreeGridExpandsARowOnTheToggle() {
        val view = render(context(), """{"type":"Grid","tree":true,
              "content":[{"type":"ClientSide","metadata":{"type":"GridColumn","id":"name","label":"Department"}}],
              "page":{"content":[{"name":"Paintings","children":[{"name":"Baroque"}]}]}}""")
        val table = all(view).filterIsInstance<JTable>().first()
        assertEquals(1, table.rowCount)
        assertEquals("▸ Paintings", table.getValueAt(0, 0))
        val rect = table.getCellRect(0, 0, true)
        table.size = java.awt.Dimension(400, 200)
        for (l in table.mouseListeners) l.mouseClicked(java.awt.event.MouseEvent(table, java.awt.event.MouseEvent.MOUSE_CLICKED, 0, 0, rect.x + 2, rect.y + 2, 1, false))
        assertEquals(2, table.rowCount)
        assertTrue((table.getValueAt(1, 0) as String).endsWith("Baroque"))
    }

    fun testAGridFormatsAmountsAndHonoursAFixedWidth() {
        MoneyValues.setAppLocale("en")
        try {
            val view = render(context(), """{"type":"Grid",
                  "content":[{"type":"ClientSide","metadata":{"type":"GridColumn","id":"work","label":"Work","width":"14rem","flexGrow":"0"}},
                             {"type":"ClientSide","metadata":{"type":"GridColumn","id":"insurance","label":"Insured","dataType":"money","align":"end"}}],
                  "page":{"content":[{"work":"The Starry Night","insurance":82000000}]}}""")
            val table = all(view).filterIsInstance<JTable>().first()
            assertEquals("82,000,000.00", table.getValueAt(0, 1))
            assertEquals(com.intellij.util.ui.JBUI.scale(224), table.columnModel.getColumn(0).maxWidth)
        } finally {
            MoneyValues.setAppLocale(null)
        }
    }

    fun testAButtonLabelFollowsTheState() {
        val ctx = context()
        ctx.currentComponentState["nights"] = 3
        val button = render(ctx, """{"type":"Button","label":"Charge ${'$'}{state.nights} nights","actionId":"charge","color":"success","buttonStyle":"primary"}""") as JButton
        assertEquals("Charge 3 nights", button.text)
        ctx.putState("nights", 5)
        assertEquals("Charge 5 nights", button.text)
        assertEquals("SUCCESS", button.getClientProperty(BUTTON_TONE))
    }

    fun testADoughnutChartIsNamedAsOne() {
        val chart = render(context(), """{"type":"Chart","chartType":"doughnut","chartData":{"labels":["A","B"],"datasets":[{"data":[1,2]}]}}""")
        assertEquals("Doughnut chart. A: 1, B: 2", chart.accessibleContext.accessibleName)
        assertTrue(painted(paint(chart)))
    }

    fun testACardDrawsItsSubtitlePrefixAndSuffix() {
        val view = render(context(), """{"type":"Card",
              "headerPrefix":{"type":"ClientSide","metadata":{"type":"Avatar","name":"Marta Ruiz"}},
              "title":{"type":"ClientSide","metadata":{"type":"Text","text":"Marta Ruiz"}},
              "subtitle":{"type":"ClientSide","metadata":{"type":"Text","text":"Housekeeping"}},
              "headerSuffix":{"type":"ClientSide","metadata":{"type":"Badge","text":"On shift","color":"success"}}}""")
        val t = texts(view)
        assertTrue(t.toString(), t.containsAll(listOf("Marta Ruiz", "Housekeeping", "On shift", "MR")))
    }

    fun testAPageWithTocShowsAnIndexOfItsSections() {
        val section = { title: String ->
            """{"type":"ClientSide","cssClasses":"mateu-section","metadata":{"type":"Card","variants":["outlined"],
                "content":{"type":"ClientSide","metadata":{"type":"Text","container":"h3","text":"$title"}}}}"""
        }
        val view = render(context(), """{"type":"Page","title":"Handbook","toc":true}""",
            "[${section("Arrival")},${section("Rooms")}]")
        assertNotNull(all(view).filterIsInstance<JComponent>().firstOrNull { it.accessibleContext.accessibleName == "Sections index" })
        assertTrue(buttons(view).any { it.text == "Rooms" })
    }

    fun testAClosableBannerHasADismissButton() {
        val banner = renderBanner(json("""{"title":"Overbooking risk","theme":"WARNING","hasCloseButton":true}"""))
        val close = buttons(banner).first { it.text == "✕" }
        val host = javax.swing.JPanel().apply { add(banner) }
        close.doClick()
        assertFalse(banner.isVisible)
        assertNotNull(host)
    }

    fun testAFilterableListingWithoutSearchStillHasItsFilters() {
        val view = render(context(), """{"type":"Crud","searchable":false,
              "filters":[{"type":"FormField","fieldId":"price","label":"Price","dataType":"number","stereotype":"numberRange"}],
              "columns":[{"type":"ClientSide","metadata":{"type":"GridColumn","id":"name","label":"Name"}}]}""")
        assertTrue(buttons(view).any { it.text == "Filters" })
        assertFalse(all(view).any { it is com.intellij.ui.SearchTextField })
    }

    fun testCollectionChoicesAreCheckboxesAndAListBox() {
        val opts = """[{"value":"A","label":"Alpha"},{"value":"B","label":"Beta"}]"""
        val boxes = render(context(), """{"type":"FormField","fieldId":"extras","label":"Extras","dataType":"array","stereotype":"checkbox","options":$opts}""")
        assertEquals(2, all(boxes).filterIsInstance<javax.swing.JCheckBox>().count())
        assertFalse(all(boxes).any { it is JTable })
        val list = render(context(), """{"type":"FormField","fieldId":"bed","label":"Bed","dataType":"string","stereotype":"listBox","options":$opts}""")
        assertTrue(all(list).any { it is javax.swing.JList<*> })
    }
}
