package io.mateu.ijp.ui

/**
 * Which foldout panels are open on first paint — the rule of conformance/client/foldout-auto.json,
 * the same as libs/mateu foldoutGeometry.ts, Redwood poc/foldouts.mjs and React Native
 * core/foldoutFit.ts. A panel with autoOpen (a YAML panel whose author wrote no `open:`) opens while
 * it fits the available width, in declaration order; any other follows `open` (null = open). The
 * overview, the panels declared open and every folded strip are counted first; each auto panel then
 * takes its width in place of its strip. An unknown width (null / <= 0) opens every auto panel.
 *
 * The plugin's foldout ([renderFoldout]) draws every panel as an expanded column (a desktop window
 * has the room, and the page scroller pages it), so today it never folds; the rule is kept here,
 * pinned by the shared corpus, for when it does.
 */
object FoldoutFit {

    data class Panel(val open: Boolean?, val autoOpen: Boolean?, val width: String?)

    data class Options(
        val overviewPx: Double = 400.0,
        val stripPx: Double = 48.0,
        val defaultPanelPx: Double = 352.0,
        val remPx: Double = 16.0,
        val gapPx: Double = 0.0,
    )

    private val LENGTH = Regex("""^(\d+(?:\.\d+)?)(px|rem|em|%)?$""")

    /** A panel's CSS width in px: px / rem / em / a bare number / % of the row; else null. */
    fun widthPx(width: String?, available: Double, remPx: Double = 16.0): Double? {
        val m = LENGTH.matchEntire((width ?: "").trim()) ?: return null
        val n = m.groupValues[1].toDouble()
        return when (m.groupValues[2]) {
            "rem", "em" -> n * remPx
            "%" -> n * available / 100
            else -> n
        }
    }

    fun openStates(panels: List<Panel>, available: Double?, options: Options = Options()): List<Boolean> {
        fun auto(p: Panel) = p.autoOpen == true
        if (available == null || available <= 0) return panels.map { auto(it) || it.open != false }
        fun widthOf(p: Panel) = widthPx(p.width, available, options.remPx) ?: options.defaultPanelPx
        var used = options.overviewPx
        for (p in panels) used += options.gapPx + if (!auto(p) && p.open != false) widthOf(p) else options.stripPx
        return panels.map { p ->
            if (!auto(p)) {
                p.open != false
            } else {
                val grown = used - options.stripPx + widthOf(p)
                if (grown > available) {
                    false
                } else {
                    used = grown
                    true
                }
            }
        }
    }
}
