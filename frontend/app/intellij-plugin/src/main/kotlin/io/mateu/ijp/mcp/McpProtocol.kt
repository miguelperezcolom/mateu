package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode

/** A mistake of the caller (an unknown tool, an action not on screen…): shown to the agent as written. */
class McpToolError(message: String) : RuntimeException(message)

/** An MCP resource this server lists (`resources/list`) and reads (`resources/read`). */
data class McpResource(val uri: String, val name: String, val description: String, val mimeType: String)

/** What the protocol needs from the app: the tools, and the resources' contents. */
interface McpHost {
    /** Runs [name] with [args]; throws [McpToolError] for a caller mistake. */
    fun callTool(name: String, args: JsonNode): JsonNode

    val resources: List<McpResource>

    /** The text of [uri], or null when there is no such resource. */
    fun readResource(uri: String): String?
}

/**
 * The desktop app's MCP server as JSON-RPC 2.0 — pure: a request body in, a response body out
 * (null for a notification). The same shape as the backends' MCP (`McpJsonRpc`, protocol version
 * 2024-11-05, see conformance/mcp/README.md): `initialize`, `notifications/initialized`, `ping`,
 * `tools/list`, `tools/call` (a tool error is a result with `isError`, not a protocol error),
 * `resources/list`, `resources/read`.
 */
class McpProtocol(
    private val host: McpHost,
    private val mapper: ObjectMapper = ObjectMapper(),
    private val onUnexpected: (reference: String, error: Throwable) -> Unit = { _, _ -> },
) {

    fun handle(body: String): String? {
        val message = runCatching { mapper.readTree(body) }.getOrNull()
            ?: return write(error(mapper.nullNode(), -32700, "Parse error"))
        return handle(message)?.let(::write)
    }

    fun handle(message: JsonNode): JsonNode? {
        if (!message.isObject) return error(mapper.nullNode(), -32600, "Invalid Request")
        val id = message.get("id")
        val notification = id == null || id.isNull
        val method = message.path("method").asText("")
        return try {
            when (method) {
                "initialize" -> response(id, mapper.createObjectNode().apply {
                    put("protocolVersion", PROTOCOL_VERSION)
                    putObject("capabilities").apply { putObject("tools"); putObject("resources") }
                    putObject("serverInfo").apply { put("name", SERVER_NAME); put("version", SERVER_VERSION) }
                    put("instructions", INSTRUCTIONS)
                })
                "notifications/initialized", "initialized" -> null
                "ping" -> response(id, mapper.createObjectNode())
                "tools/list" -> response(id, mapper.createObjectNode().apply { set<JsonNode>("tools", McpTools.definitions(mapper)) })
                "resources/list" -> response(id, mapper.createObjectNode().apply {
                    val list = putArray("resources")
                    for (r in host.resources) list.addObject().apply {
                        put("uri", r.uri); put("name", r.name); put("description", r.description); put("mimeType", r.mimeType)
                    }
                })
                "resources/read" -> {
                    val uri = message.path("params").path("uri").takeIf { it.isTextual }?.asText()
                        ?: return error(id, -32602, "Invalid params: uri is required")
                    val resource = host.resources.firstOrNull { it.uri == uri }
                    val text = resource?.let { host.readResource(uri) } ?: return error(id, -32002, "Resource not found: $uri")
                    response(id, mapper.createObjectNode().apply {
                        putArray("contents").addObject().apply { put("uri", uri); put("mimeType", resource.mimeType); put("text", text) }
                    })
                }
                "tools/call" -> response(id, callTool(message.path("params")))
                else -> if (notification) null else error(id, -32601, "Method not found: $method")
            }
        } catch (e: Exception) {
            if (notification) null else error(id, -32603, unexpected(e))
        }
    }

    private fun callTool(params: JsonNode): ObjectNode {
        val name = params.path("name").asText("")
        val args = params.path("arguments").takeIf { it.isObject } ?: mapper.createObjectNode()
        return try {
            if (name !in McpTools.NAMES) throw McpToolError("Unknown tool: $name")
            val data = host.callTool(name, args)
            toolResult(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data), isError = false)
        } catch (e: McpToolError) {
            toolResult("Error: ${e.message}", isError = true)
        } catch (e: Exception) {
            toolResult("Error: ${unexpected(e)}", isError = true)
        }
    }

    /** Anything that is not the caller's mistake: a generic text with a reference, logged under it. */
    private fun unexpected(e: Throwable): String {
        val reference = java.util.UUID.randomUUID().toString().substring(0, 8)
        onUnexpected(reference, e)
        return "An unexpected error occurred. Reference: $reference"
    }

    private fun toolResult(text: String, isError: Boolean): ObjectNode = mapper.createObjectNode().apply {
        putArray("content").addObject().apply { put("type", "text"); put("text", text) }
        if (isError) put("isError", true)
    }

    private fun response(id: JsonNode?, result: JsonNode): ObjectNode = mapper.createObjectNode().apply {
        put("jsonrpc", "2.0")
        set<JsonNode>("id", id ?: mapper.nullNode())
        set<JsonNode>("result", result)
    }

    private fun error(id: JsonNode?, code: Int, message: String): ObjectNode = mapper.createObjectNode().apply {
        put("jsonrpc", "2.0")
        set<JsonNode>("id", id ?: mapper.nullNode())
        putObject("error").apply { put("code", code); put("message", message) }
    }

    private fun write(node: JsonNode): String = mapper.writeValueAsString(node)

    companion object {
        const val PROTOCOL_VERSION = "2024-11-05"
        const val SERVER_NAME = "mateu-desktop"
        const val SERVER_VERSION = "0.1.0"

        const val INSTRUCTIONS =
            "You operate the Mateu desktop app AS ITS USER, on screen. Start with mateu_get_screen (what the user sees: " +
                "the UI, the route, the page header, fields with values, the actions they can press, listing rows) and " +
                "mateu_get_menu. Change fields with mateu_set_fields and press buttons with mateu_run_action — only what the " +
                "screen offers. To build a new screen, read mateu://guide and the catalog (mateu_list_components / " +
                "mateu_get_component_schema), then mateu_show_screen with a YAML page definition. The server's permissions apply."
    }
}
