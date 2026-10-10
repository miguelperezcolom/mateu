package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the hover-details rules (mirrors the RN hoverDetails tests). */
class PopoversTest : TestCase() {

    private val json = ObjectMapper()

    fun testTheTriggerIsClickUnlessHover() {
        assertEquals(Popovers.Trigger.HOVER, Popovers.triggerOf(json.readTree("""{"trigger":"hover"}""")))
        assertEquals(Popovers.Trigger.CLICK, Popovers.triggerOf(json.readTree("""{"trigger":"click"}""")))
        assertEquals(Popovers.Trigger.CLICK, Popovers.triggerOf(json.readTree("""{}""")))
    }

    fun testTheCellTooltipIsTheOtherFieldOfTheRow() {
        val row = json.readTree("""{"rate":134,"breakdown":"Sat 10: 134 €\nSun 11: 120 €","stay":{"note":"late"}}""")
        assertEquals("Sat 10: 134 €\nSun 11: 120 €", Popovers.cellTooltipText(row, "breakdown"))
        assertEquals("134", Popovers.cellTooltipText(row, "rate"))
        assertEquals("late", Popovers.cellTooltipText(row, "stay.note"))
    }

    fun testNoPathOrAnEmptyFieldMeansNoTooltip() {
        val row = json.readTree("""{"a":"  ","b":null}""")
        assertNull(Popovers.cellTooltipText(row, ""))
        assertNull(Popovers.cellTooltipText(row, "a"))
        assertNull(Popovers.cellTooltipText(row, "b"))
        assertNull(Popovers.cellTooltipText(row, "missing"))
        assertNull(Popovers.cellTooltipText(null, "a"))
    }

    fun testMultiLineTextBecomesEscapedHtmlWithBreaks() {
        assertEquals("<html>Sat &lt;10&gt;: 134 &amp; tax<br>Sun 11</html>", Popovers.tooltipHtml("Sat <10>: 134 & tax\nSun 11"))
        assertNull(Popovers.tooltipHtml(null))
        assertNull(Popovers.tooltipHtml(" "))
    }
}
