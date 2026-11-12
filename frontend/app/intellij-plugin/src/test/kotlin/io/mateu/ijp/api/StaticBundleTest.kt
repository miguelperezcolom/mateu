package io.mateu.ijp.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue

/** The rules of libs/mateu bundleResolver.ts (pre-rendered half), as the desktop applies them. */
class StaticBundleTest {
    private val mapper = ObjectMapper()

    private fun inc(type: String, extra: String = "") =
        """{"fragments":[{"component":{"type":"ClientSide","metadata":{"type":"$type"$extra}},"state":{},"data":{}}]}"""

    private fun entry(syncPath: String, json: String, content: String? = null, pattern: String? = null, params: List<String> = emptyList()): Map<String, Any?> =
        linkedMapOf("route" to "/$syncPath", "syncPath" to syncPath, "ok" to true, "json" to json,
            "contentJson" to content, "routePattern" to pattern, "paramNames" to params)

    private fun bundle(entries: List<Map<String, Any?>>, routes: List<Map<String, Any?>> = emptyList(), extra: Map<String, Any?> = emptyMap()) =
        StaticBundle(mapper.valueToTree(mapOf("entries" to entries, "routes" to mapOf("routes" to routes)) + extra), locales = { listOf("es-ES") })

    private val shell = inc("App", ""","title":"Museums","homeRoute":"/home"""")

    @Test
    fun `a fresh load is the shell aimed at the route, a content load its screen`() {
        val b = bundle(listOf(entry("_no_route", shell), entry("museums", shell, content = inc("Page"))),
            routes = listOf(mapOf("route" to "museums")))
        assertEquals("/home", b.answer("", "_empty")!!.at("/fragments/0/component/metadata/homeRoute").asText())
        assertEquals("/museums", b.answer("/museums", "_empty")!!.at("/fragments/0/component/metadata/homeRoute").asText())
        assertEquals("Page", b.answer("/museums", "/museums")!!.at("/fragments/0/component/metadata/type").asText())
        // a menu leaf's content load sends consumedRoute "" — that is NOT a fresh load
        assertEquals("Page", b.answer("/museums", "")!!.at("/fragments/0/component/metadata/type").asText())
    }

    @Test
    fun `a content load is never answered with a shell`() {
        val b = bundle(listOf(entry("_no_route", shell)))
        assertNull(b.answer("", "_no_route"))
    }

    @Test
    fun `a template injects its params, and a fixed param outranks the path and the query`() {
        val b = bundle(
            listOf(entry("museums/__p__", inc("Page", ""","x":1"""), pattern = "^museums/([^/]+)$", params = listOf("id"))),
            routes = listOf(mapOf("route" to "museums/:id", "fixedParams" to mapOf("tab" to "info"), "defaultParams" to mapOf("size" to 10))),
        )
        val a = b.answer("/museums/7?tab=x&q=art", "_empty")!!
        assertEquals("7", a.at("/fragments/0/state/id").asText())
        assertEquals("info", a.at("/fragments/0/state/tab").asText())
        assertEquals("art", a.at("/fragments/0/state/q").asText())
        assertEquals(10, a.at("/fragments/0/state/size").asInt())
    }

    @Test
    fun `the shell gets the manifest's catalogue and i18n is resolved for the locale`() {
        val b = bundle(listOf(entry("_no_route", inc("App", ""","title":"${'$'}{i18n.app.title}""""))),
            extra = mapOf("sources" to mapOf("sources" to listOf(mapOf("name" to "museums"))),
                "translations" to mapOf("en" to mapOf("app.title" to "Museums"), "es" to mapOf("app.title" to "Museos"))))
        val a = b.answer("", "_empty")!!
        assertEquals("Museos", a.at("/fragments/0/component/metadata/title").asText())
        assertEquals("museums", a.at("/fragments/0/component/metadata/restSources/0/name").asText())
    }

    @Test
    fun `a bundle path never points elsewhere`() {
        assertEquals("manifest.json", StaticBundle.bundlePath(null))
        assertNull(StaticBundle.bundlePath("https://evil.io/m.json"))
        assertNull(StaticBundle.bundlePath("../m.json"))
        assertTrue(StaticBundle.isBundleManifest(mapper.readTree("""{"entries":[]}""")))
        assertTrue(!StaticBundle.isBundleManifest(JsonNodeFactory.instance.arrayNode()))
    }
}
