package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * Whole-row open on a listing (decision U1 — the same rule as the web's libs/mateu `rowOpen.ts`,
 * Redwood's `isDisplayColumn` and React Native's `core/rowOpen.ts`).
 *
 * A NAVIGABLE listing (it declares a `rowRoute`, or a column carries `actionId: "view"`) opens a
 * row's record from ANY cell, not only from the link column — except the cells with a click of
 * their own: inline editors, buttons, links, menus, action groups, components, any column with its
 * own actionId. In the JTable: a single click on such a row opens it (a double click when the
 * listing has multi-selection, where the single click is the platform's "select"), Enter opens the
 * selected row, and modified clicks (Ctrl/Shift/Meta) only ever select.
 *
 * Side-effect-free, unit-tested by RowOpenTest.
 */
object RowOpen {

    const val ROW_OPEN_ACTION_ID = "view"

    private val DISPLAY_DATA_TYPES = setOf("action", "actionGroup", "menu", "component", "link", "button")
    private val DISPLAY_STEREOTYPES = setOf("button", "link", "html")

    /** How a row opens: by route (rowRoute wins), or by running the `view` action with the row. */
    sealed interface Open {
        data class Route(val template: String) : Open
        data class Action(val actionId: String) : Open
    }

    /** What opening one row does. */
    sealed interface Target {
        data class Route(val route: String) : Target
        data class Action(val actionId: String) : Target
    }

    /** The part of a column the rule reads. */
    data class Column(
        val dataType: String = "",
        val stereotype: String = "",
        val actionId: String = "",
        val editable: Boolean = false,
    )

    fun openOf(rowRoute: String?, columns: List<Column>): Open? = when {
        !rowRoute.isNullOrBlank() -> Open.Route(rowRoute)
        columns.any { it.actionId == ROW_OPEN_ACTION_ID } -> Open.Action(ROW_OPEN_ACTION_ID)
        else -> null
    }

    /** A column whose cells keep their own click; an unknown column (null) counts as one too. */
    fun isDisplayColumn(c: Column?): Boolean {
        if (c == null) return true
        if (c.editable) return true
        if (c.dataType in DISPLAY_DATA_TYPES) return true
        if (c.stereotype in DISPLAY_STEREOTYPES) return true
        return c.actionId.isNotBlank() && c.actionId != ROW_OPEN_ACTION_ID
    }

    /** `people/${'$'}{row.id}` against the row; null when a placeholder stays unresolved. */
    fun routeOf(template: String, row: JsonNode?): String? {
        if (row == null) return null
        var unresolved = false
        val route = Regex("""\$\{\s*row\.([\w.]+)\s*}""").replace(template) { m ->
            var node: JsonNode? = row
            for (k in m.groupValues[1].split('.')) node = node?.get(k)
            val text = node?.takeUnless { it.isNull || it.isMissingNode }?.let { if (it.isValueNode) it.asText() else it.toString() }
            if (text.isNullOrEmpty()) { unresolved = true; "" } else text
        }
        if (unresolved || route.contains("\${")) return null
        return route.trimStart('/')
    }

    /** Rows that never open: group/totals markers and rows flagged `viewable: false`. */
    fun rowOpens(row: JsonNode?): Boolean =
        row != null && row.isObject && !row.has("__mateuGroup") && !(row.path("viewable").isBoolean && !row.path("viewable").asBoolean())

    fun targetOf(open: Open?, row: JsonNode?): Target? {
        if (open == null || !rowOpens(row)) return null
        return when (open) {
            is Open.Route -> routeOf(open.template, row)?.let { Target.Route(it) }
            is Open.Action -> Target.Action(open.actionId)
        }
    }

    /**
     * Whether this mouse click on a cell of this column opens the row: a navigable listing, a
     * non-display cell, an unmodified primary click — single, or double when single clicks mean
     * "select" (multi-selection listings).
     */
    fun clickOpens(
        open: Open?, column: Column?, clickCount: Int, modified: Boolean, multiSelection: Boolean,
    ): Boolean {
        if (open == null || modified) return false
        if (isDisplayColumn(column)) return false
        return clickCount == (if (multiSelection) 2 else 1)
    }
}
