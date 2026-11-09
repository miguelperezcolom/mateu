package io.mateu.ijp.ui

import com.intellij.ide.ui.laf.darcula.ui.DarculaButtonUI
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.state.ToolbarSpecs
import java.awt.Color
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JPanel
import javax.swing.text.JTextComponent

/**
 * The fixes of the desktop UX review (design/ux-review/desktop-findings.md, D-xx), pinned through
 * the real renderers.
 */
class DesktopPolishTest : RenderTestCase() {

    private fun md(s: String) = MarkdownHtml.toHtml(s)

    // D-01 / D-02 — a YAML record page (a Form) has a real page header ─────────────────────────
    fun testAFormHeaderIsInterpolatedAndKeepsItsToolbar() {
        val ctx = context()
        val view = render(ctx, """{"type":"Form","title":"${'$'}{state.name}","subtitle":"Character of ${'$'}{state.homeworld}",
            "toolbar":[{"type":"Button","label":"Back to People","actionId":"backToList","route":"people"},
                       {"type":"Button","label":"Edit","actionId":"edit","buttonStyle":"primary"}]}""",
            state = """{"name":"Luke Skywalker","homeworld":"Tatooine"}""")
        val shown = texts(view)
        assertTrue(shown.toString(), "Luke Skywalker" in shown)
        assertTrue(shown.toString(), "Character of Tatooine" in shown)
        assertFalse("no raw template left", shown.any { it.contains("\${") })
        assertEquals(listOf("Back to People", "Edit"), buttons(view).map { it.text })
        assertTrue("a form that is the page gets the page gutter", view.border.getBorderInsets(view).left >= JBUI.scale(PageChrome.GUTTER))
    }

    fun testATemplateThatOwnsTheHeaderGetsNone() {
        val view = render(context(), """{"type":"Form","title":"Star Wars","noHeader":true}""")
        assertFalse(texts(view).contains("Star Wars"))
    }

    fun testComponentTextsAreInterpolated() {
        val ctx = context()
        val view = render(ctx, """{"type":"Text","text":"Image: ${'$'}{state.credit}"}""", state = """{"credit":"SMK · Public domain"}""")
        assertEquals(listOf("Image: SMK · Public domain"), texts(view))
    }

    fun testALongParagraphWrapsAndAHeadingStaysALabel() {
        val long = "Only public-domain works belong here. Link the museum's own image URLs — never a copy you host yourself."
        val view = render(context(), """{"type":"Text","text":"$long"}""")
        val area = all(view).filterIsInstance<javax.swing.JTextArea>().single()
        assertTrue(area.lineWrap && !area.isEditable)
        assertEquals(long, area.text)
        val heading = render(context(), """{"type":"Text","container":"h3","text":"$long"}""")
        assertTrue(all(heading).none { it is javax.swing.JTextArea })
        assertEquals("short texts stay labels", listOf("Gallery"), texts(render(context(), """{"type":"Text","text":"Gallery"}""")))
    }

    // D-03 — primary buttons get the platform default look; RouteLink buttons navigate ───────────
    fun testThePrimaryButtonUsesTheDefaultButtonStyle() {
        val button = renderButton(context(), json("""{"label":"Save","actionId":"save","buttonStyle":"primary"}""")) as JButton
        assertTrue(DarculaButtonUI.isDefaultButton(button))
        assertNull("not the Got It tooltip style", button.getClientProperty("gotItButton"))
        val plainButton = renderButton(context(), json("""{"label":"Cancel","actionId":"cancel"}""")) as JButton
        assertFalse(DarculaButtonUI.isDefaultButton(plainButton))
    }

    fun testAButtonWithARouteNavigatesInsteadOfRunningItsActionId() {
        val ctx = context()
        val button = renderButton(ctx, json("""{"label":"Back to People","actionId":"backToList","route":"people"}""")) as JButton
        button.doClick()
        awaitRequests(1)
        val sent = server.requests.last()
        assertEquals("people", sent.path("route").asText().trim('/'))
        assertTrue("no action is run", sent.path("actionId").asText().isEmpty())
        // the native host toolbar keeps the route too
        val spec = ToolbarSpecs.of(listOf(json("""{"label":"Back","actionId":"backToList","route":"people"}"""))) { emptyMap() }.single()
        assertEquals("people", spec.route)
    }

    // D-04 — read-only values are text ─────────────────────────────────────────────────────────
    fun testReadOnlyValuesReadAsText() {
        fun text(metadata: String, value: String) = ReadOnlyValues.textOf(json(metadata), json(value))
        assertEquals("Available", text("""{"options":[{"value":"A","label":"Available"}]}""", "\"A\""))
        assertEquals(ReadOnlyValues.EMPTY, text("""{}""", "null"))
        assertEquals("••••••••", text("""{"stereotype":"password"}""", "\"secret\""))
        assertEquals("77", ReadOnlyValues.numberText("77.0", java.util.Locale.ENGLISH))
        assertEquals("1,234.5", ReadOnlyValues.numberText("1234.50", java.util.Locale.ENGLISH))
        assertEquals("not a number stays as is", "n/a", ReadOnlyValues.numberText("n/a"))
        // a field with its own widget keeps it
        assertNull(text("""{"dataType":"bool"}""", "true"))
        assertNull(text("""{"stereotype":"image"}""", "\"x.png\""))
        assertNull(text("""{"dataType":"money"}""", "12"))

        val ctx = context()
        val view = renderFormField(ctx, json("""{"fieldId":"status","label":"Status","readOnly":true,"required":true,
            "options":[{"value":"A","label":"Available"}]}"""), json("""{"status":"A"}"""), json("{}"))
        val value = all(view).filterIsInstance<JTextComponent>().single()
        assertEquals("Available", value.text)
        assertFalse(value.isEditable)
        assertEquals("no required marker on a value nobody fills in", "Status", texts(view).first())
    }

    // D-05 — surfaces follow the theme ─────────────────────────────────────────────────────────
    fun testKanbanColumnsAndSkeletonsTakeTheirColoursFromTheTheme() {
        val expected = SurfaceColors.mix(UIUtil.getPanelBackground(), UIUtil.getLabelForeground(), 0.05)
        assertEquals(expected.rgb, SurfaceColors.tint.rgb)
        val board = render(context(), """{"type":"Kanban","columns":[{"title":"Doing","cards":[{"title":"Card A"}]}]}""")
        val column = all(board).filterIsInstance<JPanel>().first { it.isOpaque && it.background == SurfaceColors.tint }
        assertNotSame(Color(0xF4, 0xF4, 0xF5), column.background)
        val skeleton = render(context(), """{"type":"Skeleton","variant":"text"}""")
        assertTrue(all(skeleton).filterIsInstance<JPanel>().any { it.background == SurfaceColors.placeholder })
    }

    // D-06 — the foldout keeps its panel widths; markdown tables and headings render ─────────────
    fun testFoldoutPanelsKeepTheirDeclaredWidth() {
        val view = render(context(), """{"type":"FoldoutLayout","headerTitle":"Booking","panels":[{"title":"Payments","width":"38rem"}]}""",
            children = """[{"slot":"overview","type":"ClientSide","metadata":{"type":"Text","text":"Guest"}},
                           {"slot":"panel-0","type":"ClientSide","metadata":{"type":"Text","text":"Deposit"}}]""")
        val widths = all(view).filterIsInstance<JPanel>().map { it.preferredSize.width }.toList()
        assertTrue("overview 22rem: $widths", JBUI.scale(352) in widths)
        assertTrue("panel 38rem: $widths", JBUI.scale(608) in widths)
    }

    fun testMarkdownTablesHeadingsAndLinks() {
        val table = md("| Date | Concept |\n|---|---|\n| 02/05 | Deposit |")
        assertTrue(table, table.contains("<table") && table.contains("<th align='left'>Date</th>") && table.contains("<td>Deposit</td>"))
        assertFalse(table.contains("|"))
        val heading = md("### Ergonomic chair")
        assertTrue(heading, heading.contains("<b>Ergonomic chair</b>") && !heading.contains("###"))
        assertTrue(md("1. one\n2. two").contains("<ol><li>one</li><li>two</li></ol>"))
        assertTrue(md("[docs](https://mateu.io)").contains("<a href=\"https://mateu.io\">docs</a>"))
        assertFalse("a javascript: link stays text", md("[x](javascript:alert(1))").contains("<a"))
        assertFalse("data is escaped", md("<img src=x> **b**").contains("<img"))
        val pane = all(render(context(), """{"type":"Markdown","markdown":"# Title"}""")).filterIsInstance<JEditorPane>().single()
        assertTrue(pane.text.contains("Title"))
    }

    // D-07 — composed pages get the page gutter; flex columns keep their widths ──────────────────
    fun testComposedPagesGetAGutterAndIslandsDoNot() {
        fun ssc(pageType: String?, rootType: String) = json("""{"type":"ServerSide",${if (pageType != null) "\"pageType\":\"$pageType\"," else ""}
            "children":[{"type":"ClientSide","metadata":{"type":"$rootType"}}]}""")
        assertTrue(PageChrome.padsAsPage(ssc("process", "HorizontalLayout")))
        assertTrue(PageChrome.padsAsPage(ssc("dashboard", "ResponsiveGrid")))
        assertFalse("a Page pads itself", PageChrome.padsAsPage(ssc("form", "Page")))
        assertFalse("a Form pads itself", PageChrome.padsAsPage(ssc("detail", "Form")))
        assertFalse("an island has no pageType", PageChrome.padsAsPage(ssc(null, "VerticalLayout")))
    }

    fun testFlexStylesBecomeColumnWeightsAndFixedWidths() {
        assertEquals(FlexSpec(100.0), FlexSpec.of("flex: 1; min-width: 0;"))
        assertEquals(FlexSpec(0.0, 240), FlexSpec.of("flex: 0 0 15rem; align-self: flex-start;"))
        assertEquals(FlexSpec(64.0), FlexSpec.of("flex: 1 1 calc(64% - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);"))
        assertEquals(FlexSpec(36.0), FlexSpec.of("flex: 0 0 36%"))
        assertNull(FlexSpec.of("width: 100%"))
        val row = render(context(), """{"type":"HorizontalLayout"}""", children = """[
            {"type":"ClientSide","style":"flex: 1; min-width: 0;","metadata":{"type":"Text","text":"Form"}},
            {"type":"ClientSide","style":"flex: 0 0 15rem;","metadata":{"type":"Text","text":"Rail"}}]""")
        assertTrue(all(row).filterIsInstance<JComponent>().any { it.preferredSize.width == JBUI.scale(240) })
    }

    // D-08 — font sizes follow the IDE's label size ────────────────────────────────────────────
    fun testFontSizesScaleWithTheIdeFont() {
        assertEquals(20f, PageChrome.fontSize(20f, labelSize = 13f))
        assertEquals(30f, PageChrome.fontSize(20f, labelSize = 19.5f))
    }

    // D-09 — the navigator menu is a tree ─────────────────────────────────────────────────────
    fun testMenuNodesDropSeparatorsAndNestGroups() {
        val nodes = MenuTree.nodesOf(json("""[{"label":"Sales","submenus":[{"label":"Orders","route":"/o"}]},
            {"separator":true},{"label":"Settings","route":"/s"},{"label":"Empty group","submenus":[]}]""").toList())
        assertEquals(listOf("Sales", "Settings", "Empty group"), nodes.map { it.label })
        assertTrue(nodes[0].isGroup)
        assertEquals("Orders", nodes[0].children.single().label)
        assertFalse("an entry with no submenus is a leaf", nodes[2].isGroup)
    }

    // D-10 — hero call-to-actions share one row ────────────────────────────────────────────────
    fun testHeroButtonsShareOneRow() {
        val hero = render(context(), """{"type":"HeroSection","title":"Front desk"}""", children = """[
            {"type":"ClientSide","metadata":{"type":"Button","label":"Start","actionId":"start","buttonStyle":"primary"}},
            {"type":"ClientSide","metadata":{"type":"Button","label":"Dashboard","actionId":"dash"}}]""")
        val ctas = buttons(hero)
        assertEquals(2, ctas.size)
        assertSame("same row", ctas[0].parent, ctas[1].parent)
        assertTrue(ctas[0].parent.preferredSize.height > 0)
    }
}
