package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.Expressions

/**
 * What the user sees, as compact JSON for an agent (`mateu_get_screen`, `mateu://desktop/screen`) —
 * pure: built from the WIRE model the view rendered (its component tree, its state, its listing
 * pages) and nothing else. It never adds what the wire did not send: a field the server stripped for
 * this user is simply not there; a field a client rule hid is left out; a password shows as dots.
 * Long text and lists are capped and say so (`truncated`).
 *
 * "Options the UI gives" are every action the user can press on it: page toolbar and buttons, the
 * buttons inside the content, a listing's toolbar and row actions, the overlay's buttons, the app
 * header's actions — each with its id (what `mateu_run_action` takes), label and whether enabled.
 */
object ScreenSummary {

    const val MAX_TEXT = 500
    const val MAX_LIST = 50
    const val MAX_OPTIONS = 50
    const val MAX_ROWS = 50
    const val MAX_FIELDS = 200
    const val MAX_ACTIONS = 200

    /** One rendered view: its tree, the state its widgets show, and what came with it. */
    data class View(
        val content: JsonNode?,
        val state: Map<String, Any?> = emptyMap(),
        val fieldErrors: Map<String, String> = emptyMap(),
        val fieldAttributes: Map<String, Map<String, Any?>> = emptyMap(),
        /** Listing id → the last listing envelope it painted (`{page: {content, totalElements, …}}`). */
        val listings: Map<String, JsonNode> = emptyMap(),
    )

    data class Message(val variant: String, val title: String, val text: String)

    data class Input(
        val uiName: String? = null,
        val baseUrl: String? = null,
        val route: String = "",
        val windowTitle: String? = null,
        val view: View? = null,
        /** An open Drawer/Dialog component (its wire node) and the view it renders: in front of the page. */
        val overlay: Pair<JsonNode, View>? = null,
        /** The app shell's metadata (`App`): context selectors, header actions, the user. */
        val app: JsonNode? = null,
        val appState: Map<String, Any?> = emptyMap(),
        val messages: List<Message> = emptyList(),
    )

    private val nodes = JsonNodeFactory.instance

    /** Keys never walked as part of what is drawn (data, plumbing, or summarised on their own). */
    private val SKIP = setOf(
        "initialData", "state", "data", "menu", "options", "columns", "filters", "triggers", "rules",
        "validations", "actions", "restSources", "actionCatalogue", "contextSelectors", "contextActions",
        "shortcuts", "headerValues", "editorOptions", "valueLabels", "tones", "optionsSource", "rowsSource",
        "restAction", "attributes", "remoteCoordinates", "resolved", "server",
    )

    fun build(input: Input, mapper: ObjectMapper = ObjectMapper()): ObjectNode {
        val out = mapper.createObjectNode()
        val truncated = TreeSetNotes()
        out.putObject("ui").apply {
            input.uiName?.takeIf { it.isNotBlank() }?.let { put("name", it) }
            input.baseUrl?.takeIf { it.isNotBlank() }?.let { put("baseUrl", it) }
            input.app?.text("title")?.takeIf { it.isNotBlank() }?.let { put("appTitle", it) }
        }
        user(input.app, mapper)?.let { out.set<JsonNode>("user", it) }
        out.put("route", input.route)
        input.windowTitle?.takeIf { it.isNotBlank() }?.let { out.put("windowTitle", it) }
        out.put("focus", if (input.overlay != null) "overlay" else "page")

        appContext(input.app, input.appState, mapper, truncated)?.let { out.set<JsonNode>("appContext", it) }
        appActions(input.app, mapper)?.let { out.set<JsonNode>("appActions", it) }

        input.overlay?.let { (component, view) ->
            val meta = component.path("metadata")
            val o = out.putObject("overlay")
            o.put("kind", meta.text("type").lowercase().ifBlank { "overlay" })
            val ctx = exprCtx(view.state, input.appState)
            meta.text("headerTitle", meta.text("title")).takeIf { it.isNotBlank() }?.let { o.put("title", interpolate(it, ctx)) }
            meta.text("subtitle").takeIf { it.isNotBlank() }?.let { o.put("subtitle", interpolate(it, ctx)) }
            val parts = mapper.createArrayNode()
            for (key in listOf("header", "content", "footer")) meta.get(key)?.takeIf { it.isObject }?.let { parts.add(it) }
            component.path("children").forEach { parts.add(it) }
            describeView(o, parts, view, input.appState, mapper, truncated, "overlay.")
        }

        input.view?.let { view ->
            val page = if (input.overlay != null) out.putObject("page") else out
            describeView(page, view.content, view, input.appState, mapper, truncated, "")
        }

        if (input.messages.isNotEmpty()) out.putArray("messages").apply {
            input.messages.takeLast(10).forEach { m ->
                addObject().apply {
                    put("variant", m.variant)
                    if (m.title.isNotBlank()) put("title", m.title)
                    put("text", capText(m.text, "messages", truncated))
                }
            }
        }
        if (truncated.notes.isNotEmpty()) out.putArray("truncated").apply { truncated.notes.forEach { add(it) } }
        return out
    }

    /** What [build] needs to tell what a `mateu_run_action` id may be — the ids the screen offers. */
    fun offeredActionIds(summary: JsonNode): Set<String> {
        val ids = LinkedHashSet<String>()
        if (summary.has("overlay")) ids += offeredIn(summary.path("overlay"))
        ids += offeredIn(if (summary.has("page")) summary.path("page") else summary)
        fun walk(a: JsonNode) { a.text("id").takeIf { it.isNotBlank() }?.let(ids::add); a.path("children").forEach(::walk) }
        summary.path("appActions").forEach(::walk)
        return ids
    }

    /** The action ids one part of the summary (the page, or the overlay) offers. */
    fun offeredIn(part: JsonNode): Set<String> {
        val ids = LinkedHashSet<String>()
        fun walk(a: JsonNode) { a.text("id").takeIf { it.isNotBlank() }?.let(ids::add); a.path("children").forEach(::walk) }
        part.path("actions").forEach(::walk)
        part.path("otherActionIds").forEach { ids.add(it.asText()) }
        part.path("listings").forEach { l ->
            l.path("actions").forEach(::walk)
            l.path("rowActions").forEach(::walk)
            l.path("builtInActions").forEach { ids.add(it.asText()) }
        }
        return ids
    }

    // ── one view ─────────────────────────────────────────────────────────────────────────────

    private class Acc {
        var header: JsonNode? = null
        val fields = LinkedHashMap<String, JsonNode>()
        val buttons = ArrayList<JsonNode>()
        val crudNodes = ArrayList<Pair<JsonNode, JsonNode>>() // (node, metadata)
        val declared = LinkedHashSet<String>()
        val initialData = HashMap<String, JsonNode>()
    }

    private fun describeView(
        into: ObjectNode,
        tree: JsonNode?,
        view: View,
        appState: Map<String, Any?>,
        mapper: ObjectMapper,
        truncated: TreeSetNotes,
        prefix: String,
    ) {
        val acc = Acc()
        if (tree != null) walk(tree, acc, null)
        val ctx = exprCtx(view.state, appState)

        acc.header?.let { h ->
            val header = into.putObject("header")
            h.text("title").takeIf { it.isNotBlank() }?.let { header.put("title", interpolate(it, ctx)) }
            h.text("subtitle").takeIf { it.isNotBlank() }?.let { header.put("subtitle", interpolate(it, ctx)) }
            h.text("overline").takeIf { it.isNotBlank() }?.let { header.put("overline", interpolate(it, ctx)) }
            h.text("timestamp").takeIf { it.isNotBlank() }?.let { header.put("timestamp", it) }
            h.path("badges").takeIf { it.isArray && !it.isEmpty }?.let { b ->
                header.putArray("badges").apply { b.forEach { add(interpolate(it.text("text", it.text("label")), ctx)) } }
            }
            h.path("kpis").takeIf { it.isArray && !it.isEmpty }?.let { k ->
                header.putArray("kpis").apply {
                    k.forEach { addObject().apply { put("title", interpolate(it.text("title"), ctx)); put("value", interpolate(it.text("text"), ctx)) } }
                }
            }
            h.path("breadcrumbs").takeIf { it.isArray && !it.isEmpty }?.let { b ->
                into.putArray("breadcrumbs").apply {
                    b.forEach { addObject().apply { put("label", it.text("text")); it.text("link").takeIf { l -> l.isNotBlank() }?.let { l -> put("route", l) } } }
                }
            }
        }

        // fields
        val fields = into.putArray("fields")
        var count = 0
        for ((id, meta) in acc.fields) {
            val attrs = view.fieldAttributes[id].orEmpty()
            if (attrs["hidden"] == true) continue
            if (count++ >= MAX_FIELDS) { truncated.add("${prefix}fields"); break }
            fields.add(field(id, meta, view, acc, attrs, ctx, mapper, truncated, "${prefix}fields.$id"))
        }
        if (view.fieldErrors.isNotEmpty()) into.putObject("errors").apply { view.fieldErrors.forEach { (k, v) -> put(k, v) } }

        // actions: the buttons drawn on it
        val actions = into.putArray("actions")
        val seen = HashSet<String>()
        for (b in acc.buttons) {
            if (actions.size() >= MAX_ACTIONS) { truncated.add("${prefix}actions"); break }
            action(b, ctx)?.let { a -> if (seen.add(a.text("id") + "|" + a.text("label"))) actions.add(a) }
        }
        val buttonIds = actions.map { it.text("id") }.toSet()
        val others = acc.declared.filter { it !in buttonIds && it !in INTERNAL_ACTIONS }
        if (others.isNotEmpty()) into.putArray("otherActionIds").apply { others.take(MAX_ACTIONS).forEach { add(it) } }

        // listings
        if (acc.crudNodes.isNotEmpty()) {
            val listings = into.putArray("listings")
            acc.crudNodes.forEachIndexed { i, (node, meta) ->
                listings.add(listing(node, meta, i, view, ctx, mapper, truncated, prefix))
            }
        }
    }

    /** Actions the renderer runs on its own (a search box, a pager): not options of their own. */
    private val INTERNAL_ACTIONS = setOf("search", "__restdata__", "__restfetch__", "nextPage", "prevPage", "update-row")

    private fun walk(n: JsonNode, acc: Acc, inherited: JsonNode?) {
        when {
            n.isArray -> n.forEach { walk(it, acc, inherited) }
            n.isObject -> {
                var initial = inherited
                val type = n.text("type")
                if (type == "ServerSide") {
                    n.path("initialData").takeIf { it.isObject }?.let { initial = it }
                    n.path("actions").forEach { a -> a.text("id").takeIf { it.isNotBlank() }?.let(acc.declared::add) }
                }
                when (type) {
                    "FormField" -> {
                        val id = n.text("fieldId")
                        if (id.isNotBlank() && id !in acc.fields) {
                            acc.fields[id] = n
                            initial?.get(id)?.let { acc.initialData.putIfAbsent(id, it) }
                        }
                    }
                    // a button group's children are listed under it, not again on their own
                    "Button" -> { acc.buttons.add(n); return }
                    "Page", "Form" -> {
                        if (acc.header == null) acc.header = n
                        n.path("actions").forEach { a -> a.text("id").takeIf { it.isNotBlank() }?.let(acc.declared::add) }
                    }
                }
                val meta = n.get("metadata")
                if (meta != null && meta.isObject) {
                    if (meta.text("type") == "Crud") {
                        acc.crudNodes.add(n to meta)
                        // its toolbar is the listing's: summarised with it
                        walkChildren(meta, acc, initial, skipAlso = setOf("toolbar"))
                    } else {
                        walk(meta, acc, initial)
                    }
                }
                walkChildren(n, acc, initial, skipAlso = setOf("metadata"))
            }
        }
    }

    private fun walkChildren(n: JsonNode, acc: Acc, initial: JsonNode?, skipAlso: Set<String>) {
        n.properties().forEach { (k, v) ->
            if (k in SKIP || k in skipAlso) return@forEach
            if (v.isObject || v.isArray) walk(v, acc, initial)
        }
    }

    private fun field(
        id: String,
        meta: JsonNode,
        view: View,
        acc: Acc,
        attrs: Map<String, Any?>,
        ctx: Map<String, Any?>,
        mapper: ObjectMapper,
        truncated: TreeSetNotes,
        path: String,
    ): ObjectNode = mapper.createObjectNode().apply {
        put("id", id)
        meta.text("label").takeIf { it.isNotBlank() }?.let { put("label", interpolate(it, ctx)) }
        put("type", meta.text("dataType"))
        meta.text("stereotype").takeIf { it.isNotBlank() && it != "regular" }?.let { put("stereotype", it) }
        if (meta.bool("required")) put("required", true)
        if (meta.bool("readOnly") || attrs["disabled"] == true) put("readOnly", true)
        meta.text("description").takeIf { it.isNotBlank() }?.let { put("help", capText(it, path, truncated)) }
        val raw: Any? = if (view.state.containsKey(id)) view.state[id] else acc.initialData[id]
        val value = mapper.valueToTree<JsonNode>(raw)
        if (isSecret(meta)) {
            put("value", if (value == null || value.isNull || value.asText("").isEmpty()) "" else "••••••")
        } else {
            set<JsonNode>("value", cap(value, path, truncated))
        }
        val options = meta.path("options")
        if (options.isArray && !options.isEmpty) {
            putArray("options").apply {
                options.take(MAX_OPTIONS).forEach { o -> addObject().apply { put("value", o.text("value")); put("label", o.text("label", o.text("value"))) } }
            }
            if (options.size() > MAX_OPTIONS) truncated.add("$path.options")
        } else if (!meta.path("optionsSource").isMissingNode && !meta.path("optionsSource").isNull) {
            put("optionsFrom", "a source the renderer fetches")
        }
        view.fieldErrors[id]?.let { put("error", it) }
    }

    private fun isSecret(meta: JsonNode): Boolean {
        val s = meta.text("stereotype").lowercase()
        return s == "password" || meta.text("dataType").lowercase() == "password"
    }

    private fun action(b: JsonNode, ctx: Map<String, Any?>): ObjectNode? {
        val id = b.text("actionId")
        val route = b.text("route")
        val label = interpolate(b.text("label"), ctx)
        val children = b.path("children").takeIf { it.isArray && !it.isEmpty }
        if (id.isBlank() && route.isBlank() && children == null) return null
        return nodes.objectNode().apply {
            put("id", id.ifBlank { route.ifBlank { label } })
            if (label.isNotBlank()) put("label", label)
            put("enabled", !b.bool("disabled"))
            if (route.isNotBlank()) put("navigatesTo", route)
            if (b.bool("rowsSelectedRequired")) put("needsSelectedRows", true)
            children?.let { c ->
                putArray("children").apply { c.forEach { child -> action(child, ctx)?.let { add(it) } } }
            }
        }
    }

    private fun listing(
        node: JsonNode,
        meta: JsonNode,
        index: Int,
        view: View,
        ctx: Map<String, Any?>,
        mapper: ObjectMapper,
        truncated: TreeSetNotes,
        prefix: String,
    ): ObjectNode {
        val id = node.text("id").ifBlank { meta.text("id") }.ifBlank { "crud" }
        val path = "${prefix}listings.$id"
        val out = mapper.createObjectNode()
        out.put("id", id)
        meta.text("title").takeIf { it.isNotBlank() }?.let { out.put("title", interpolate(it, ctx)) }
        val columns = meta.path("columns").map { c -> c.path("metadata").takeIf { it.isObject } ?: c }
        out.putArray("columns").apply {
            columns.forEach { c -> addObject().apply { put("id", c.text("id")); put("label", c.text("label")) } }
        }
        // the listing's toolbar
        val actions = out.putArray("actions")
        meta.path("toolbar").forEach { b -> action(b, ctx)?.let { actions.add(it) } }
        // search, filters, sort, page — from the state the listing searches with
        if (meta.bool("searchable")) out.put("searchText", view.state["searchText"]?.toString().orEmpty())
        val filters = meta.path("filters")
        if (filters.isArray && !filters.isEmpty) out.putArray("filters").apply {
            filters.forEach { f ->
                val fid = f.text("fieldId")
                addObject().apply {
                    put("id", fid)
                    put("label", f.text("label", fid))
                    put("type", f.text("dataType"))
                    view.state[fid]?.let { set<JsonNode>("value", cap(mapper.valueToTree(it), "$path.filters.$fid", truncated)) }
                    view.state["${fid}_from"]?.let { set<JsonNode>("from", mapper.valueToTree(it)) }
                    view.state["${fid}_to"]?.let { set<JsonNode>("to", mapper.valueToTree(it)) }
                    f.path("options").takeIf { it.isArray && !it.isEmpty }?.let { o ->
                        putArray("options").apply { o.take(MAX_OPTIONS).forEach { addObject().apply { put("value", it.text("value")); put("label", it.text("label")) } } }
                    }
                }
            }
        }
        view.state["sort"]?.let { s -> mapper.valueToTree<JsonNode>(s).takeIf { it.isArray && !it.isEmpty }?.let { out.set<JsonNode>("sort", it) } }

        // the page it painted
        val envelope = view.listings[id] ?: view.listings["crud"]
        val page = envelope?.let { e -> e.path("crud").path("page").takeIf { it.isObject } ?: e.path("page").takeIf { it.isObject } ?: e }
        val rows = page?.path("content")?.takeIf { it.isArray }?.toList().orEmpty()
        if (page != null) {
            out.put("page", page.path("pageNumber").asInt(0))
            out.put("pageSize", page.path("pageSize").asInt(rows.size))
            page.path("totalElements").takeIf { it.isNumber }?.let { out.put("totalElements", it.asLong()) }
        }
        val rowsOut = out.putArray("rows")
        val colIds = columns.map { it.text("id") }.filter { it.isNotBlank() }
        rows.take(MAX_ROWS).forEach { row ->
            rowsOut.addObject().apply {
                val keys = colIds.ifEmpty { row.fieldNames().asSequence().filter { !it.startsWith("_") }.toList() }
                for (k in keys) {
                    val cell = row.get(k) ?: continue
                    val col = columns.firstOrNull { it.text("id") == k }
                    set<JsonNode>(k, cellValue(cell, col, path, truncated))
                }
            }
        }
        if (rows.size > MAX_ROWS) truncated.add("$path.rows")

        // what a row offers: opening it, its link columns, its own actions
        val rowActions = out.putArray("rowActions")
        val rowOpens = meta.text("rowRoute").isNotBlank() || columns.any { it.text("actionId") == "view" }
        if (rowOpens) rowActions.addObject().apply { put("id", OPEN_ROW_ACTION); put("label", "Open"); put("tool", McpTools.OPEN_ROW) }
        columns.filter { it.text("actionId").isNotBlank() && it.text("actionId") != "view" }.forEach { c ->
            rowActions.addObject().apply { put("id", c.text("actionId")); put("label", c.text("label")) }
        }
        val seen = HashSet<String>()
        columns.filter { it.text("dataType") in setOf("action", "actionGroup", "menu") }.forEach { c ->
            rows.forEach { row ->
                for (a in rowActionsOf(row.path(c.text("id")), c.text("dataType"))) {
                    val method = a.text("methodNameInCrud")
                    if (method.isNotBlank() && seen.add(method)) rowActions.addObject().apply {
                        put("id", "action-on-row-$method"); put("label", a.text("label", method))
                    }
                }
            }
        }
        if (meta.bool("rowsSelectionEnabled")) out.put("rowsSelectable", true)
        // what the listing's own search box and pager do: run `search` after setting searchText /
        // the filters (mateu_set_fields); page with nextPage / prevPage
        val restRows = meta.path("rowsSource").let { it.isObject }
        if (restRows) {
            // fetched by the renderer from a REST source: its search box and pager are the user's
            out.put("rowsFrom", "a REST source the app fetches; search and paging are not offered to agents")
        } else {
            out.putArray("builtInActions").apply {
                add("search")
                if (page != null) { add("nextPage"); add("prevPage") }
            }
        }
        return out
    }

    const val OPEN_ROW_ACTION = "open-row"

    internal fun rowActionsOf(cell: JsonNode?, dataType: String): List<JsonNode> {
        if (cell == null || cell.isNull || cell.isMissingNode) return emptyList()
        return if (dataType == "action") listOfNotNull(cell.takeIf { it.has("methodNameInCrud") })
        else cell.path("actions").takeIf { it.isArray }?.toList().orEmpty()
    }

    private fun cellValue(cell: JsonNode, col: JsonNode?, path: String, truncated: TreeSetNotes): JsonNode {
        // a status / link cell is an object: what it shows is its text
        if (cell.isObject) {
            listOf("message", "text", "label", "value").firstOrNull { cell.path(it).isValueNode }?.let { return capText(cell.path(it).asText(), path, truncated).let(nodes::textNode) }
        }
        if (cell.isValueNode && col != null) {
            col.path("valueLabels").get(cell.asText())?.takeIf { it.isTextual }?.let { return it }
        }
        return cap(cell, path, truncated)
    }

    // ── the app shell ────────────────────────────────────────────────────────────────────────

    private fun appContext(app: JsonNode?, appState: Map<String, Any?>, mapper: ObjectMapper, truncated: TreeSetNotes): ArrayNode? {
        val selectors = app?.path("contextSelectors")?.takeIf { it.isArray && !it.isEmpty } ?: return null
        return mapper.createArrayNode().apply {
            selectors.forEach { s ->
                val field = s.text("fieldName")
                val value = appState[field]?.let { if (it is JsonNode) it.asText() else it.toString() }.orEmpty()
                addObject().apply {
                    put("field", field)
                    put("label", s.text("label", field))
                    put("value", value)
                    s.path("options").firstOrNull { it.text("value") == value }?.let { put("valueLabel", it.text("label")) }
                    val options = s.path("options")
                    putArray("options").apply { options.take(MAX_OPTIONS).forEach { addObject().apply { put("value", it.text("value")); put("label", it.text("label")) } } }
                    if (options.size() > MAX_OPTIONS) truncated.add("appContext.$field.options")
                }
            }
        }
    }

    private fun appActions(app: JsonNode?, mapper: ObjectMapper): ArrayNode? {
        val list = app?.path("contextActions")?.takeIf { it.isArray && !it.isEmpty } ?: return null
        fun one(a: JsonNode): ObjectNode = mapper.createObjectNode().apply {
            put("id", a.text("actionId"))
            put("label", a.text("label", a.text("actionId")))
            a.text("route").takeIf { it.isNotBlank() }?.let { put("navigatesTo", it) }
            a.path("children").takeIf { it.isArray && !it.isEmpty }?.let { c -> putArray("children").apply { c.forEach { add(one(it)) } } }
        }
        return mapper.createArrayNode().apply { list.forEach { add(one(it)) } }
    }

    /** The signed-in user, when the shell carries one (`App.user`): never a token or a secret. */
    private fun user(app: JsonNode?, mapper: ObjectMapper): JsonNode? {
        val u = app?.get("user")?.takeIf { it.isObject || it.isTextual } ?: return null
        if (u.isTextual) return u
        return mapper.createObjectNode().apply {
            u.properties().forEach { (k, v) ->
                val lower = k.lowercase()
                if (v.isValueNode && listOf("token", "secret", "password", "credential").none { lower.contains(it) }) set<JsonNode>(k, v)
            }
        }
    }

    // ── values ───────────────────────────────────────────────────────────────────────────────

    private fun exprCtx(state: Map<String, Any?>, appState: Map<String, Any?>): Map<String, Any?> =
        mapOf("state" to state, "appState" to appState, "data" to emptyMap<String, Any?>())

    private fun interpolate(text: String, ctx: Map<String, Any?>): String =
        if (!text.contains("\${")) text else runCatching { Expressions.interpolate(text, ctx) }.getOrDefault(text)

    private fun capText(text: String, path: String, truncated: TreeSetNotes): String {
        if (text.startsWith("data:")) { truncated.add(path); return "[${text.substringBefore(',').substringBefore(';')} data, ${text.length} characters]" }
        if (text.length <= MAX_TEXT) return text
        truncated.add(path)
        return text.substring(0, MAX_TEXT) + "…"
    }

    internal fun cap(value: JsonNode?, path: String, truncated: TreeSetNotes, depth: Int = 0): JsonNode {
        if (value == null || value.isNull || value.isMissingNode) return nodes.nullNode()
        return when {
            value.isTextual -> nodes.textNode(capText(value.asText(), path, truncated))
            value.isArray -> nodes.arrayNode().apply {
                value.take(MAX_LIST).forEach { add(cap(it, path, truncated, depth + 1)) }
                if (value.size() > MAX_LIST) truncated.add(path)
            }
            value.isObject -> if (depth >= 4) { truncated.add(path); nodes.textNode("{…}") } else nodes.objectNode().apply {
                value.properties().take(MAX_LIST).forEach { (k, v) -> set<JsonNode>(k, cap(v, path, truncated, depth + 1)) }
                if (value.size() > MAX_LIST) truncated.add(path)
            }
            else -> value
        }
    }

    /** The paths whose content was cut, sorted and unique. */
    internal class TreeSetNotes {
        val notes = sortedSetOf<String>()
        fun add(path: String) { notes.add(path) }
    }
}
