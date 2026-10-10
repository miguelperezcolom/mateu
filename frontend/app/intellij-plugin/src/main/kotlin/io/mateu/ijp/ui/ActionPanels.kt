package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.int
import io.mateu.ijp.api.text

/**
 * Action panels («I want to…», wire type `ActionPanel`): a trigger button that opens an overlay with
 * one column per category, each listing its actions. Same contract as the web renderers:
 *
 *  - within a category the POPULATED actions come first (stable order otherwise) and are emphasised;
 *  - a label carries " (n)" when count > 0, " (25+)" when count > 25;
 *  - at most `maxPerCategory` show per category (default 10), the rest behind "Show more (k)";
 *  - with "Hide unpopulated" on, unpopulated actions disappear, and so do categories left empty.
 *
 * Show-more and hide-unpopulated are client-side state only. Pure (no Swing) so it is unit-testable;
 * `renderActionPanel` (ActionPanelRenderer.kt) draws it.
 */
object ActionPanels {

    const val DEFAULT_LABEL = "I want to…"
    const val DEFAULT_MAX_PER_CATEGORY = 10

    data class Action(
        val label: String,
        val actionId: String,
        /** The wire `parameters` object, or null when absent. */
        val parameters: JsonNode?,
        val populated: Boolean,
        val disabled: Boolean,
    )

    data class Category(
        /** Index in the wire list — the stable key for its "show more" state. */
        val index: Int,
        val title: String,
        /** The actions to show now (already ordered and cut). */
        val actions: List<Action>,
        /** How many more "Show more" reveals; 0 = no control. */
        val hiddenCount: Int,
    ) {
        val moreLabel: String? get() = if (hiddenCount > 0) "Show more ($hiddenCount)" else null
    }

    /** "Arrivals" + 3 → "Arrivals (3)"; + 30 → "Arrivals (25+)"; no count → as is. */
    fun countLabel(label: String, count: Int?): String =
        if (count != null && count > 0) "$label (${if (count > 25) "25+" else count.toString()})" else label

    fun labelOf(metadata: JsonNode): String = metadata.text("label").trim().ifBlank { DEFAULT_LABEL }

    fun maxPerCategoryOf(metadata: JsonNode): Int =
        metadata.int("maxPerCategory").takeIf { it > 0 } ?: DEFAULT_MAX_PER_CATEGORY

    fun hasHideToggle(metadata: JsonNode): Boolean = metadata.bool("hideUnpopulatedToggle")

    /** Populated first; otherwise the declared order (Kotlin's sortedBy is stable). */
    fun ordered(actions: List<JsonNode>): List<JsonNode> = actions.sortedBy { if (it.bool("populated")) 0 else 1 }

    /** What the overlay shows for the given client-side state. */
    fun view(metadata: JsonNode, expanded: Set<Int> = emptySet(), hideUnpopulated: Boolean = false): List<Category> {
        val max = maxPerCategoryOf(metadata)
        val hide = hideUnpopulated && hasHideToggle(metadata)
        return metadata.arr("categories").mapIndexedNotNull { index, category ->
            var actions = ordered(category.arr("actions")).map { a ->
                val countNode = a.path("count")
                Action(
                    label = countLabel(a.text("label"), if (countNode.isNumber) countNode.asInt() else null),
                    actionId = a.text("actionId"),
                    parameters = a.path("parameters").takeIf { it.isObject },
                    populated = a.bool("populated"),
                    disabled = a.bool("disabled"),
                )
            }
            if (hide) actions = actions.filter { it.populated }
            if (actions.isEmpty()) return@mapIndexedNotNull null
            val hidden = if (index in expanded) 0 else maxOf(0, actions.size - max)
            Category(index, category.text("title"), if (hidden > 0) actions.take(max) else actions, hidden)
        }
    }

    /**
     * Mateu's "ctrl+i" → the Swing `KeyStroke.getKeyStroke(String)` spec ("ctrl I"); null when it
     * cannot be parsed (an unknown modifier, no key).
     */
    fun keyStrokeSpec(shortcut: String?): String? {
        val parts = shortcut.orEmpty().lowercase().split('+').map { it.trim() }.filter { it.isNotEmpty() }
        if (parts.isEmpty()) return null
        val mods = parts.dropLast(1).map {
            when (it) {
                "ctrl", "control" -> "ctrl"
                "alt", "option" -> "alt"
                "shift" -> "shift"
                "meta", "cmd" -> "meta"
                else -> return null
            }
        }
        val key = when (val k = parts.last()) {
            "ctrl", "control", "alt", "option", "shift", "meta", "cmd" -> return null
            "enter" -> "ENTER"
            "esc", "escape" -> "ESCAPE"
            "space" -> "SPACE"
            "del", "delete" -> "DELETE"
            "tab" -> "TAB"
            else -> k.uppercase()
        }
        return (mods + key).joinToString(" ")
    }
}
