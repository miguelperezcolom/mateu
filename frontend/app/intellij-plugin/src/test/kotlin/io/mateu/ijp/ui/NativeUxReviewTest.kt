package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.withFragmentState
import java.awt.Container
import java.util.Locale
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JProgressBar
import javax.swing.text.JTextComponent

/**
 * The fixes of the pre-beta native UX review (design/ux-review/native-findings.md, IJ-xx), pinned
 * through the real renderers.
 */
class NativeUxReviewTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private fun renderer(): ComponentRenderer {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        return ComponentRenderer(ctx)
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    // IJ-05 ───────────────────────────────────────────────────────────────────────────────────
    fun testAServerSideComponentRendersAgainstTheFragmentState() {
        val component = json("""{"type":"ServerSide","initialData":{"mode":"view","nombre":"stale"}}""")
        val merged = withFragmentState(component, json("""{"nombre":"Ada Lovelace","email":"ada@example.com"}"""))
        assertEquals("Ada Lovelace", merged.path("initialData").path("nombre").asText())
        assertEquals("ada@example.com", merged.path("initialData").path("email").asText())
        assertEquals("view", merged.path("initialData").path("mode").asText())
        // the original is untouched, and nothing to merge leaves it as is
        assertEquals("stale", component.path("initialData").path("nombre").asText())
        assertSame(component, withFragmentState(component, json("{}")))
        val clientSide = json("""{"type":"ClientSide"}""")
        assertSame(clientSide, withFragmentState(clientSide, json("""{"a":1}""")))
    }

    // IJ-01 / IJ-02 / IJ-08 ─────────────────────────────────────────────────────────────────
    fun testHeaderBadgeTextIsReadableOnItsBackground() {
        for (color in listOf("success", "error", "warning", "contrast", "normal")) {
            val badge = headerBadge(json("""{"text":"Paid","color":"$color"}"""), emptyMap()) as JLabel
            val ratio = ToneColors.contrast(badge.foreground, badge.background)
            assertTrue("badge '$color' contrast ${"%.2f".format(ratio)}:1", ratio >= 4.5)
        }
    }

    fun testStatusChipsReachAA() {
        for (tone in listOf("SUCCESS", "DANGER", "WARNING", "INFO", "OTHER")) {
            val chip = statusBadge("x", tone) as JLabel
            val ratio = ToneColors.contrast(chip.foreground, chip.background)
            assertTrue("status '$tone' contrast ${"%.2f".format(ratio)}:1", ratio >= 4.5)
        }
    }

    fun testBannersUseTheThemeTones() {
        for (tone in ToneColors.Tone.values()) {
            val ratio = ToneColors.contrast(ToneColors.foreground(), ToneColors.background(tone))
            assertTrue("banner $tone contrast ${"%.2f".format(ratio)}:1", ratio >= 4.5)
        }
    }

    // IJ-03 ───────────────────────────────────────────────────────────────────────────────────
    fun testEveryFilterInputIsNamed() {
        val filters = json(
            """[
              {"fieldId":"id","label":"Id","dataType":"string"},
              {"fieldId":"certified","label":"Certified","dataType":"bool"},
              {"fieldId":"price","label":"Price","stereotype":"numberRange"},
              {"fieldId":"added","label":"Added","stereotype":"dateRange"}
            ]""",
        ).toList()
        val bar = FilterBar(AppContext(AppSession("http://127.0.0.1:9")), filters) {}
        val inputs = all(bar.panel).filter { it is JTextComponent || it is javax.swing.JComboBox<*> }.toList()
        assertTrue(inputs.size >= 6)
        for (input in inputs) {
            val name = (input as JComponent).accessibleContext.accessibleName
            assertFalse("unnamed ${input.javaClass.simpleName}", name.isNullOrBlank())
        }
        val names = inputs.map { (it as JComponent).accessibleContext.accessibleName }
        assertTrue(names.contains("Price from") && names.contains("Price to"))
        assertTrue(names.contains("Id"))
    }

    // IJ-04 ───────────────────────────────────────────────────────────────────────────────────
    fun testAChartCarriesItsDataAsATextAlternative() {
        val chart = renderChart(json("""{"chartType":"bar","chartData":{"labels":["Jan","Feb"],"datasets":[{"data":[120,1800]}]}}"""))
        assertEquals("Bar chart. Jan: 120, Feb: 1.8k", chart.accessibleContext.accessibleName)
        assertEquals("Chart, no data", chartTextAlternative(emptyList(), emptyList(), false))
        assertEquals("3.4M", formatTick(3_400_000.0))
    }

    // IJ-06 ───────────────────────────────────────────────────────────────────────────────────
    fun testAKpiBandIsNotStretchedToTheHeightOfTheChartNextToIt() {
        val grid = json(
            """{"type":"ClientSide","metadata":{"type":"ResponsiveGrid"},"children":[
              {"type":"ClientSide","metadata":{"type":"Scoreboard"},"children":[
                {"type":"ClientSide","metadata":{"type":"MetricCard","title":"Revenue","value":"1.2"}}]},
              {"type":"ClientSide","metadata":{"type":"DashboardPanel","title":"Sales","colSpan":2},"children":[
                {"type":"ClientSide","metadata":{"type":"Chart","chartType":"bar","chartData":{"labels":["a"],"datasets":[{"data":[1]}]}}}]}
            ]}""",
        )
        val rendered = renderer().render(grid, json("{}"), json("{}"))
        rendered.setSize(1000, 900)
        rendered.doLayout()
        val band = rendered.getComponent(0) as JComponent
        assertTrue("the KPI band spans the row (${band.width}px)", band.width > 900)
        assertTrue("the KPI band keeps its own height (${band.height}px)", band.height < band.preferredSize.height + 40)
    }

    // IJ-07 ───────────────────────────────────────────────────────────────────────────────────
    fun testNumericCellsAreFormatted() {
        assertEquals("650", formatNumberCell("650.0", money = false, locale = Locale.US))
        assertEquals("1,234.5", formatNumberCell("1234.5", money = false, locale = Locale.US))
        assertEquals("50.00", formatNumberCell("50.0", money = true, locale = Locale.US))
        assertEquals("n/a", formatNumberCell("n/a", money = false, locale = Locale.US))
        assertTrue(isNumericColumn("double", ""))
        assertTrue(isNumericColumn("string", "money"))
        assertFalse(isNumericColumn("string", ""))
    }

    // IJ-09 ───────────────────────────────────────────────────────────────────────────────────
    fun testImageFieldButtonsSayWhichFieldTheyActOn() {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        val field = uploadableImageField(ctx, "avatar", "", enabled = true, label = "Avatar")
        val buttons = all(field as Container).filterIsInstance<AbstractButton>().toList()
        val names = buttons.map { it.accessibleContext.accessibleName }
        assertTrue(names.toString(), names.containsAll(listOf("Upload Avatar", "Delete Avatar")))
        assertFalse("nothing to delete yet", buttons.first { it.accessibleContext.accessibleName == "Delete Avatar" }.isEnabled)
    }

    // IJ-11 ───────────────────────────────────────────────────────────────────────────────────
    fun testAWizardsProgressSaysWhereTheUserIsAndItsTitleIsAHeading() {
        val bar = renderProgressBar(json("""{"value":0.25,"text":"Step 2"}"""), json("{}")) as JProgressBar
        assertTrue(bar.isStringPainted)
        assertEquals("Step 2", bar.string)
        assertEquals("Step 2", bar.accessibleContext.accessibleName)
        val body = renderer().render(json("""{"type":"ClientSide","metadata":{"type":"Text","text":"Body"}}"""), json("{}"), json("{}"))
        val title = renderer().render(json("""{"type":"ClientSide","metadata":{"type":"Text","text":"Wizard 1","container":"h2"}}"""), json("{}"), json("{}"))
        assertTrue(title.font.isBold)
        assertTrue(title.font.size2D > body.font.size2D)
    }
}
