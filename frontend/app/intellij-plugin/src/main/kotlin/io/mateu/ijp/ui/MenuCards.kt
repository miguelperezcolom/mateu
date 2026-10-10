package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/**
 * Card menus (wire: `MenuOption.display = "cards"` on a GROUP, `MenuOption.image` on its entries).
 *
 * Each entry of a cards group is one card — label = title, description = text, icon / image — and
 * activating it opens the entry like a plain menu leaf. An entry with its own submenus is NOT
 * navigable itself: those submenus are the card's ACTIONS, each opening like a plain leaf.
 *
 * Pure (no Swing) so it is unit-testable; the navigator in `AppRenderer` draws the cards.
 */
object MenuCards {

    data class Card(
        val title: String,
        val description: String?,
        /** Absolute (or data:) URI of the card image; null for none. */
        val imageUri: String?,
        /** The wire icon name (e.g. `vaadin:home`) or a glyph; null for none. */
        val icon: String?,
        /** The entry opened when the card itself is activated; null when it has [actions] instead. */
        val target: JsonNode?,
        val actions: List<JsonNode>,
    )

    /** True when this menu group renders its entries as cards. */
    fun isCardsGroup(item: JsonNode): Boolean {
        val submenus = item.path("submenus")
        return item.text("display") == "cards" && submenus.isArray && !submenus.isEmpty
    }

    /**
     * Resolves an entry image: data:/http(s)/file URIs are kept, anything else is relative to the
     * backend base URL (the plugin has no document origin to resolve it against).
     */
    fun resolveImageUri(image: String?, baseUrl: String): String? {
        val src = image?.trim().orEmpty()
        if (src.isEmpty()) return null
        if (Regex("^(data:|https?:|file:)", RegexOption.IGNORE_CASE).containsMatchIn(src)) return src
        if (src.startsWith("//")) return "https:$src"
        return baseUrl.trimEnd('/') + "/" + src.trimStart('/')
    }

    /** The cards of a cards group, one per non-separator entry. */
    fun cardsOf(group: JsonNode, baseUrl: String): List<Card> =
        group.path("submenus").filter { !it.bool("separator") }.map { entry ->
            val actions = entry.path("submenus").filter { !it.bool("separator") }
            Card(
                title = entry.text("label"),
                description = entry.text("description").trim().ifBlank { null },
                imageUri = resolveImageUri(entry.text("image"), baseUrl),
                icon = entry.text("icon").trim().ifBlank { null },
                target = if (actions.isEmpty()) entry else null,
                actions = actions,
            )
        }
}
