package io.mateu.ijp.state

/**
 * A micro frontend EMBEDDED in a page (`MicroFrontend.chrome` on the wire) is a block of that page,
 * not a page of its own — the desktop port of libs/mateu `embeddedChrome.ts`:
 *
 * - the window is the host's: the island's requests carry `embeddedChrome` (the remote's server then
 *   sends no SetWindowTitle / SetFavicon / PushStateToHistory) and its title never reaches a tab;
 * - its OWN page header: NONE hides it, COMPACT keeps only the actions, PAGE keeps it all.
 *
 * Nothing read the field before: NONE, COMPACT and PAGE all drew the full title, subtitle and toolbar.
 */
object EmbeddedChrome {
    const val NONE = "NONE"
    const val COMPACT = "COMPACT"
    const val PAGE = "PAGE"

    /** A chrome value as the wire sends it, or null (a page of its own) for anything else. */
    fun of(value: String?): String? = value?.trim()?.uppercase()?.takeIf { it == NONE || it == COMPACT || it == PAGE }

    /** What of a page header an embedded page keeps. */
    data class Header(val texts: Boolean, val actions: Boolean) {
        val any get() = texts || actions
    }

    /** The page header under [chrome]: everything for a page of its own (null) or PAGE. */
    fun header(chrome: String?): Header = when (of(chrome)) {
        NONE -> Header(texts = false, actions = false)
        COMPACT -> Header(texts = false, actions = true)
        else -> Header(texts = true, actions = true)
    }
}
