package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/**
 * An enum column's cells read as its labels (`GridColumn.valueLabels`: IN_HOUSE → "In house"), the
 * same the form options use — mirrors libs/mateu valueLabel.test.ts, RN cellText.test.ts and the
 * Redwood test-pms "enum cells" case. The row keeps the raw value.
 */
class ValueLabelsTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private val column = json("""{"id":"status","valueLabels":{"IN_HOUSE":"In house","DEPARTED":"Checked out"}}""")

    fun testAColumnsLabelsAreReadOffItsMetadata() {
        assertEquals(mapOf("IN_HOUSE" to "In house", "DEPARTED" to "Checked out"), StatusTones.valueLabelsOf(column))
        assertEquals(emptyMap<String, String>(), StatusTones.valueLabelsOf(json("""{"id":"guest"}""")))
    }

    fun testACellShowsTheLabelOfItsRawValue() {
        val labels = StatusTones.valueLabelsOf(column)
        assertEquals("In house", StatusTones.cellText(json("\"IN_HOUSE\""), labels))
        assertEquals("DUE_OUT", StatusTones.cellText(json("\"DUE_OUT\""), labels))
        assertEquals("IN_HOUSE", StatusTones.cellText(json("\"IN_HOUSE\"")))
        assertEquals("", StatusTones.cellText(null, labels))
    }

    fun testAStatusBadgeIsTonedByTheRawValue() {
        // the tone comes from the RAW value even though the badge reads the label
        assertEquals("DANGER", StatusTones.statusType(json("\"DEPARTED\""), mapOf("DEPARTED" to "danger")))
    }
}
