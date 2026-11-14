package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The desktop MCP server's JSON-RPC: the same shape as the backends' (protocol 2024-11-05). */
class McpProtocolTest : TestCase() {

    private val mapper = ObjectMapper()
    private val unexpected = ArrayList<String>()

    private val host = object : McpHost {
        override fun callTool(name: String, args: JsonNode): JsonNode = when (name) {
            McpTools.GET_SCREEN -> mapper.createObjectNode().put("route", "/products")
            McpTools.NAVIGATE -> throw McpToolError("No such route")
            McpTools.GET_MENU -> throw IllegalStateException("boom with internals")
            else -> mapper.createObjectNode().put("echo", args.path("route").asText())
        }
        override val resources = listOf(McpResource("mateu://desktop/screen", "Current screen", "d", "application/json"))
        override fun readResource(uri: String): String? = if (uri == "mateu://desktop/screen") "{\"route\":\"/x\"}" else null
    }

    private val protocol = McpProtocol(host, mapper) { reference, _ -> unexpected += reference }

    private fun call(json: String): JsonNode = mapper.readTree(protocol.handle(json)!!)

    fun testInitializeAnswersTheProtocolVersionAndCapabilities() {
        val r = call("""{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}""")
        assertEquals("2.0", r.path("jsonrpc").asText())
        assertEquals(1, r.path("id").asInt())
        assertEquals("2024-11-05", r.path("result").path("protocolVersion").asText())
        assertTrue(r.path("result").path("capabilities").has("tools"))
        assertTrue(r.path("result").path("capabilities").has("resources"))
        assertEquals("mateu-desktop", r.path("result").path("serverInfo").path("name").asText())
    }

    fun testANotificationHasNoAnswer() {
        assertNull(protocol.handle("""{"jsonrpc":"2.0","method":"notifications/initialized"}"""))
    }

    fun testPing() {
        assertTrue(call("""{"jsonrpc":"2.0","id":"a","method":"ping"}""").path("result").isObject)
    }

    fun testToolsListNamesEveryTool() {
        val tools = call("""{"jsonrpc":"2.0","id":2,"method":"tools/list"}""").path("result").path("tools")
        val names = tools.map { it.path("name").asText() }.toSet()
        assertEquals(McpTools.NAMES, names)
        assertTrue(names.all { it.startsWith("mateu_") })
        for (t in tools) {
            assertTrue(t.path("description").asText().isNotBlank())
            assertEquals("object", t.path("inputSchema").path("type").asText())
        }
        for (expected in listOf("mateu_list_uis", "mateu_open_ui", "mateu_get_menu", "mateu_navigate", "mateu_get_screen",
            "mateu_set_fields", "mateu_run_action", "mateu_show_screen", "mateu_list_components", "mateu_get_component_schema")) {
            assertTrue(expected, expected in names)
        }
    }

    fun testAToolAnswersItsDataAsText() {
        val r = call("""{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"mateu_get_screen","arguments":{}}}""")
        val text = r.path("result").path("content").path(0).path("text").asText()
        assertEquals("/products", mapper.readTree(text).path("route").asText())
        assertFalse(r.path("result").has("isError"))
    }

    fun testACallerMistakeIsAnIsErrorResultAsWritten() {
        val r = call("""{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"mateu_navigate","arguments":{}}}""")
        assertTrue(r.path("result").path("isError").asBoolean())
        assertEquals("Error: No such route", r.path("result").path("content").path(0).path("text").asText())
    }

    fun testAnUnknownToolIsAnIsErrorResult() {
        val r = call("""{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"rm_rf","arguments":{}}}""")
        assertTrue(r.path("result").path("isError").asBoolean())
        assertEquals("Error: Unknown tool: rm_rf", r.path("result").path("content").path(0).path("text").asText())
    }

    fun testAnythingElseIsGenericWithAReference() {
        val r = call("""{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"mateu_get_menu"}}""")
        val text = r.path("result").path("content").path(0).path("text").asText()
        assertTrue(text, text.startsWith("Error: An unexpected error occurred. Reference: "))
        assertFalse(text.contains("internals"))
        assertEquals(1, unexpected.size)
        assertTrue(text.endsWith(unexpected[0]))
    }

    fun testResources() {
        val list = call("""{"jsonrpc":"2.0","id":7,"method":"resources/list"}""").path("result").path("resources")
        assertEquals("mateu://desktop/screen", list.path(0).path("uri").asText())
        val read = call("""{"jsonrpc":"2.0","id":8,"method":"resources/read","params":{"uri":"mateu://desktop/screen"}}""")
        assertEquals("{\"route\":\"/x\"}", read.path("result").path("contents").path(0).path("text").asText())
        val missing = call("""{"jsonrpc":"2.0","id":9,"method":"resources/read","params":{"uri":"mateu://nope"}}""")
        assertEquals(-32002, missing.path("error").path("code").asInt())
        val noUri = call("""{"jsonrpc":"2.0","id":10,"method":"resources/read","params":{}}""")
        assertEquals(-32602, noUri.path("error").path("code").asInt())
    }

    fun testUnknownMethodsAndBadJson() {
        assertEquals(-32601, call("""{"jsonrpc":"2.0","id":11,"method":"nope"}""").path("error").path("code").asInt())
        assertEquals(-32700, call("{not json").path("error").path("code").asInt())
        assertEquals(-32600, call("[1,2]").path("error").path("code").asInt())
    }
}
