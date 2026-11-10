package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.FlowLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * A Drawer's header extras on the desktop window that stands in for it: its `subtitle`, its `size`
 * (s/m/l/xl → 464/648/968px/90% of the window; `width` still wins), ⤢ `maximizable` (one step up
 * the size ladder per press, local) and `peerNav` (previous / next object). The dialog was a fixed
 * 448px window titled by the drawer and nothing else.
 */
object DrawerChrome {
    private val LADDER = listOf("s", "m", "l", "xl")

    /** The drawer's width in px for [size] on a window [ownerWidth] wide; `width` (rem/px) wins. */
    fun widthPx(width: String, size: String, ownerWidth: Int): Int {
        cssLengthPx(width)?.let { return it }
        return when (size.lowercase()) {
            "s" -> 464
            "m" -> 648
            "l" -> 968
            "xl" -> (ownerWidth * 0.9).toInt().coerceAtLeast(968)
            else -> 448
        }
    }

    /** The next size up (xl stays xl); a drawer with no size starts at m. */
    fun nextSize(size: String): String = LADDER.getOrNull(LADDER.indexOf(size.lowercase()) + 1) ?: if (size.isBlank()) "m" else "xl"

    /** Whether the drawer has anything to show in its header strip. */
    fun hasHeader(meta: JsonNode): Boolean =
        meta.text("subtitle").isNotBlank() || meta.path("maximizable").asBoolean(false) || meta.path("peerNav").isObject

    /**
     * The header strip: subtitle on the left; previous / next object and ⤢ on the right.
     * [onMaximize] steps the window up; [onPeer] navigates to a peer's route.
     */
    fun header(meta: JsonNode, onMaximize: () -> Unit, onPeer: (String) -> Unit): JComponent? {
        if (!hasHeader(meta)) return null
        val bar = JPanel(BorderLayout(JBUI.scale(8), 0))
        bar.isOpaque = false
        bar.border = JBUI.Borders.compound(JBUI.Borders.customLineBottom(com.intellij.ui.JBColor.border()), JBUI.Borders.empty(6, 12))
        meta.text("subtitle").takeIf { it.isNotBlank() }?.let {
            bar.add(JBLabel(plain(it)).apply { foreground = ToneColors.secondaryText() }, BorderLayout.CENTER)
        }
        val right = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(4), 0)).apply { isOpaque = false }
        meta.path("peerNav").takeIf { it.isObject }?.let { peer ->
            fun arrow(glyph: String, label: String, route: String) = JButton(glyph).apply {
                putClientProperty("JButton.buttonType", "square")
                toolTipText = plainTip(label.ifBlank { null })
                accessibleName(if (label.isBlank()) glyph else label)
                isEnabled = route.isNotBlank()
                addActionListener { onPeer(route) }
            }
            right.add(arrow("‹", peer.text("prevLabel").let { if (it.isBlank()) "Previous" else "Previous: $it" }, peer.text("prevRoute")))
            right.add(arrow("›", peer.text("nextLabel").let { if (it.isBlank()) "Next" else "Next: $it" }, peer.text("nextRoute")))
        }
        if (meta.path("maximizable").asBoolean(false)) {
            right.add(JButton("⤢").apply {
                putClientProperty("JButton.buttonType", "square")
                toolTipText = "Maximize"
                accessibleName("Maximize")
                addActionListener { onMaximize() }
            })
        }
        bar.add(right, BorderLayout.EAST)
        return bar
    }
}
