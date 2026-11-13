package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import junit.framework.TestCase

/**
 * S7: the `navigations` section of conformance/client/agent-events.json — the same cases the web,
 * Redwood and React Native run. An agent's navigation-requested carries WHERE TO GO only; a menu
 * leaf's `rules` (which [io.mateu.ijp.state.AppSession.openMenuEntry] would run) and an `actionId`
 * never travel.
 */
class AgentNavigationConformanceTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/agent-events.json")
            if (f.isFile) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/agent-events.json not found above ${File("").absolutePath}")
    }

    fun testEveryNavigationCase() {
        val cases = corpus().path("navigations")
        assertTrue("the corpus has navigation cases", cases.size() >= 4)
        for (c in cases) {
            assertEquals(c.path("name").asText(), c.path("expected"), ChatEvents.agentNavigationFields(c.path("detail")))
        }
    }

    fun testAPushedNavigationWithRulesOpensThePlaceAndRunsNothing() {
        val detail = mapper.readTree(
            """{"route":"/orders","actionId":"deleteEverything","rules":[{"action":"RunAction","actionId":"deleteEverything"},{"action":"RunJS","value":"alert(1)"}],"label":"x"}""",
        )
        val entry = (ChatEvents.decide("navigation-requested", detail, { false }) as ChatEvents.Effect.Navigate).entry
        assertFalse(entry.has("rules"))
        assertFalse(entry.has("actionId"))
        assertEquals("/orders", entry.path("route").asText())
        // a rules-only / action-only "navigation" is no place at all
        assertEquals(ChatEvents.Effect.Ignore, ChatEvents.decide("navigation-requested", mapper.readTree("""{"rules":[{"action":"RunJS"}]}"""), { false }))
    }
}
