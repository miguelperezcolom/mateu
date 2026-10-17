package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.MateuApiClient
import junit.framework.TestCase

/**
 * Sample mode on the plugin (mirrors libs/mateu sampleSources.test.ts and RN sampleSources.test.ts):
 * the sample answers ONLY in sample mode (the app's mockSources flag), a read gets a copy, a write
 * JSON null, a sampled source is never proxied, and a listing over it pages/filters/sorts in memory.
 * Also the status `tones` (a declared tone wins over the word heuristic).
 */
class SampleSourcesTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    // Port 9 (discard): nothing listens — a real fetch would fail, so a passing read proves no call.
    private val api = MateuApiClient("http://127.0.0.1:9", "s1")

    private val ordersSample = json(
        """{"data":[{"id":1,"customer":"Acme","status":"OPEN","total":120.5},
                    {"id":2,"customer":"Globex","status":"SHIPPED","total":80},
                    {"id":3,"customer":"Initech","status":"OPEN","total":300}],
            "meta":{"total":3}}""",
    )

    private val sources = RestSourceCatalogue()

    override fun setUp() {
        sources.registerRestSources(
            json(
                """[{"name":"orders","source":{"url":"http://127.0.0.1:9/api/orders","itemsPath":"data","proxy":true},
                     "totalPath":"meta.total","sample":$ordersSample},
                    {"name":"plain","source":{"url":"http://127.0.0.1:9/api/plain","proxy":true}}]""",
            ),
        )
    }

    fun testSampleModeOffLeavesSourcesAlone() {
        val ref = json("""{"ref":"orders"}""")
        assertFalse(sources.isSampled(ref))
        assertTrue(sources.viaProxy(ref))
        assertNull(sources.sampledResponse(ref))
    }

    fun testAReadAnswersWithACopyOfTheSample() {
        sources.setSampleMode(true)
        val got = RestFetch.fetch(api, json("""{"ref":"orders"}"""), emptyMap(), sources)
        assertEquals(ordersSample, got)
        (got.path("data") as com.fasterxml.jackson.databind.node.ArrayNode).removeAll()
        assertEquals(3, ordersSample.path("data").size())
    }

    fun testAWriteSucceedsWithNull() {
        sources.setSampleMode(true)
        assertTrue(RestFetch.fetch(api, json("""{"ref":"orders","method":"POST"}"""), emptyMap(), sources).isNull)
        assertTrue(sources.sampledResponse(json("""{"ref":"orders"}"""), "DELETE")!!.isNull)
    }

    fun testASampledSourceIsNeverProxied() {
        sources.setSampleMode(true)
        assertFalse(sources.viaProxy(json("""{"ref":"orders"}""")))
        assertTrue(sources.viaProxy(json("""{"ref":"plain"}""")))
    }

    fun testTheSurfacesOwnSampleWinsAndInlineSourcesAreSampled() {
        sources.setSampleMode(true)
        assertEquals(json("""{"data":[]}"""), RestFetch.fetch(api, json("""{"ref":"orders","sample":{"data":[]}}"""), emptyMap(), sources))
        assertEquals(json("[1,2]"), RestFetch.fetch(api, json("""{"url":"/x","sample":[1,2]}"""), emptyMap(), sources))
    }

    fun testASampledListingSearchesFiltersSortsAndPagesInMemory() {
        val rows = ordersSample.path("data").toList()
        val cols = listOf("id", "customer", "status", "total")
        val filters = listOf(json("""{"fieldId":"status","options":[{"value":"OPEN"}]}"""))
        val filtered = RestListing.page(
            rows, cols, filters,
            mapOf("status" to "OPEN", "sort" to listOf(mapOf("field" to "total", "direction" to "descending"))), 0,
        )
        assertEquals(listOf(3, 1), filtered.content.map { it.path("id").asInt() })
        assertEquals(2, filtered.totalElements)
        val searched = RestListing.page(rows, cols, emptyList(), mapOf("searchText" to "glo"), 0)
        assertEquals(listOf(2), searched.content.map { it.path("id").asInt() })
        val page1 = RestListing.page(rows, cols, emptyList(), mapOf("page" to 1), 2)
        assertEquals(listOf(3), page1.content.map { it.path("id").asInt() })
        assertEquals(3, page1.totalElements)
        assertEquals(1, page1.pageNumber)
    }

    fun testADeclaredToneWinsOverTheWord() {
        val tones = mapOf("OPEN" to "warning", "STOPPED" to "info")
        assertEquals("WARNING", StatusTones.statusType(json("\"OPEN\""), tones))
        assertEquals("INFO", StatusTones.statusType(json("\"STOPPED\""), tones))
        assertEquals("DANGER", StatusTones.statusType(json("\"STOPPED\"")))
        assertEquals("SUCCESS", StatusTones.statusType(json("\"Available\"")))
        assertEquals("WARNING", StatusTones.statusType(json("\"in-progress\"")))
        assertEquals("NONE", StatusTones.statusType(json("\"whatever\"")))
        assertEquals("SUCCESS", StatusTones.statusType(json("""{"type":"SUCCESS","message":"x"}"""), tones))
        assertEquals(mapOf("OPEN" to "warning"), StatusTones.tonesOf(json("""{"tones":{"OPEN":"warning"}}""")))
        assertTrue(StatusTones.tonesOf(json("""{"tones":null}""")).isEmpty())
    }
}
