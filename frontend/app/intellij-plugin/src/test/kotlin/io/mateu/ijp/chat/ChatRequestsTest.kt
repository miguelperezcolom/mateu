package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The request side: url resolution, the body, the menu context, the screen projection, uploads. */
class ChatRequestsTest : TestCase() {
    private val mapper = ObjectMapper()

    fun testRelativeUrlsResolveAgainstTheBackendWithUrlSemantics() {
        assertEquals("http://h:8080/api/ai/chat", ChatRequests.resolve("/api/ai/chat", "http://h:8080/admin"))
        assertEquals("http://h:8080/admin/api/chat", ChatRequests.resolve("api/chat", "http://h:8080/admin/"))
        assertEquals("http://h:8080/api/chat", ChatRequests.resolve("api/chat", "http://h:8080/admin"))
        assertEquals("http://h:8080/api/chat", ChatRequests.resolve("api/chat", "http://h:8080"))
        assertEquals("https://ai.example.com/chat", ChatRequests.resolve("https://ai.example.com/chat", "http://h:8080"))
        assertEquals("/x", ChatRequests.resolve("/x", ""))
        assertNull(ChatRequests.resolve("  ", "http://h"))
        assertNull(ChatRequests.resolve(null, "http://h"))
    }

    private val menu = mapper.readTree(
        """
        [
          {"label":"Bookings","submenus":[
            {"label":"List","route":"/bookings","consumedRoute":"","actionId":null,"serverSideType":"app.Bookings","description":"All bookings"},
            {"separator":true},
            {"label":"Remote","remote":true,"route":"/r"}
          ]},
          {"label":"Home","route":"/","baseUrl":"http://h","uriPrefix":"/p","actionId":"go"}
        ]
        """,
    )

    fun testTheMenuIsFlattenedWithBreadcrumbsAndTheNavigationPayload() {
        val entries = ChatRequests.menuContext(menu)
        assertEquals(2, entries.size)
        assertEquals(listOf("Bookings", "List"), entries[0]["path"])
        assertEquals("All bookings", entries[0]["description"])
        assertEquals(
            mapOf("route" to "/bookings", "consumedRoute" to "", "actionId" to "", "serverSideType" to "app.Bookings"),
            entries[0]["navigation"],
        )
        assertEquals(
            mapOf("route" to "/", "actionId" to "go", "baseUrl" to "http://h", "uriPrefix" to "/p"),
            entries[1]["navigation"],
        )
        assertEquals(emptyList<Any>(), ChatRequests.menuContext(null))
    }

    private val tree = mapper.readTree(
        """
        {"metadata":{"type":"Page","title":"Order"},"children":[
          {"metadata":{"type":"FormField","fieldId":"name","label":"Name","dataType":"string"}},
          {"metadata":{"type":"FormLayout"},"children":[
             {"metadata":{"type":"FormField","fieldId":"qty","label":"Quantity","dataType":"integer"}},
             {"metadata":{"type":"FormField","fieldId":"name","label":"dup","dataType":"string"}}
          ]},
          {"metadata":{"type":"Button","actionId":"save","label":"Save"}}
        ]}
        """,
    )

    fun testTheScreenProjectionDescribesFieldsAndActions() {
        val screen = ChatRequests.screen(ChatScreenContext(screenTitle = "Order 4", componentState = mapOf("name" to "Ann", "qty" to 2), tree = tree))!!
        assertEquals("Order 4", screen["title"])
        assertEquals(
            listOf(
                mapOf("id" to "name", "label" to "Name", "dataType" to "string", "value" to "Ann"),
                mapOf("id" to "qty", "label" to "Quantity", "dataType" to "integer", "value" to 2),
            ),
            screen["fields"],
        )
        assertEquals(listOf(mapOf("id" to "save", "label" to "Save")), screen["actions"])
        assertNull(ChatRequests.screen(ChatScreenContext()))
    }

    fun testTheBodyCarriesContextMenuOnFirstMessageMcpAndAttachments() {
        val ctx = ChatScreenContext(route = "/orders/4", screenTitle = "Order 4", appState = mapOf("hotel" to "H1"), componentState = mapOf("name" to "Ann"), tree = tree)
        val first = ChatRequests.body("hi", "chat-1", ctx, "http://h/mcp", menu, true, listOf(ChatAttachment("a.txt", "up/a.txt")))
        assertEquals("hi", first["message"])
        assertEquals("chat-1", first["sessionId"])
        assertEquals("/orders/4", first["currentRoute"])
        assertEquals("http://h/mcp", first["mcpUrl"])
        assertEquals(listOf(mapOf("name" to "a.txt", "path" to "up/a.txt")), first["attachments"])
        @Suppress("UNCHECKED_CAST")
        val context = first["context"] as Map<String, Any?>
        assertEquals("/orders/4", context["route"])
        assertEquals("Order 4", context["screenTitle"])
        assertEquals(mapOf("hotel" to "H1"), context["appState"])
        assertEquals(mapOf("name" to "Ann"), context["componentState"])
        assertNotNull(first["screen"])
        assertEquals(2, (first["menuContext"] as List<*>).size)

        val next = ChatRequests.body("again", "chat-1", null, null, menu, false)
        assertEquals(setOf("message", "sessionId"), next.keys)
        val json = mapper.readTree(ChatRequests.json(next))
        assertEquals("again", json.path("message").asText())
    }

    fun testSessionIdsAreUnguessable() {
        val a = ChatRequests.newSessionId()
        assertTrue(a.matches(Regex("chat-[0-9a-f]{32}")))
        assertFalse(a == ChatRequests.newSessionId())
    }

    fun testMultipartCarriesTheSessionAndOneFilesPartPerFile() {
        val body = String(ChatRequests.multipart("B", "s1", listOf("a\".txt" to "hello".toByteArray(), "b.bin" to byteArrayOf(1))), Charsets.UTF_8)
        assertTrue(body.startsWith("--B\r\nContent-Disposition: form-data; name=\"sessionId\"\r\n\r\ns1\r\n"))
        assertTrue(body.contains("name=\"files\"; filename=\"a%22.txt\"\r\nContent-Type: application/octet-stream\r\n\r\nhello\r\n"))
        assertTrue(body.contains("filename=\"b.bin\""))
        assertTrue(body.endsWith("--B--\r\n"))
    }

    fun testUploadAnswerBecomesAttachments() {
        assertEquals(
            listOf(ChatAttachment("a.txt", "u/a.txt"), ChatAttachment("u/b", "u/b")),
            ChatRequests.uploadedFiles("""{"files":[{"name":"a.txt","path":"u/a.txt"},{"path":"u/b"},{"name":"x"}]}"""),
        )
        assertEquals(emptyList<ChatAttachment>(), ChatRequests.uploadedFiles("not json"))
    }
}
