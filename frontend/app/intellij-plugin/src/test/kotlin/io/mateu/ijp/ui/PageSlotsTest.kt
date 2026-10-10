package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import java.awt.Color
import junit.framework.TestCase

/** Unit tests for the pattern-gap wire readers (mirrors the Java PageSlotsSyncTest/CrudDisplaySyncTest). */
class PageSlotsTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    fun testAnnouncePoliteByDefaultAssertiveWhenAsked() {
        assertEquals(PageSlots.Announcement("Saved", false), PageSlots.announcementOf(json("""{"text":"Saved"}""")))
        assertEquals(
            PageSlots.Announcement("Could not save", true),
            PageSlots.announcementOf(json("""{"text":"Could not save","assertive":true}""")),
        )
        assertEquals(PageSlots.Announcement("Bare", false), PageSlots.announcementOf(json("\"Bare\"")))
        assertNull(PageSlots.announcementOf(json("""{"text":"  "}""")))
        assertNull(PageSlots.announcementOf(json("null")))
        assertNull(PageSlots.announcementOf(null))
    }

    private val page = json(
        """
        {"type":"Page","title":"Order","switcher":{
          "options":[{"value":"1","label":"Order 1","description":"Open"},
                     {"value":"2","label":"Order 2"},
                     {"value":"3"}],
          "value":"2","type":"object","label":"Order","searchable":true,"disabled":false,
          "actionId":"_switchRecord"}}
        """.trimIndent(),
    )

    fun testSwitcherReadsOptionsCurrentValueAndFlags() {
        val s = PageSlots.switcherOf(page)!!
        assertEquals(listOf("Order 1", "Order 2", "3"), s.options.map { it.label })
        assertEquals("Open", s.options[0].description)
        assertEquals(1, s.selectedIndex)
        assertEquals("Order", s.label)
        assertTrue(s.searchable)
        assertFalse(s.disabled)
        assertEquals("_switchRecord", s.actionId)
        assertEquals("Order 1", s.options[0].toString())
    }

    fun testSwitcherAbsentOrEmptyMeansNone() {
        assertNull(PageSlots.switcherOf(json("""{"type":"Page"}""")))
        assertNull(PageSlots.switcherOf(json("""{"switcher":null}""")))
        assertNull(PageSlots.switcherOf(json("""{"switcher":{"options":[]}}""")))
    }

    fun testSwitcherDefaultsLabelActionAndUnknownValue() {
        val s = PageSlots.switcherOf(json("""{"switcher":{"options":[{"value":"a","label":"A"}],"value":"zz","type":"context"}}"""))!!
        assertEquals(-1, s.selectedIndex)
        assertEquals("Context", s.label)
        assertEquals("_switchRecord", s.actionId)
        assertEquals("object", PageSlots.switcherOf(json("""{"switcher":{"options":[{"value":"a"}]}}"""))!!.type)
    }

    fun testPickingAnotherEntryDispatchesTheRecordParameter() {
        val s = PageSlots.switcherOf(page)!!
        assertEquals(mapOf("_record" to "3"), PageSlots.switchParameters(s, s.options[2]))
        // the current one, or a disabled switcher → nothing to run
        assertNull(PageSlots.switchParameters(s, s.options[1]))
        assertNull(PageSlots.switchParameters(s.copy(disabled = true), s.options[0]))
    }

    fun testHeroTonesAreOurPaletteAndUnknownFallsBack() {
        assertEquals(Color(0x1f4e79), PageSlots.heroToneColor("ocean"))
        assertEquals(Color(0x7a4a2e), PageSlots.heroToneColor("Sienna"))
        for (t in listOf("ocean", "pine", "lilac", "teal", "rose", "pebble", "slate", "plum", "sienna")) {
            assertNotNull(t, PageSlots.heroToneColor(t))
        }
        assertNull(PageSlots.heroToneColor(null))
        assertNull(PageSlots.heroToneColor(""))
        assertNull(PageSlots.heroToneColor("auto"))
        assertNull(PageSlots.heroToneColor("chartreuse"))
    }

    fun testFoldoutSummaryBySlot() {
        val children = json(
            """[{"slot":"overview"},{"slot":"panel-0"},{"slot":"summary-0","id":"s0"},{"slot":"panel-1"}]""",
        ).toList()
        assertEquals("s0", PageSlots.foldoutSummary(children, 0)?.path("id")?.asText())
        assertNull(PageSlots.foldoutSummary(children, 1))
    }

    fun testPreSearchShownUntilTheFirstAnswer() {
        val crud = json("""{"type":"Crud","preSearch":[{"type":"ClientSide"}]}""")
        assertTrue(PageSlots.showsPreSearch(crud, alreadyAnswered = false))
        assertFalse(PageSlots.showsPreSearch(crud, alreadyAnswered = true))
        assertFalse(PageSlots.showsPreSearch(json("""{"type":"Crud","preSearch":null}"""), false))
        assertFalse(PageSlots.showsPreSearch(json("""{"type":"Crud"}"""), false))
        assertEquals("_preSearchDone_crud", PageSlots.preSearchDoneKey(""))
        assertEquals("_preSearchDone_bookings", PageSlots.preSearchDoneKey("bookings"))
    }

    fun testListingAnswerDetection() {
        assertTrue(PageSlots.isListingAnswer(json("""{"crud":{"page":{"content":[]}}}""")))
        assertTrue(PageSlots.isListingAnswer(json("""{"page":{"content":[],"totalElements":0}}""")))
        assertTrue(PageSlots.isListingAnswer(json("""{"content":[]}""")))
        assertFalse(PageSlots.isListingAnswer(json("""{}""")))
        assertFalse(PageSlots.isListingAnswer(json("""{"_globalsearch":[]}""")))
        assertFalse(PageSlots.isListingAnswer(null))
    }

    fun testOverlayKeyIsTheOverlaysOwnId() {
        assertEquals(
            "crud-edit-drawer",
            PageSlots.overlayKey(json("""{"id":"fieldId","metadata":{"type":"Drawer","id":"crud-edit-drawer"}}""")),
        )
        // the wrapper's placeholder id never dedupes overlays
        assertNull(PageSlots.overlayKey(json("""{"id":"fieldId","metadata":{"type":"Drawer"}}""")))
    }
}
