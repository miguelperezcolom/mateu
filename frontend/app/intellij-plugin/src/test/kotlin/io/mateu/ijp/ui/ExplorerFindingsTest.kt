package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import java.awt.Font
import junit.framework.TestCase

/** Display details the Mateu Explorer found missing (3.0-beta.51): what the wire says is drawn. */
class ExplorerFindingsTest : TestCase() {

    private val json = ObjectMapper()

    fun testATextsVariantsAreItsFontStyle() {
        assertEquals(Font.BOLD, textEmphasis(json.readTree("""["b"]""")))
        assertEquals(Font.ITALIC, textEmphasis(json.readTree("""["i"]""")))
        assertEquals(Font.BOLD or Font.ITALIC, textEmphasis(json.readTree("""["b","i"]""")))
        assertEquals(Font.PLAIN, textEmphasis(null))
        assertEquals(Font.PLAIN, textEmphasis(json.readTree("\"b\"")))
    }

    fun testABadgeKeepsItsIconAndWhichSideItGoes() {
        assertEquals("vaadin:check" to false, badgeIconOf(json.readTree("""{"text":"Paid","iconOnLeft":"vaadin:check"}""")))
        assertEquals("vaadin:arrow-right" to true, badgeIconOf(json.readTree("""{"text":"Details","iconOnRight":"vaadin:arrow-right"}""")))
        assertNull(badgeIconOf(json.readTree("""{"text":"Pending"}""")))
    }
}
