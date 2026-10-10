package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * In-memory search / filter / sort / page of rows fetched from a REST source — the plugin twin of
 * libs/mateu restRowFilters.ts (filterExternalRows + sortExternalRows) and mateu-table-crud's
 * unpaged path. The plugin fetches a REST listing whole (it does not honour totalPath), and a source
 * answered from its SAMPLE cannot honour `${state.page}` either, so the conditions apply here.
 * State keys are the filter bar's: `<id>`, `<id>_from`/`<id>_to`, a multi-select as a list or a
 * comma-joined string; `searchText`; `sort` = `[{field|fieldId, direction}]`; `page`.
 */
object RestListing {

    data class Page(val content: List<JsonNode>, val totalElements: Int, val pageSize: Int, val pageNumber: Int)

    private fun blank(v: Any?): Boolean = when (v) {
        null -> true
        is String -> v.isEmpty()
        is Double -> v.isNaN()
        is JsonNode -> v.isNull || v.isMissingNode || (v.isTextual && v.asText().isEmpty())
        else -> false
    }

    private fun str(v: Any?): String = when (v) {
        null -> ""
        is JsonNode -> if (v.isNull || v.isMissingNode) "" else if (v.isValueNode) v.asText() else v.toString()
        else -> v.toString()
    }

    private fun multiValues(raw: Any?): List<String> = when (raw) {
        is Collection<*> -> raw.map { str(it) }
        is JsonNode -> if (raw.isArray) raw.map { str(it) } else multiValues(str(raw).ifEmpty { null })
        is String -> raw.split(',').map { it.trim() }.filter { it.isNotEmpty() }
        else -> emptyList()
    }

    private fun withinRange(cell: JsonNode?, from: Any?, to: Any?, numeric: Boolean): Boolean {
        val text = str(cell)
        if (numeric) {
            val value = text.toDoubleOrNull() ?: return false
            if (!blank(from) && value < (str(from).toDoubleOrNull() ?: return false)) return false
            if (!blank(to) && value > (str(to).toDoubleOrNull() ?: return false)) return false
            return true
        }
        if (text.isEmpty()) return false
        if (!blank(from) && text < str(from)) return false
        if (!blank(to) && text > str(to)) return false
        return true
    }

    private fun matches(row: JsonNode, filter: JsonNode, state: Map<String, Any?>): Boolean {
        val id = filter.path("fieldId").asText("")
        if (id.isBlank()) return true
        val cell = row.get(id)
        val stereotype = filter.path("stereotype").asText("")
        val dataType = filter.path("dataType").asText("")
        if (stereotype == "dateRange" || stereotype == "numberRange") {
            val from = state["${id}_from"]
            val to = state["${id}_to"]
            if (blank(from) && blank(to)) return true
            return withinRange(cell, from, to, stereotype == "numberRange")
        }
        if (stereotype == "multiSelect") {
            val wanted = multiValues(state[id])
            return wanted.isEmpty() || str(cell) in wanted
        }
        val value = state[id]
        if (blank(value)) return true
        if (dataType == "boolean" || dataType == "bool" || stereotype == "checkbox" || stereotype == "toggle") {
            val wanted = (value as? Boolean) ?: str(value).equals("true", ignoreCase = true)
            val actual = if (cell != null && cell.isBoolean) cell.asBoolean() else str(cell).equals("true", ignoreCase = true)
            return wanted == actual
        }
        // An option list is a pick, not a prefix: "male" must not also match "female".
        if (filter.path("options").let { it.isArray && it.size() > 0 }) return str(cell) == str(value)
        return str(cell).lowercase().contains(str(value).lowercase())
    }

    /** Free-text search over the visible columns + every declared filter. */
    fun filter(rows: List<JsonNode>, columnIds: List<String>, filters: List<JsonNode>, state: Map<String, Any?>): List<JsonNode> {
        val searchText = str(state["searchText"]).trim().lowercase()
        val declared = filters.filter { it.path("fieldId").asText("").isNotBlank() }
        if (searchText.isEmpty() && declared.isEmpty()) return rows
        return rows.filter { row ->
            (searchText.isEmpty() || columnIds.any { str(row.get(it)).lowercase().contains(searchText) }) &&
                declared.all { matches(row, it, state) }
        }
    }

    /** The sort state applied in order: numbers numerically, the rest as case-insensitive text,
     *  blanks last either way. No sort = the rows untouched. */
    fun sort(rows: List<JsonNode>, sort: Any?): List<JsonNode> {
        val list: Collection<*> = when (sort) {
            is Collection<*> -> sort
            is JsonNode -> if (sort.isArray) sort.toList() else emptyList()
            else -> emptyList<Any>()
        }
        val entries: List<Pair<String, Boolean>> = list.mapNotNull { s ->
                when (s) {
                    is Map<*, *> -> str(s["fieldId"] ?: s["field"]) to (str(s["direction"]) in setOf("descending", "desc"))
                    is JsonNode -> str(s.get("fieldId") ?: s.get("field")) to (str(s.get("direction")) in setOf("descending", "desc"))
                    else -> null
                }
            }.filter { it.first.isNotBlank() }
        if (entries.isEmpty()) return rows
        val cmp = Comparator<JsonNode> { x, y ->
            for ((id, desc) in entries) {
                val a = x.get(id)
                val b = y.get(id)
                val aBlank = blank(a)
                val bBlank = blank(b)
                val c = when {
                    aBlank || bBlank -> if (aBlank == bBlank) 0 else if (aBlank) 1 else -1
                    a!!.isNumber && b!!.isNumber -> a.asDouble().compareTo(b.asDouble())
                    else -> String.CASE_INSENSITIVE_ORDER.compare(str(a), str(b))
                }
                if (c != 0) return@Comparator if (desc) -c else c
            }
            0
        }
        return rows.sortedWith(cmp)
    }

    /** Search + filter + sort + slice one page; `pageSize <= 0` = one page with everything. */
    fun page(
        rows: List<JsonNode>,
        columnIds: List<String>,
        filters: List<JsonNode>,
        state: Map<String, Any?>,
        pageSize: Int,
    ): Page {
        val all = sort(filter(rows, columnIds, filters, state), state["sort"])
        val size = if (pageSize > 0) pageSize else all.size.coerceAtLeast(1)
        val lastPage = ((all.size + size - 1) / size - 1).coerceAtLeast(0)
        val requested = str(state["page"]).toDoubleOrNull()?.toInt() ?: 0
        val page = requested.coerceIn(0, lastPage)
        val content = all.drop(page * size).take(size)
        return Page(content, all.size, size, page)
    }
}
