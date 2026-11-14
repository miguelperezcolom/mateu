package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode

/** The desktop MCP server's tools: names, descriptions and input schemas (`tools/list`). */
object McpTools {

    const val LIST_UIS = "mateu_list_uis"
    const val OPEN_UI = "mateu_open_ui"
    const val GET_MENU = "mateu_get_menu"
    const val NAVIGATE = "mateu_navigate"
    const val GET_SCREEN = "mateu_get_screen"
    const val SET_FIELDS = "mateu_set_fields"
    const val RUN_ACTION = "mateu_run_action"
    const val OPEN_ROW = "mateu_open_row"
    const val SHOW_SCREEN = "mateu_show_screen"
    const val GET_GUIDE = "mateu_get_guide"
    const val LIST_COMPONENTS = "mateu_list_components"
    const val GET_COMPONENT_SCHEMA = "mateu_get_component_schema"

    private class Tool(val name: String, val description: String, val schema: (ObjectMapper) -> ObjectNode)

    private fun obj(m: ObjectMapper, required: List<String> = emptyList(), props: ObjectNode.() -> Unit): ObjectNode =
        m.createObjectNode().apply {
            put("type", "object")
            putObject("properties").apply(props)
            if (required.isNotEmpty()) putArray("required").apply { required.forEach { add(it) } }
        }

    private fun ObjectNode.prop(name: String, type: String, description: String) {
        putObject(name).apply { put("type", type); put("description", description) }
    }

    private val TOOLS = listOf(
        Tool(LIST_UIS, "The Mateu UIs available in this app (the hub's \"My UIs\" list, or the one UI this app is bound to), " +
            "and which one is open.") { m -> obj(m) {} },
        Tool(OPEN_UI, "Opens one of the UIs of mateu_list_uis (hub variant only), as clicking it in \"My UIs\" does. " +
            "Waits for its first screen.") { m ->
            obj(m, listOf("id")) { prop("id", "string", "The id of the UI, from mateu_list_uis.") }
        },
        Tool(GET_MENU, "The open UI's menu as a tree: labels and the routes they open.") { m -> obj(m) {} },
        Tool(NAVIGATE, "Opens a route as a menu click does (a route from mateu_get_menu, or one the screen links to), " +
            "waits for it to load and answers the new screen.") { m ->
            obj(m, listOf("route")) { prop("route", "string", "The route, e.g. /products") }
        },
        Tool(GET_SCREEN, "What the user sees right now in the front Mateu view: the UI it belongs to, route, page header " +
            "(title, subtitle, badges, KPIs), app context selectors, fields with their values, every action they can press " +
            "(with ids), listing rows with paging/search/sort, validation errors, the last messages, and an open dialog or " +
            "drawer (`focus: overlay` — it is in front of the page). Long values and lists are capped.") { m -> obj(m) {} },
        Tool(SET_FIELDS, "Types values into fields of the screen (the overlay's when one is open), exactly as the user editing " +
            "them: client rules and the unsaved-changes state follow. Only fields shown and editable. Answers the fields " +
            "and errors after the change.") { m ->
            obj(m, listOf("values")) {
                putObject("values").apply {
                    put("type", "object")
                    put("description", "fieldId → value (string, number, boolean, or a list for multi-value fields).")
                }
            }
        },
        Tool(RUN_ACTION, "Presses an action the screen offers (an id from mateu_get_screen's actions; a row action needs " +
            "`row`). Runs as the user would — a confirmation it asks for is shown to the user, who answers it — and " +
            "answers the resulting screen and messages.") { m ->
            obj(m, listOf("actionId")) {
                prop("actionId", "string", "The action id, from mateu_get_screen.")
                prop("parameters", "object", "Optional extra parameters of the action.")
                prop("row", "integer", "For a row action: the index of the row in the listing's `rows` (0-based).")
                prop("listing", "string", "For a row action on a screen with several listings: the listing id.")
            }
        },
        Tool(OPEN_ROW, "Opens a listing row's record, as clicking the row does.") { m ->
            obj(m, listOf("row")) {
                prop("row", "integer", "The index of the row in the listing's `rows` (0-based).")
                prop("listing", "string", "The listing id, when the screen has several.")
            }
        },
        Tool(SHOW_SCREEN, "Shows a screen YOU compose, as a YAML page definition (the specs/ui format: read mateu://guide " +
            "and the component catalog first). It is validated by the open UI's server first: findings come back instead of " +
            "a broken screen. Rendered by that server with the user's identity, in a Preview tab (target `content`), a side " +
            "panel (`drawer`) or a dialog. Its buttons naming server actions run through the user's session.") { m ->
            obj(m, listOf("yaml")) {
                prop("yaml", "string", "The page definition (YAML).")
                prop("title", "string", "Optional tab / window title.")
                putObject("target").apply {
                    put("type", "string")
                    putArray("enum").apply { add("content"); add("drawer"); add("dialog") }
                    put("description", "Where it shows (default content).")
                }
            }
        },
        Tool(GET_GUIDE, "The authoring guide for YAML page definitions (same as the resource mateu://guide).") { m -> obj(m) {} },
        Tool(LIST_COMPONENTS, "The component types a YAML definition can use, with a one-line description and their " +
            "attributes; `query` filters by type or description.") { m ->
            obj(m) { prop("query", "string", "Optional filter.") }
        },
        Tool(GET_COMPONENT_SCHEMA, "The JSON schema of one component type, with the definitions it references.") { m ->
            obj(m, listOf("type")) { prop("type", "string", "A component type, e.g. FormField") }
        },
    )

    val NAMES: Set<String> = TOOLS.map { it.name }.toSet()

    fun definitions(mapper: ObjectMapper): ArrayNode = mapper.createArrayNode().apply {
        for (t in TOOLS) addObject().apply {
            put("name", t.name)
            put("description", t.description)
            set<JsonNode>("inputSchema", t.schema(mapper))
        }
    }
}
