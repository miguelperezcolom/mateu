package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.awt.Color

/**
 * Pure (no Swing) readers for the "pattern gaps" wire pieces, so their rules are unit-testable:
 *
 *  - the `Announce` command (`{text, assertive}`) — said to assistive tech, draws nothing;
 *  - the page header's record/context switcher (`PageDto.switcher`);
 *  - the hero band `tone` (a dark tinted band with light ink — our own palette);
 *  - a foldout panel's `summary-N` slot;
 *  - a listing's `preSearch` content (shown until its first search answers);
 *  - the key an overlay (Drawer/Dialog) is tracked by, so re-sending the same id refreshes it.
 */
object PageSlots {

    // ── A1: Announce ──────────────────────────────────────────────────────────────────────

    data class Announcement(val text: String, val assertive: Boolean)

    /** The `Announce` command's data, or null when there is nothing to say. A bare string is polite. */
    fun announcementOf(data: JsonNode?): Announcement? {
        if (data == null || data.isNull || data.isMissingNode) return null
        if (data.isTextual) return data.asText().takeIf { it.isNotBlank() }?.let { Announcement(it, false) }
        val text = data.text("text")
        if (text.isBlank()) return null
        return Announcement(text, data.bool("assertive"))
    }

    // ── A2: record / context switcher ─────────────────────────────────────────────────────

    const val SWITCH_ACTION_ID = "_switchRecord"
    const val VALUE_PARAMETER = "_record"

    data class SwitcherOption(val value: String, val label: String, val description: String) {
        /** What the combo box shows (and speed search matches against). */
        override fun toString(): String = label
    }

    data class Switcher(
        val options: List<SwitcherOption>,
        /** Index of the current value in [options], -1 when it is not among them. */
        val selectedIndex: Int,
        /** "object" (the record shown) or "context" (what the page is evaluated in). */
        val type: String,
        /** The hint: the caption before the selector, and its accessible name. */
        val label: String,
        val searchable: Boolean,
        val disabled: Boolean,
        val actionId: String,
    )

    /** The page's switcher, or null when the page declares none (or it has no options). */
    fun switcherOf(pageMetadata: JsonNode): Switcher? {
        val s = pageMetadata.path("switcher")
        if (!s.isObject) return null
        val options = s.arr("options").map { o ->
            val value = o.text("value")
            SwitcherOption(value, o.text("label").ifBlank { value }, o.text("description"))
        }
        if (options.isEmpty()) return null
        val value = s.text("value")
        val type = s.text("type").ifBlank { "object" }
        return Switcher(
            options = options,
            selectedIndex = options.indexOfFirst { it.value == value },
            type = type,
            label = s.text("label").ifBlank { if (type == "context") "Context" else "Record" },
            searchable = s.bool("searchable"),
            disabled = s.bool("disabled"),
            actionId = s.text("actionId").ifBlank { SWITCH_ACTION_ID },
        )
    }

    /** The action parameters for picking [option], or null when it is already the current one. */
    fun switchParameters(switcher: Switcher, option: SwitcherOption): Map<String, Any?>? {
        if (switcher.disabled) return null
        if (switcher.options.getOrNull(switcher.selectedIndex)?.value == option.value) return null
        return mapOf(VALUE_PARAMETER to option.value)
    }

    // ── A3: hero tone ─────────────────────────────────────────────────────────────────────

    private val HERO_TONES = mapOf(
        "ocean" to Color(0x1f4e79),
        "pine" to Color(0x2d5a3d),
        "lilac" to Color(0x5b4a7a),
        "teal" to Color(0x1f5c5c),
        "rose" to Color(0x7a3b4f),
        "pebble" to Color(0x5a5550),
        "slate" to Color(0x3d4a57),
        "plum" to Color(0x5e3557),
        "sienna" to Color(0x7a4a2e),
    )

    /** The band colour of a hero `tone`; null (= the default look) for absent/unknown tones. */
    fun heroToneColor(tone: String?): Color? = tone?.trim()?.lowercase()?.let { HERO_TONES[it] }

    /** Subtitle ink on a toned band: white at 85 %. */
    val HERO_SUBTITLE_INK = Color(255, 255, 255, (0.85 * 255).toInt())

    // ── A4: foldout summary ───────────────────────────────────────────────────────────────

    /** The child slotted `summary-<index>` of a FoldoutLayout, or null. */
    fun foldoutSummary(children: List<JsonNode>, index: Int): JsonNode? =
        children.firstOrNull { it.text("slot") == "summary-$index" }

    // ── A5: listing pre-search content ────────────────────────────────────────────────────

    /** State key remembering that a listing already got its first search answer. */
    fun preSearchDoneKey(listingId: String): String = "_preSearchDone_" + listingId.ifBlank { "crud" }

    /** Whether to show the pre-search content instead of the results. */
    fun showsPreSearch(crudMetadata: JsonNode, alreadyAnswered: Boolean): Boolean =
        !alreadyAnswered && crudMetadata.arr("preSearch").isNotEmpty()

    /** Whether a data payload is a listing answer (a page of rows), not some unrelated data. */
    fun isListingAnswer(data: JsonNode?): Boolean {
        if (data == null || !data.isObject) return false
        val crud = data.path("crud")
        if (crud.isObject && (crud.has("page") || crud.has("content"))) return true
        return data.has("page") || data.has("content")
    }

    // ── B: overlays refreshed in place ────────────────────────────────────────────────────

    /**
     * The id an overlay is tracked by: the Drawer/Dialog's own `metadata.id` (e.g.
     * `crud-edit-drawer`). The wrapping component's id is NOT used — the server stamps the same
     * placeholder on every overlay — so an overlay without its own id is never deduplicated.
     */
    fun overlayKey(component: JsonNode): String? =
        component.path("metadata").text("id").takeIf { it.isNotBlank() }
}
