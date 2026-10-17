package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.ui.microFrontendSession
import junit.framework.TestCase

/**
 * The IDE keeps several Mateu apps open at once: what one registers — its REST source catalogue,
 * the entries its responses name, its sample mode — must not reach another (it used to live in the
 * process-wide RestFetch object, so the last app shell to load overwrote everybody's catalogue). An
 * island over another base url belongs to the app hosting it and shares that app's catalogue.
 */
class RestSourcesPerAppTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private fun appShell(url: String, mock: Boolean = false) = json(
        """{"fragments":[{"targetComponentId":"ux_main","component":{"type":"ServerSide","id":"shell",
            "serverSideType":"x.App","children":[{"type":"ClientSide","metadata":{"type":"App","mockSources":$mock,
            "restSources":[{"name":"countries","source":{"url":"$url","proxy":true}}]}}]}}]}""",
    )

    fun testTwoAppsKeepTheirOwnCatalogues() {
        val a = AppContext(AppSession("http://127.0.0.1:9"))
        val b = AppContext(AppSession("http://127.0.0.1:9"))
        a.applyIncrement(appShell("https://a.example/countries", mock = true))
        assertNull("app B sees app A's catalogue", b.session.sources.restSource("countries"))
        assertFalse("app A's sample mode reached app B", b.session.sources.sampleMode)
        b.applyIncrement(appShell("https://b.example/countries"))
        assertEquals("https://a.example/countries", a.session.sources.resolveRestSource(json("""{"ref":"countries"}""")).path("url").asText())
        assertEquals("https://b.example/countries", b.session.sources.resolveRestSource(json("""{"ref":"countries"}""")).path("url").asText())
        assertTrue(a.session.sources.sampleMode)
    }

    fun testWhatAResponseNamesStaysInItsApp() {
        val a = AppContext(AppSession("http://127.0.0.1:9"))
        val b = AppContext(AppSession("http://127.0.0.1:9"))
        a.applyIncrement(json("""{"restSources":[{"name":"late","source":{"url":"https://a.example/late"}}]}"""))
        assertEquals("https://a.example/late", a.session.sources.restSource("late")?.path("source")?.path("url")?.asText())
        assertNull(b.session.sources.restSource("late"))
    }

    fun testAnIslandOverAnotherBaseUrlSharesItsHostsCatalogue() {
        val host = AppSession("http://127.0.0.1:9")
        val island = microFrontendSession(host, json("""{"baseUrl":"http://remote.example"}"""))
        assertEquals("http://remote.example", island.baseUrl)
        assertSame(host.sources, island.sources)
        AppContext(island).applyIncrement(json("""{"restSources":[{"name":"fromIsland","source":{"url":"/x"}}]}"""))
        assertNotNull(host.sources.restSource("fromIsland"))
        assertSame(host, microFrontendSession(host, json("""{"baseUrl":"http://127.0.0.1:9/"}""")))
    }
}
