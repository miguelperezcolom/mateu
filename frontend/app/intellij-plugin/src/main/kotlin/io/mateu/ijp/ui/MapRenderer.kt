package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ide.BrowserUtil
import com.intellij.ui.JBColor
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Cursor
import java.awt.Dimension
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.RenderingHints
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.BorderFactory
import javax.swing.BoxLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Street map (wire `Map`). The plugin has no map component, so the map is shown honestly as a panel
 * listing its points — colour swatch, label, description — with an "Open in browser" link per point
 * (OpenStreetMap via [BrowserUtil.browse]). Clicking a marker row (or activating its label link from
 * the keyboard) runs `markerActionId` with `{ _markerId }` through `ctx.runAction`, like the web
 * map's marker click. Rows are built by [MapRows].
 */
fun renderMap(ctx: AppContext, metadata: JsonNode): JComponent {
    val rows = MapRows.rows(metadata)
    val actionId = metadata.text("markerActionId")

    val panel = JPanel().apply {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)
        border = BorderFactory.createCompoundBorder(
            JBUI.Borders.customLine(JBColor.border(), 1),
            JBUI.Borders.empty(6, 8),
        )
        isOpaque = false
        accessibleName("Map")
    }
    panel.add(JBLabel("🗺 Map").apply {
        font = font.deriveFont(java.awt.Font.BOLD)
        foreground = UIUtil.getContextHelpForeground()
        alignmentX = 0f
    })
    if (rows.isEmpty()) {
        panel.add(JBLabel("No location").apply {
            foreground = UIUtil.getContextHelpForeground()
            alignmentX = 0f
        })
    }

    rows.forEach { row ->
        val run = { ctx.runAction(actionId, MapRows.markerParameters(row)) }
        val name = if (row.description.isBlank()) row.label else "${row.label}, ${row.description}"

        val texts = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            isOpaque = false
        }
        val title: JComponent =
            if (row.actionable) ActionLink(row.label) { run() }.accessibleName(name)
            else JBLabel(row.label).apply { font = font.deriveFont(java.awt.Font.BOLD) }
        title.alignmentX = 0f
        texts.add(title)
        if (row.description.isNotBlank()) {
            texts.add(JBLabel(row.description).apply {
                foreground = UIUtil.getContextHelpForeground()
                alignmentX = 0f
            })
        }

        val open = ActionLink("Open in browser") { runCatching { BrowserUtil.browse(row.url) } }
            .accessibleName("Open ${row.label} in browser")
            .accessibleDescription(row.url)
        open.toolTipText = row.url

        val line = JPanel(BorderLayout(JBUI.scale(8), 0)).apply {
            isOpaque = false
            border = BorderFactory.createCompoundBorder(
                JBUI.Borders.customLine(JBColor.border(), 1, 0, 0, 0),
                JBUI.Borders.empty(4, 0),
            )
            alignmentX = 0f
            add(Swatch(parseMarkerColor(row.color)).accessibleName("Marker colour ${row.color}"), BorderLayout.WEST)
            add(texts, BorderLayout.CENTER)
            add(open, BorderLayout.EAST)
            maximumSize = Dimension(Int.MAX_VALUE, preferredSize.height)
        }
        if (row.actionable) {
            line.cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
            val click = object : MouseAdapter() {
                override fun mouseClicked(e: MouseEvent) { run() }
            }
            line.addMouseListener(click)
            texts.addMouseListener(click)
        }
        panel.add(line)
    }
    return panel
}

/** "#rrggbb" / "#rgb" → colour; anything else (named CSS colours…) falls back to the default blue. */
internal fun parseMarkerColor(value: String): Color {
    val v = value.trim()
    return runCatching {
        when {
            v.startsWith("#") && v.length == 7 -> Color.decode(v)
            v.startsWith("#") && v.length == 4 -> Color.decode("#" + v.drop(1).map { "$it$it" }.joinToString(""))
            else -> null
        }
    }.getOrNull() ?: Color.decode(MapRows.DEFAULT_COLOR)
}

/** A round colour dot, the marker's pin colour. */
// a JPanel, not a bare JComponent: JComponent.getAccessibleContext() is null, so naming it for
// the screen reader threw (and the whole map failed to render)
private class Swatch(private val color: Color) : javax.swing.JPanel() {
    init {
        isOpaque = false
        val d = JBUI.scale(12)
        preferredSize = Dimension(d, d)
        minimumSize = preferredSize
    }

    override fun paintComponent(g: Graphics) {
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        g2.color = color
        val d = JBUI.scale(12)
        g2.fillOval(0, (height - d) / 2, d, d)
        g2.dispose()
    }
}
