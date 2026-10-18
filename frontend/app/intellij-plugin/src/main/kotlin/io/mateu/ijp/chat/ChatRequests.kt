package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.net.URI

/** One file the upload endpoint saved, sent with the next message as an attachment. */
data class ChatAttachment(val name: String, val path: String)

/** What is on screen when the user sends a message (the request's `context` + `currentRoute`). */
data class ChatScreenContext(
    val route: String? = null,
    val screenTitle: String? = null,
    val appState: Map<String, Any?> = emptyMap(),
    val componentState: Map<String, Any?> = emptyMap(),
    /** The rendered wire tree, for the self-describing `screen` projection (optional). */
    val tree: JsonNode? = null,
)

/**
 * The request side of the chat contract: url resolution, the JSON body, the menu context, the
 * screen projection and the multipart upload. Pure, so every rule is unit-tested.
 */
object ChatRequests {
    private val mapper = ObjectMapper()

    /**
     * A url the app declares (sseUrl, uploadUrl, mcpUrl) resolved against the app's backend [baseUrl]
     * with URL semantics: "/x" → the backend's origin + /x, "x" → relative to the base path; an
     * absolute url is kept. Blank → null.
     */
    fun resolve(url: String?, baseUrl: String): String? {
        val u = url?.trim().orEmpty()
        if (u.isEmpty()) return null
        return runCatching {
            val parsed = URI(u)
            if (parsed.isAbsolute) return u
            val base = baseUrl.trim()
            if (base.isEmpty()) return u
            val baseUri = URI(base)
            // a base without a path ("http://h:8080") resolves "x" to "http://h:8080x" otherwise
            val withPath = if (baseUri.rawPath.isNullOrEmpty()) URI("$base/") else baseUri
            withPath.resolve(parsed).toString()
        }.getOrElse { u }
    }

    /**
     * The menu flattened into LLM-friendly entries — the breadcrumb and the navigation payload the
     * agent emits (as a `navigation-requested`) to open that screen. Separators and unresolved remote
     * entries are skipped, exactly as the web does.
     */
    fun menuContext(menu: JsonNode?, parentPath: List<String> = emptyList()): List<Map<String, Any?>> {
        if (menu == null || !menu.isArray) return emptyList()
        val out = ArrayList<Map<String, Any?>>()
        for (opt in menu) {
            if (opt.path("separator").asBoolean(false)) continue
            if (opt.path("remote").asBoolean(false)) continue
            val path = parentPath + opt.path("label").asText("")
            val submenus = opt.path("submenus")
            if (submenus.isArray && !submenus.isEmpty) {
                out.addAll(menuContext(submenus, path))
                continue
            }
            val navigation = linkedMapOf<String, Any?>(
                "route" to text(opt, "route"),
                "consumedRoute" to text(opt, "consumedRoute"),
                "actionId" to (text(opt, "actionId") ?: ""),
                "baseUrl" to text(opt, "baseUrl"),
                "serverSideType" to text(opt, "serverSideType"),
                "uriPrefix" to text(opt, "uriPrefix"),
            ).filterValues { it != null }
            val entry = linkedMapOf<String, Any?>("path" to path)
            text(opt, "description")?.takeIf { it.isNotBlank() }?.let { entry["description"] = it }
            opt.path("listing").takeIf { it.isObject }?.let { entry["listing"] = mapper.convertValue(it, Map::class.java) }
            entry["navigation"] = navigation
            out.add(entry)
        }
        return out
    }

    /**
     * A SELF-DESCRIBING projection of the screen (fields with label/type/value + the actions it
     * offers), derived from the wire tree; null when it has nothing to say.
     */
    fun screen(context: ChatScreenContext): Map<String, Any?>? {
        val tree = context.tree
        val fields = ArrayList<Map<String, Any?>>()
        val actions = ArrayList<Map<String, Any?>>()
        val seenFields = HashSet<String>()
        val seenActions = HashSet<String>()
        fun walk(node: JsonNode, depth: Int) {
            if (depth > 60 || fields.size + actions.size > 400) return
            if (node.isObject) {
                val meta = node.path("metadata")
                when (meta.path("type").asText("")) {
                    "FormField" -> {
                        val id = meta.path("fieldId").asText("")
                        if (id.isNotBlank() && seenFields.add(id)) {
                            fields.add(
                                linkedMapOf<String, Any?>(
                                    "id" to id,
                                    "label" to meta.path("label").asText(id),
                                    "dataType" to meta.path("dataType").asText(""),
                                    "value" to context.componentState[id],
                                ),
                            )
                        }
                    }
                    "Button" -> {
                        val id = meta.path("actionId").asText("")
                        if (id.isNotBlank() && seenActions.add(id)) {
                            actions.add(linkedMapOf<String, Any?>("id" to id, "label" to meta.path("label").asText(id)))
                        }
                    }
                }
                node.properties().forEach { (_, v) -> if (v.isContainerNode) walk(v, depth + 1) }
            } else if (node.isArray) {
                node.forEach { if (it.isContainerNode) walk(it, depth + 1) }
            }
        }
        if (tree != null) walk(tree, 0)
        val title = context.screenTitle?.takeIf { it.isNotBlank() }
        if (fields.isEmpty() && actions.isEmpty() && title == null) return null
        return linkedMapOf("title" to title, "fields" to fields, "actions" to actions)
    }

    /** The JSON body of one message; absent keys are omitted. */
    fun body(
        message: String,
        sessionId: String,
        screen: ChatScreenContext?,
        mcpUrl: String?,
        menu: JsonNode?,
        firstMessage: Boolean,
        attachments: List<ChatAttachment> = emptyList(),
    ): Map<String, Any?> {
        val body = linkedMapOf<String, Any?>("message" to message, "sessionId" to sessionId)
        screen?.route?.let { body["currentRoute"] = it }
        if (attachments.isNotEmpty()) body["attachments"] = attachments.map { mapOf("name" to it.name, "path" to it.path) }
        if (screen != null) {
            val context = linkedMapOf<String, Any?>()
            screen.route?.let { context["route"] = it }
            screen.screenTitle?.takeIf { it.isNotBlank() }?.let { context["screenTitle"] = it }
            context["appState"] = screen.appState
            context["componentState"] = screen.componentState
            body["context"] = context
            screen(screen)?.let { body["screen"] = it }
        }
        mcpUrl?.takeIf { it.isNotBlank() }?.let { body["mcpUrl"] = it }
        if (firstMessage) body["menuContext"] = menuContext(menu)
        return body
    }

    fun json(body: Map<String, Any?>): String = mapper.writeValueAsString(body)

    /** A fresh, unguessable chat session id (CSPRNG). */
    fun newSessionId(): String {
        val bytes = ByteArray(16)
        java.security.SecureRandom().nextBytes(bytes)
        return "chat-" + bytes.joinToString("") { "%02x".format(it) }
    }

    /** The multipart body of an upload: field "sessionId" + one "files" part per file. */
    fun multipart(boundary: String, sessionId: String, files: List<Pair<String, ByteArray>>): ByteArray {
        val out = java.io.ByteArrayOutputStream()
        fun w(s: String) = out.write(s.toByteArray(Charsets.UTF_8))
        w("--$boundary\r\nContent-Disposition: form-data; name=\"sessionId\"\r\n\r\n$sessionId\r\n")
        for ((name, content) in files) {
            val safe = name.replace("\"", "%22").replace("\r", "").replace("\n", "")
            w("--$boundary\r\nContent-Disposition: form-data; name=\"files\"; filename=\"$safe\"\r\n")
            w("Content-Type: application/octet-stream\r\n\r\n")
            out.write(content)
            w("\r\n")
        }
        w("--$boundary--\r\n")
        return out.toByteArray()
    }

    /** The upload endpoint's answer `{files:[{name,path}]}` → the attachments (entries without a path dropped). */
    fun uploadedFiles(response: String): List<ChatAttachment> {
        val tree = runCatching { mapper.readTree(response) }.getOrNull() ?: return emptyList()
        return tree.path("files").mapNotNull { f ->
            val path = f.path("path").asText("")
            if (path.isBlank()) null else ChatAttachment(f.path("name").asText(path), path)
        }
    }

    private fun text(node: JsonNode, field: String): String? =
        node.path(field).takeIf { it.isTextual }?.asText()
}
