package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.io.File

/**
 * The screen summary an agent reads, built from REAL wire increments: the shared conformance corpus
 * (conformance/cases — what the servers actually send).
 */
class ScreenSummaryTest : TestCase() {

    private val mapper = ObjectMapper()

    private val casesDir: File by lazy {
        generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "conformance/cases") }
            .first { it.isDirectory }
    }

    private fun case(name: String): JsonNode = mapper.readTree(File(casesDir, "$name/expected.json"))

    /** The content fragment's component and its state, as AppContext keeps them. */
    private fun view(name: String, listings: Map<String, JsonNode> = emptyMap(), extra: Map<String, Any?> = emptyMap(),
                     errors: Map<String, String> = emptyMap(), attributes: Map<String, Map<String, Any?>> = emptyMap()): ScreenSummary.View {
        val fragment = case(name).path("fragments").path(0)
        @Suppress("UNCHECKED_CAST")
        val state = (mapper.convertValue(fragment.path("state"), Map::class.java) as? Map<String, Any?>).orEmpty() + extra
        return ScreenSummary.View(fragment.path("component"), state, errors, attributes, listings)
    }

    private fun build(input: ScreenSummary.Input) = ScreenSummary.build(input, mapper)

    fun testAFormSaysItsFieldsWithTheirValuesAndOptions() {
        val s = build(ScreenSummary.Input(uiName = "Demo", baseUrl = "http://localhost:8080", route = "/conformance/simple-form",
            windowTitle = "Simple form", view = view("simple-form")))
        assertEquals("Demo", s.path("ui").path("name").asText())
        assertEquals("page", s.path("focus").asText())
        assertEquals("Simple form", s.path("header").path("title").asText())
        assertEquals("Every basic field kind", s.path("header").path("subtitle").asText())
        val fields = s.path("fields").associateBy { it.path("id").asText() }
        assertEquals(listOf("name", "age", "active", "birthDate", "colour"), s.path("fields").map { it.path("id").asText() })
        assertEquals("Ada", fields.getValue("name").path("value").asText())
        assertEquals(36, fields.getValue("age").path("value").asInt())
        assertTrue(fields.getValue("active").path("value").asBoolean())
        assertEquals("Name", fields.getValue("name").path("label").asText())
        val colour = fields.getValue("colour")
        assertEquals("green", colour.path("value").asText())
        assertEquals(listOf("red", "green", "blue"), colour.path("options").map { it.path("value").asText() })
        assertEquals("Green", colour.path("options").path(1).path("label").asText())
    }

    fun testThePageHeaderSaysItsKpisOverlineAndTimestamp() {
        val h = build(ScreenSummary.Input(view = view("page-header"))).path("header")
        assertEquals("Requisition 4471", h.path("title").asText())
        assertEquals("Requisitions", h.path("overline").asText())
        assertEquals("Pending approval", h.path("subtitle").asText())
        assertTrue(h.path("timestamp").asText().startsWith("Last updated"))
        assertEquals(1, h.path("kpis").size())
    }

    fun testTheToolbarIsAnOptionWithItsId() {
        val s = build(ScreenSummary.Input(view = view("page-toolbar")))
        val publish = s.path("actions").firstOrNull { it.path("id").asText() == "publish" }
        assertNotNull("publish not offered: ${s.path("actions")}", publish)
        assertTrue(publish!!.path("enabled").asBoolean())
        assertTrue("publish" in ScreenSummary.offeredActionIds(s))
    }

    fun testAListingSaysItsColumnsRowsPagingAndRowActions() {
        val page = case("crud-search").path("fragments").path(0).path("data")
        val s = build(ScreenSummary.Input(route = "/conformance/crud",
            view = view("crud", listings = mapOf("crud" to page), extra = mapOf("searchText" to "milk", "page" to 1))))
        val listing = s.path("listings").path(0)
        assertEquals("Products", listing.path("title").asText())
        assertEquals(listOf("Name", "Price", "Status"), listing.path("columns").map { it.path("label").asText() })
        assertEquals("milk", listing.path("searchText").asText())
        assertEquals(1, listing.path("page").asInt())
        assertEquals(3, listing.path("totalElements").asInt())
        assertEquals(1, listing.path("rows").size())
        assertEquals("Milk frother", listing.path("rows").path(0).path("name").asText())
        // the toolbar's buttons are the listing's options; the rows open (a `view` column)
        assertEquals(listOf("new", "delete"), listing.path("actions").map { it.path("id").asText() })
        assertEquals(ScreenSummary.OPEN_ROW_ACTION, listing.path("rowActions").path(0).path("id").asText())
        assertTrue(listing.path("filters").size() > 0)
        val offered = ScreenSummary.offeredActionIds(s)
        assertTrue(offered.containsAll(listOf("new", "delete", "open-row", "search")))
        // the filter fields are the listing's, not the page's fields
        assertEquals(0, s.path("fields").size())
    }

    fun testAnOpenDrawerIsInFront() {
        val drawer = case("drawer").path("fragments").path(0).path("component")
        val s = build(ScreenSummary.Input(view = view("simple-form"), overlay = drawer to ScreenSummary.View(null)))
        assertEquals("overlay", s.path("focus").asText())
        val o = s.path("overlay")
        assertEquals("drawer", o.path("kind").asText())
        assertEquals("Details", o.path("title").asText())
        assertEquals("Read only", o.path("subtitle").asText())
        // the page behind it is still described, under `page`
        assertEquals(5, s.path("page").path("fields").size())
    }

    fun testTheAppContextSaysItsCurrentValue() {
        val app = case("app-context").path("fragments").path(0).path("component").path("metadata")
        val s = build(ScreenSummary.Input(app = app, appState = mapOf("hotel" to "madrid")))
        val selector = s.path("appContext").path(0)
        assertEquals("hotel", selector.path("field").asText())
        assertEquals("madrid", selector.path("value").asText())
        assertEquals("Madrid", selector.path("valueLabel").asText())
        assertEquals("Context app", s.path("ui").path("appTitle").asText())
    }

    fun testNeverMoreThanTheUserSees() {
        val content = mapper.readTree("""
            {"type":"ServerSide","children":[{"type":"ClientSide","metadata":{"type":"FormLayout"},"children":[
              {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"pwd","label":"Password","dataType":"string","stereotype":"password"}},
              {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"secretNote","label":"Hidden by a rule","dataType":"string"}},
              {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"bio","label":"Bio","dataType":"string"}},
              {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"photo","label":"Photo","dataType":"string"}},
              {"type":"ClientSide","metadata":{"type":"Button","actionId":"save","label":"Save","disabled":true}}
            ]}]}
        """)
        val s = build(ScreenSummary.Input(
            app = mapper.readTree("""{"type":"App","user":{"name":"Ana","accessToken":"xyz","email":"ana@x.io"}}"""),
            view = ScreenSummary.View(content,
                state = mapOf("pwd" to "hunter2", "secretNote" to "s", "bio" to "x".repeat(2000), "photo" to "data:image/png;base64," + "A".repeat(5000)),
                fieldAttributes = mapOf("secretNote" to mapOf("hidden" to true)),
                fieldErrors = mapOf("bio" to "Too long")),
        ))
        val fields = s.path("fields").associateBy { it.path("id").asText() }
        assertEquals("••••••", fields.getValue("pwd").path("value").asText())
        assertFalse(s.toString().contains("hunter2"))
        assertFalse("secretNote" in fields)
        assertTrue(fields.getValue("bio").path("value").asText().length <= ScreenSummary.MAX_TEXT + 1)
        assertTrue(fields.getValue("photo").path("value").asText().startsWith("[data:image/png data"))
        assertEquals("Too long", fields.getValue("bio").path("error").asText())
        assertEquals("Too long", s.path("errors").path("bio").asText())
        assertTrue(s.path("truncated").map { it.asText() }.containsAll(listOf("fields.bio", "fields.photo")))
        assertFalse(s.path("actions").path(0).path("enabled").asBoolean())
        assertEquals("Ana", s.path("user").path("name").asText())
        assertFalse(s.toString().contains("xyz"))
    }

    fun testMessagesAreTheLastOnes() {
        val many = (1..15).map { ScreenSummary.Message("info", "", "m$it") }
        val s = build(ScreenSummary.Input(messages = many))
        assertEquals(10, s.path("messages").size())
        assertEquals("m15", s.path("messages").path(9).path("text").asText())
    }

    fun testEveryCaseOfTheCorpusSummarises() {
        val failures = ArrayList<String>()
        for (dir in casesDir.listFiles { f -> File(f, "expected.json").isFile }!!.sortedBy { it.name }) {
            runCatching {
                val increment = mapper.readTree(File(dir, "expected.json"))
                val fragment = increment.path("fragments").path(0)
                build(ScreenSummary.Input(view = ScreenSummary.View(fragment.path("component"))))
            }.onFailure { failures += "${dir.name}: $it" }
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }
}
