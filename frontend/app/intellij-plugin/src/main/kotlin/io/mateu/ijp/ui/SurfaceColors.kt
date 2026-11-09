package io.mateu.ijp.ui

import com.intellij.ui.ColorUtil
import com.intellij.ui.JBColor
import com.intellij.util.ui.UIUtil
import java.awt.Color

/**
 * Neutral surfaces derived from the CURRENT theme, re-evaluated on every paint (a theme switch needs
 * no re-render). Renderers used fixed light greys (#F4F4F5 kanban columns, #E4E6E9 skeletons) that
 * turned into white slabs under a dark theme.
 */
object SurfaceColors {

    /** A quiet band over the panel (kanban columns, grouped areas): the panel nudged toward the text colour. */
    val tint: Color = JBColor.lazy { mix(UIUtil.getPanelBackground(), UIUtil.getLabelForeground(), 0.05) }

    /** A card on that band: the list background (white in light themes, the editor-dark in dark ones). */
    val surface: Color = JBColor.lazy { UIUtil.getListBackground() }

    /** A loading placeholder block: visibly there, never content-strong. */
    val placeholder: Color = JBColor.lazy { mix(UIUtil.getPanelBackground(), UIUtil.getLabelForeground(), 0.12) }

    /** [base] moved [amount] (0..1) of the way to [toward]. */
    fun mix(base: Color, toward: Color, amount: Double): Color = ColorUtil.mix(base, toward, amount)
}
