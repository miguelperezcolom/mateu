package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/**
 * The pure rules behind the desktop widgets of the Explorer review (stream D2): chart kinds, grid
 * cells and trees, CSS tracks and areas, field values, page width / toc, drawer sizes, icons.
 */
class DesktopWidgetsModelTest : TestCase() {
    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    // ── charts ──
    fun testEveryChartTypeIsItsOwnKindNotABarChart() {
        assertEquals(ChartKind.DOUGHNUT, ChartKind.of("doughnut"))
        assertEquals(ChartKind.RADAR, ChartKind.of("radar"))
        assertEquals(ChartKind.PIE, ChartKind.of("pie"))
        assertEquals(ChartKind.POLAR_AREA, ChartKind.of("polarArea"))
        assertEquals(ChartKind.LINE, ChartKind.of("line"))
        assertEquals(ChartKind.BAR, ChartKind.of("bar"))
    }

    fun testTheTextAlternativeNamesTheKindAndEveryDataset() {
        val doughnut = ChartModel.of(json("""{"chartType":"doughnut","chartData":{"labels":["Paintings","Sculpture"],"datasets":[{"label":"Pieces","data":[412,138]}]}}"""))
        assertEquals("Doughnut chart. Paintings: 412, Sculpture: 138", chartTextAlternative(doughnut))
        val bars = ChartModel.of(json("""{"chartType":"bar","chartData":{"labels":["Mon"],"datasets":[{"label":"Visitors","data":[1200]},{"label":"Members","data":[300]}]}}"""))
        assertEquals(2, bars.series.size)
        assertEquals("Bar chart. Visitors — Mon: 1.2k; Members — Mon: 300", chartTextAlternative(bars))
    }

    fun testAHeatmapNamesItsBusiestDay() {
        val alt = heatmapTextAlternative(json("""{"cells":[{"date":"2026-10-01","value":3},{"date":"2026-10-02","value":9,"label":"9 groups"}]}"""))
        assertEquals("Heatmap, 2 days. Busiest 2026-10-02: 9 (9 groups)", alt)
    }

    // ── grid ──
    fun testGridCellsFormatAmountsNumbersAndKeepOtherText() {
        java.util.Locale.setDefault(java.util.Locale.UK)
        MoneyValues.setAppLocale("en")
        assertEquals("82,000,000.00", GridTables.cellText(json("82000000"), json("""{"dataType":"money"}""")))
        assertEquals("1888", GridTables.cellText(json("1888"), json("""{"dataType":"string"}""")))
        assertEquals("", GridTables.cellText(json("null"), json("{}")))
        MoneyValues.setAppLocale(null)
    }

    fun testATreeGridShowsChildrenOfExpandedRowsOnly() {
        val rows = json("""[{"name":"Paintings","children":[{"name":"Impressionism"},{"name":"Baroque"}]},{"name":"Sculpture","children":[{"name":"Bronze"}]}]""").toList()
        assertEquals(listOf("Paintings", "Sculpture"), GridTables.flatten(rows, emptySet()).map { it.row.path("name").asText() })
        val open = GridTables.flatten(rows, setOf("0"))
        assertEquals(listOf("Paintings", "Impressionism", "Baroque", "Sculpture"), open.map { it.row.path("name").asText() })
        assertEquals(1, open[1].depth)
        assertTrue(open[0].hasChildren)
        assertEquals("▾ Paintings", GridTables.treeCellText(open[0], "Paintings", true))
        assertEquals("       Impressionism", GridTables.treeCellText(open[1], "Impressionism", false))
    }

    fun testAColumnWidthPlanReadsWidthAutoWidthAndFlexGrow() {
        assertEquals(GridTables.WidthPlan(224, false, true), GridTables.widthPlan(json("""{"width":"14rem","autoWidth":false}""")))
        assertEquals(GridTables.WidthPlan(null, true, false), GridTables.widthPlan(json("""{"autoWidth":true,"flexGrow":"0"}""")))
        assertEquals(GridTables.WidthPlan(96, false, false), GridTables.widthPlan(json("""{"width":"6rem","flexGrow":"0"}""")))
    }

    fun testCardsLayoutIsDeclaredNotInferred() {
        assertTrue(ListingCards.isCardLayout("cards"))
        assertTrue(ListingCards.isCardLayout("list"))
        assertFalse(ListingCards.isCardLayout("auto"))
    }

    // ── responsive grid ──
    fun testTracksReadFixedFractionAndAutoColumns() {
        assertEquals(
            listOf(ResponsiveGrids.Track.Fixed(160), ResponsiveGrids.Track.Fraction(1.0), ResponsiveGrids.Track.Auto),
            ResponsiveGrids.tracks("10rem 1fr auto"))
        assertEquals(3, ResponsiveGrids.tracks("repeat(3, 1fr)").size)
        assertEquals(ResponsiveGrids.Track.Fraction(1.0), ResponsiveGrids.tracks("minmax(10rem, 1fr) 2fr")[0])
    }

    fun testNamedAreasPlaceAChildByItsSlot() {
        val areas = ResponsiveGrids.areas("\"main aside\" \"footer footer\"")
        assertEquals(ResponsiveGrids.Cell(0, 1, 1, 1), ResponsiveGrids.cellOf(areas, "aside"))
        assertEquals(ResponsiveGrids.Cell(1, 0, 1, 2), ResponsiveGrids.cellOf(areas, "footer"))
        assertNull(ResponsiveGrids.cellOf(areas, "nope"))
    }

    // ── layout specs ──
    fun testFlexGrowInAStyleIsAWeight() {
        assertEquals(FlexSpec(200.0), FlexSpec.ofGrow("background: x; flex-grow: 2;"))
        assertNull(FlexSpec.ofGrow("padding: 1rem"))
        assertEquals(352, cssPx("height: 240px; width: 22rem;", "width"))
        assertEquals(240, cssPx("height: 240px; width: 22rem;", "height"))
        assertNull(cssPx("max-width: 24rem", "width"))
    }

    // ── fields ──
    fun testALookupShowsTheLabelTheServerSentNotTheId() {
        val data = json("""{"guestId-label":"Alan Turing"}""")
        assertEquals("Alan Turing", FieldValues.lookupLabel(data, "guestId", "g2"))
        val page = json("""{"guestId":{"content":[{"value":"g2","label":"Ada"}]}}""")
        assertEquals("Ada", FieldValues.lookupLabel(page, "guestId", "g2"))
        assertEquals("g9", FieldValues.lookupLabel(json("{}"), "guestId", "g9"))
    }

    fun testAFileUploadValueIsTheWebsDataUri() {
        val uri = FieldValues.dataUri("spec sheet.pdf", "hi".toByteArray())
        assertTrue(uri, uri.startsWith("data:application/pdf;name=spec%20sheet.pdf;base64,"))
        assertEquals("spec sheet.pdf (2 B)", FieldValues.fileSummary(uri))
        assertEquals("No file chosen", FieldValues.fileSummary(""))
        assertEquals(listOf("pdf", "txt"), FieldValues.acceptedExtensions(json("""{"attributes":[{"key":"accept","value":".pdf,.txt"}]}""")))
    }

    fun testTimesAndWholeNumbersReadAsTheWebShowsThem() {
        assertEquals(java.time.LocalTime.of(9, 30), FieldValues.time("2026-11-08T09:30:00"))
        assertEquals(java.time.LocalDateTime.of(2026, 11, 8, 0, 0), FieldValues.dateTime("2026-11-08"))
        assertEquals("250", FieldValues.numberInputText("250.0"))
        assertEquals("250.5", FieldValues.numberInputText("250.5"))
    }

    // ── page level ──
    fun testPageWidthPlans() {
        assertEquals(PageLevel.WidthPlan(null, 24), PageLevel.widthPlan("fullWidth", 900))
        assertEquals(PageLevel.WidthPlan(null, 0), PageLevel.widthPlan("edgeToEdge", 900))
        assertEquals(PageLevel.WidthPlan(1392, PageChrome.GUTTER), PageLevel.widthPlan("fixed", null))
        assertEquals("fullWidth", PageLevel.pageWidthOf(json("""{"pageType":"collection"}""")))
        assertEquals("", PageLevel.pageWidthOf(json("""{"pageType":"form"}""")))
    }

    fun testCompactAndTocDecisions() {
        assertTrue(PageLevel.isCompact(";--lumo-space-m:0.3rem;--mateu-compact:1;"))
        assertFalse(PageLevel.isCompact("max-width: 900px"))
        assertTrue(PageLevel.showsToc(json("true"), 2))
        assertFalse(PageLevel.showsToc(json("false"), 9))
        assertTrue(PageLevel.showsToc(json("null"), 5))
        assertFalse(PageLevel.showsToc(json("null"), 4))
        val section = json("""{"cssClasses":"mateu-section","metadata":{"type":"Card","content":{"type":"ClientSide","metadata":{"type":"Text","container":"h3","text":"Rooms"}}}}""")
        assertTrue(PageLevel.isSection(section))
        assertEquals("Rooms", PageLevel.sectionTitle(section))
    }

    fun testDrawerSizes() {
        assertEquals(648, DrawerChrome.widthPx("", "m", 1400))
        assertEquals(320, DrawerChrome.widthPx("20rem", "m", 1400))
        assertEquals(448, DrawerChrome.widthPx("", "", 1400))
        assertEquals("l", DrawerChrome.nextSize("m"))
        assertEquals("xl", DrawerChrome.nextSize("xl"))
        assertTrue(DrawerChrome.hasHeader(json("""{"subtitle":"Margaret Hamilton"}""")))
        assertFalse(DrawerChrome.hasHeader(json("""{"headerTitle":"x"}""")))
    }

    // ── icons / buttons / bpmn ──
    fun testWireIconsNeverPrintTheirName() {
        assertNotNull(wireIcon("vaadin:plus"))
        assertNull(wireIcon("vaadin:airplane"))
        assertEquals("✈", wireIconText("vaadin:airplane"))
        assertEquals("🌐", wireIconText("🌐"))
        assertNull(wireIconText("vaadin:no-such-icon"))
        assertTrue(isGlyphLabel("✕"))
        assertFalse(isGlyphLabel("OK"))
    }

    fun testAButtonFaceCarriesBothIconSides() {
        val (icon, text) = buttonFace("With icons", "vaadin:star", "vaadin:arrow-right")
        assertNotNull(icon)
        assertEquals("With icons →", text)
    }

    fun testABpmnOutlineListsAGatewaysBranches() {
        val xml = """<?xml version="1.0"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="p">
            <bpmn:startEvent id="s" name="Requested"/><bpmn:exclusiveGateway id="g" name="Approved?"/>
            <bpmn:task id="t" name="Ship"/><bpmn:endEvent id="e1" name="On loan"/><bpmn:endEvent id="e2" name="Rejected"/>
            <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="g"/><bpmn:sequenceFlow id="f2" name="yes" sourceRef="g" targetRef="t"/>
            <bpmn:sequenceFlow id="f3" name="no" sourceRef="g" targetRef="e2"/><bpmn:sequenceFlow id="f4" sourceRef="t" targetRef="e1"/>
            </bpmn:process></bpmn:definitions>"""
        val model = BpmnDiagrams.parse(xml)!!
        assertFalse(model.laidOut)
        assertEquals(
            listOf(0 to "○ Requested", 0 to "↓ ◇ Approved?", 1 to "yes → ▭ Ship", 1 to "↓ ◉ On loan", 1 to "no → ◉ Rejected"),
            BpmnDiagrams.outline(model))
    }
}
