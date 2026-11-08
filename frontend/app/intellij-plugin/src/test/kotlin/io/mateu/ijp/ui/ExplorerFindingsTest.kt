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

    fun testAFaqAnswerIsMarkdown() {
        val html = faqAnswerHtml("Yes — **dogs** up to 10 kg")
        assertTrue(html, html.startsWith("<html>"))
        assertTrue(html, html.contains("<b>dogs</b>"))
        assertFalse(html, html.contains("**"))
        // and markup in it is text, not html
        assertTrue(faqAnswerHtml("<img src=x>").contains("&lt;img"))
    }

    fun testAProgressBarsThemeIsThePlatformStatus() {
        assertEquals("passed", progressBarStatus("success"))
        assertEquals("error", progressBarStatus("error"))
        assertEquals("error", progressBarStatus("danger"))
        assertEquals("warning", progressBarStatus("warning"))
        assertNull(progressBarStatus(""))
    }

    fun testAStatusCardLeadsWithItsAvatarElseItsIcon() {
        assertEquals("MR" to true, statusItemLead(json.readTree("""{"avatar":"MR","icon":"x"}""")))
        assertEquals("🔧" to false, statusItemLead(json.readTree("""{"icon":"🔧"}""")))
        assertNull(statusItemLead(json.readTree("""{"icon":"vaadin:check"}""")))
        assertNull(statusItemLead(json.readTree("{}")))
    }
}
