package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.ui.ChromeLanguage
import junit.framework.TestCase
import java.util.Locale

/** Live UI push: an agent reading and operating the window's screen (`query` messages). */
class AgentScreenQueriesTest : TestCase() {
    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private val screen = json(
        """{"route":"/orders/42","focus":"page",
            "fields":[{"id":"customer","label":"Customer","type":"string","value":"Ada"},
                      {"id":"total","type":"number","readOnly":true,"value":3}],
            "actions":[{"id":"save","label":"Save","enabled":true},{"id":"approve","label":"Approve","enabled":false},
                       {"id":"more","enabled":true,"children":[{"id":"archive","label":"Archive","enabled":true}]}],
            "listings":[{"id":"lines","columns":[],"actions":[],"searchText":"","filters":[{"id":"status","label":"Status","type":"string"}],
                         "rows":[{"name":"a"},{"name":"b"}],"rowActions":[{"id":"open-row","label":"Open"}],
                         "builtInActions":["search","nextPage","prevPage"]}]}""",
    )

    fun testAQueryMessageIsAnswered() {
        val effect = AgentPush.decide(AgentPush.Message("query", "describe-screen", json("""{"requestId":"r1"}""")))
        assertEquals("describe-screen", (effect as AgentPush.Effect.Query).event)
        assertEquals("r1", effect.requestId)
        // a query without a request id cannot be answered: dropped
        assertEquals(AgentPush.Effect.Ignore, AgentPush.decide(AgentPush.Message("query", "describe-screen", json("{}"))))
    }

    fun testOnlyEditableFieldsOfTheScreenMayBeSet() {
        assertNull(AgentScreenQueries.fieldsRefusal(screen, json("""{"customer":"Grace","searchText":"x","status":"open"}""")))
        assertEquals(AgentScreenQueries.Refusal("unknownField", "total"),
            AgentScreenQueries.fieldsRefusal(screen, json("""{"customer":"Grace","total":4}""")))
        assertEquals(AgentScreenQueries.Refusal("unknownField", "secret"),
            AgentScreenQueries.fieldsRefusal(screen, json("""{"secret":"x"}""")))
    }

    fun testWithAnOverlayTheOverlaysFieldsAreTheOnesEdited() {
        val withOverlay = json(
            """{"focus":"overlay","overlay":{"kind":"drawer","fields":[{"id":"note","type":"string"}],"actions":[]},
                "page":{"fields":[{"id":"customer","type":"string"}],"actions":[]}}""",
        )
        assertNull(AgentScreenQueries.fieldsRefusal(withOverlay, json("""{"note":"hi"}""")))
        assertEquals("customer", AgentScreenQueries.fieldsRefusal(withOverlay, json("""{"customer":"x"}"""))?.id)
    }

    fun testOnlyOfferedEnabledActionsAndExistingRowsMayBePressed() {
        assertNull(AgentScreenQueries.actionRefusal(screen, "save", null, null))
        assertNull(AgentScreenQueries.actionRefusal(screen, "archive", null, null))
        assertNull(AgentScreenQueries.actionRefusal(screen, "search", null, null))
        assertNull(AgentScreenQueries.actionRefusal(screen, "open-row", 1, "lines"))
        assertEquals(AgentScreenQueries.Refusal("unknownAction", "delete"), AgentScreenQueries.actionRefusal(screen, "delete", null, null))
        assertEquals(AgentScreenQueries.Refusal("disabledAction", "approve"), AgentScreenQueries.actionRefusal(screen, "approve", null, null))
        assertEquals(AgentScreenQueries.Refusal("unknownRow", "2"), AgentScreenQueries.actionRefusal(screen, "open-row", 2, null))
        assertEquals(AgentScreenQueries.Refusal("unknownRow", "0"), AgentScreenQueries.actionRefusal(screen, "open-row", 0, "nope"))
    }

    fun testTheAnswerCarriesTheScreenOrTheRefusal() {
        val ok = AgentScreenQueries.answerParameters("s1", "k", "r1", mapOf("route" to "/"), null)
        assertEquals(listOf("sessionId", "secret", "requestId", "screen"), ok.keys.toList())
        val refused = AgentScreenQueries.answerParameters("s1", "k", "r1", null, AgentScreenQueries.Refusal("unknownField", "x"))
        assertEquals(mapOf("code" to "unknownField", "id" to "x"), refused["error"])
        assertFalse(refused.containsKey("screen"))
        val unsupported = AgentScreenQueries.answerParameters("s1", "k", "r1", null, AgentScreenQueries.Refusal("unsupported"))
        assertEquals(mapOf("code" to "unsupported"), unsupported["error"])
    }

    fun testTheNoticeLastsTwoMinutesAfterTheLastQueryOrUntilStop() {
        val op = AgentScreenQueries.Operation()
        assertFalse(op.active(0))
        assertTrue(op.touch(1_000))
        assertFalse(op.touch(2_000)) // already shown
        assertTrue(op.active(2_000 + AgentScreenQueries.OPERATING_MS - 1))
        assertFalse(op.active(2_000 + AgentScreenQueries.OPERATING_MS))
        assertTrue(op.touch(500_000))
        op.stop()
        assertFalse(op.active(500_001))
    }

    fun testTheNoticeSpeaksTheSixChromeLanguages() {
        assertEquals(ChromeLanguage.LANGUAGES.toSet(), AgentScreenQueries.TEXTS.keys)
        AgentScreenQueries.TEXTS.values.forEach { t ->
            assertTrue(t.operating.isNotBlank() && t.stop.isNotBlank() && t.stopped.isNotBlank())
        }
        assertEquals("An AI agent is operating this screen", AgentScreenQueries.textsFor(Locale.ENGLISH).operating)
        assertEquals("Detener", AgentScreenQueries.textsFor(Locale.forLanguageTag("es-ES")).stop)
        assertEquals("Un agente di IA sta usando questa schermata", AgentScreenQueries.textsFor(Locale.ITALIAN).operating)
        assertEquals("Stop", AgentScreenQueries.textsFor(Locale.JAPANESE).stop)
    }
}
