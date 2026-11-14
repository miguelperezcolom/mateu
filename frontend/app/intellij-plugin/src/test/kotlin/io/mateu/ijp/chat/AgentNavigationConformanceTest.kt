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

    /** B1: the `trustedNavigations` cases — a base url survives only for an origin the UI trusts. */
    fun testEveryTrustedNavigationCase() {
        val cases = corpus().path("trustedNavigations")
        assertTrue("the corpus has trusted-navigation cases", cases.size() >= 5)
        for (c in cases) {
            val scope = io.mateu.ijp.api.CredentialScope(c.path("shell").asText())
            scope.declare(c.path("shell").asText(), c.path("declared").map { it.asText() })
            val got = ChatEvents.trustedNavigation(ChatEvents.agentNavigationFields(c.path("detail")), scope::mayCarryCredentials)
            assertEquals(c.path("name").asText(), c.path("expected"), got)
        }
    }

    /**
     * B1, end to end: an agent's navigation naming a host the app never named opens the route in the
     * app — the remote opener is not called, the host does not become trusted, and a session opened
     * against it would carry no token. A remote the app's MENU names still opens remotely, signed in.
     */
    fun testAnAgentNavigationNeverSendsTheTokenToAHostTheAppDoesNotName() {
        val session = io.mateu.ijp.state.AppSession("https://app.example", tokenProvider = io.mateu.ijp.api.TokenProvider.of("secret"))
        val remote = mutableListOf<String>()
        val local = mutableListOf<String?>()
        session.openRemoteViewHandler = { _, _, _, _, _, base -> remote += base }
        session.openViewHandler = { _, route, _, _, _ -> local += route }

        io.mateu.ijp.ui.AgentEvents.apply(session, "navigation-requested", mapper.readTree("""{"route":"/x","baseUrl":"https://attacker.example"}"""))
        assertEquals(emptyList<String>(), remote)
        assertEquals(listOf<String?>("/x"), local)
        assertFalse(session.credentials.mayCarryCredentials("https://attacker.example"))
        // opening a session against it (as a remote opener does) declares nothing, and gets no token
        val foreign = io.mateu.ijp.ui.remoteSession(session, "https://attacker.example")
        assertSame(io.mateu.ijp.api.TokenProvider.NONE, foreign.apiClient.tokenProvider)
        assertFalse(session.credentials.mayCarryCredentials("https://attacker.example"))

        // the app's menu names a remote: the same navigation to IT opens there, with the user's token
        val menu = mapper.readTree("""[{"label":"Forms","submenus":[{"label":"F","route":"/f","baseUrl":"https://forms.example/fed"}]}]""")
        io.mateu.ijp.ui.declareRemotes(session, io.mateu.ijp.ui.menuRemotes(menu))
        io.mateu.ijp.ui.AgentEvents.apply(session, "navigation-requested", mapper.readTree("""{"route":"/f","baseUrl":"https://forms.example/fed"}"""))
        assertEquals(listOf("https://forms.example/fed"), remote)
        assertNotSame(io.mateu.ijp.api.TokenProvider.NONE, io.mateu.ijp.ui.remoteSession(session, "https://forms.example/fed").apiClient.tokenProvider)
    }
}
