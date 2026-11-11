package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode

/**
 * The pure half of the desktop's `Workflow` and `FormEditor` editors: the JSON definitions they
 * edit and what each edit does to them — the same operations as the web's mateu-workflow.ts and
 * mateu-form-editor.ts. Every operation returns a NEW definition (the input is never touched);
 * keys the editor does not know survive, and setting a property to null removes it (the web's
 * `undefined`).
 */
object DefinitionModels {

    private val mapper = ObjectMapper()

    val STEP_TYPES = listOf("ACTION", "JOIN", "FORK", "END", "USER_TASK", "PROCESS")
    val WORKFLOW_STATUSES = listOf("DRAFT", "ACTIVE", "DISABLED", "ARCHIVED")
    val DATA_TYPES = listOf(
        "string", "integer", "number", "bool", "date", "time", "dateTime",
        "dateRange", "money", "file", "array", "status", "component",
        "menu", "range", "action", "actionGroup",
    )
    val STEREOTYPES = listOf(
        "regular", "radio", "checkbox", "textarea", "toggle", "combobox",
        "select", "email", "password", "richText", "listBox", "html",
        "markdown", "image", "icon", "link", "money", "grid", "color",
        "choice", "popover", "slider", "button", "stars",
    )

    /** A short random id with the web's shape (`step-ab12cd`, `field-ab12cd`). */
    fun newId(prefix: String): String {
        val chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        return prefix + "-" + (1..6).map { chars[kotlin.random.Random.nextInt(chars.length)] }.joinToString("")
    }

    /** The definition as the editors write it: pretty-printed, like the web's JSON.stringify(x, null, 2). */
    fun serialize(definition: JsonNode): String = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(definition)

    private fun parse(value: String?, listKey: String, defaultName: String): ObjectNode {
        val parsed = runCatching { if (value.isNullOrBlank()) null else mapper.readTree(value) }.getOrNull()
        val node = (parsed as? ObjectNode)?.deepCopy() ?: mapper.createObjectNode().put("name", defaultName)
        if (!node.path(listKey).isArray) node.set<JsonNode>(listKey, mapper.createArrayNode())
        return node
    }

    private fun put(target: ObjectNode, key: String, value: Any?) {
        when (value) {
            null -> target.remove(key)
            is String -> target.put(key, value)
            is Boolean -> target.put(key, value)
            is Int -> target.put(key, value)
            is Long -> target.put(key, value)
            is Double -> target.put(key, value)
            is JsonNode -> target.set<JsonNode>(key, value)
            else -> target.put(key, value.toString())
        }
    }

    private fun items(def: JsonNode, key: String): List<ObjectNode> =
        def.path(key).filterIsInstance<ObjectNode>()

    private fun withItems(def: ObjectNode, key: String, items: List<JsonNode>): ObjectNode {
        val copy = def.deepCopy()
        val arr: ArrayNode = mapper.createArrayNode()
        items.forEach { arr.add(it) }
        copy.set<JsonNode>(key, arr)
        return copy
    }

    // ── workflow ──────────────────────────────────────────────────────────────────────────────

    fun parseWorkflow(value: String?): ObjectNode = parse(value, "steps", "New Workflow")

    fun steps(def: JsonNode): List<ObjectNode> = items(def, "steps")

    /** A workflow setting (name, description, status, limitConcurrentExecutions…). */
    fun setWorkflow(def: ObjectNode, key: String, value: Any?): ObjectNode = def.deepCopy().also { put(it, key, value) }

    /** Adds an ACTION step called "New Step" at the end. */
    fun addStep(def: ObjectNode, id: String = newId("step")): ObjectNode {
        val step = mapper.createObjectNode().put("id", id).put("type", "ACTION").put("name", "New Step")
        // listOf: an ObjectNode is itself an Iterable, so `+ step` would add its VALUES
        return withItems(def, "steps", steps(def) + listOf(step))
    }

    fun updateStep(def: ObjectNode, id: String, key: String, value: Any?): ObjectNode =
        withItems(def, "steps", steps(def).map { s -> if (s.path("id").asText() == id) s.deepCopy().also { put(it, key, value) } else s })

    /** Removes a step; a step pointing at it (precondition or compensation) points at nothing. */
    fun deleteStep(def: ObjectNode, id: String): ObjectNode =
        withItems(def, "steps", steps(def).filter { it.path("id").asText() != id }.map { s ->
            val c = s.deepCopy()
            if (c.path("preconditionStepId").asText(null) == id) c.remove("preconditionStepId")
            if (c.path("compensationStepId").asText(null) == id) c.remove("compensationStepId")
            c
        })

    // ── form definition ───────────────────────────────────────────────────────────────────────

    fun parseForm(value: String?): ObjectNode = parse(value, "fields", "New Form")

    fun fields(def: JsonNode): List<ObjectNode> = items(def, "fields")

    fun setForm(def: ObjectNode, key: String, value: Any?): ObjectNode = def.deepCopy().also { put(it, key, value) }

    /** Adds a string field labelled "New Field" at the end. */
    fun addField(def: ObjectNode, id: String = newId("field")): ObjectNode {
        val field = mapper.createObjectNode().put("id", id).put("label", "New Field").put("dataType", "string")
        return withItems(def, "fields", fields(def) + listOf(field))
    }

    fun updateField(def: ObjectNode, id: String, key: String, value: Any?): ObjectNode =
        withItems(def, "fields", fields(def).map { f -> if (f.path("id").asText() == id) f.deepCopy().also { put(it, key, value) } else f })

    fun deleteField(def: ObjectNode, id: String): ObjectNode =
        withItems(def, "fields", fields(def).filter { it.path("id").asText() != id })

    /** A copy of the field, labelled "<label> (copy)", right after it. */
    fun duplicateField(def: ObjectNode, id: String, newId: String = newId("field")): ObjectNode {
        val list = fields(def).toMutableList()
        val i = list.indexOfFirst { it.path("id").asText() == id }
        if (i < 0) return def.deepCopy()
        val copy = list[i].deepCopy().put("id", newId).put("label", list[i].path("label").asText("") + " (copy)")
        list.add(i + 1, copy)
        return withItems(def, "fields", list)
    }

    /** Moves a field up (delta < 0) or down; at an end it stays. */
    fun moveField(def: ObjectNode, id: String, delta: Int): ObjectNode {
        val list = fields(def).toMutableList()
        val i = list.indexOfFirst { it.path("id").asText() == id }
        val to = i + delta
        if (i < 0 || to < 0 || to >= list.size) return def.deepCopy()
        val moved = list.removeAt(i)
        list.add(to, moved)
        return withItems(def, "fields", list)
    }
}
