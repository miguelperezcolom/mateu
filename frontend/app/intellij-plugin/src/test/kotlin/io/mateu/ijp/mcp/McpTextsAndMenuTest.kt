package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.ui.ChromeLanguage
import junit.framework.TestCase
import java.util.Locale

class McpTextsAndMenuTest : TestCase() {

    private val mapper = ObjectMapper()

    fun testEveryLanguageHasEveryText() {
        assertEquals(ChromeLanguage.LANGUAGES.toSet(), McpTexts.all.keys)
        val en = McpTexts.all.getValue("en")
        for ((lang, t) in McpTexts.all) {
            val values = listOf(t.group, t.enable, t.enableHelp, t.port, t.address, t.token, t.copy, t.copied, t.regenerate,
                t.regenerated, t.claudeCode, t.anyClient, t.portBusy, t.operating, t.stop, t.stopped)
            assertTrue("$lang: blank", values.all { it.isNotBlank() })
            assertTrue("$lang: %s", t.operating.contains("%s"))
            assertTrue("$lang: %d", t.portBusy.contains("%d"))
            if (lang != "en") {
                assertFalse("$lang still English", t.enable == en.enable)
                assertFalse("$lang still English", t.stop == en.stop)
            }
        }
        assertEquals("Detener", McpTexts.of(Locale.forLanguageTag("es-ES")).stop)
        assertEquals("Stop", McpTexts.of(Locale.forLanguageTag("ja")).stop)
    }

    fun testTheMenuTree() {
        val menu = mapper.readTree("""
            [{"label":"Home","route":"/home","visible":true},
             {"separator":true,"visible":true},
             {"label":"Secret","route":"/s","visible":false},
             {"label":"Sales","visible":true,"submenus":[{"label":"Orders","route":"/sales/orders","visible":true,"selected":true}]}]
        """)
        val tree = MenuSummary.build(menu, mapper)
        assertEquals(listOf("Home", "Sales"), tree.map { it.path("label").asText() })
        val orders = tree.path(1).path("entries").path(0)
        assertEquals("/sales/orders", orders.path("route").asText())
        assertTrue(orders.path("selected").asBoolean())
        assertEquals("Orders", MenuSummary.find(menu, "sales/orders/")!!.path("label").asText())
        assertNull(MenuSummary.find(menu, "/nope"))
    }
}
