package io.mateu.ijp.ui

import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.Presence
import io.mateu.ijp.state.PresenceHub
import javax.swing.BorderFactory
import javax.swing.SwingUtilities

/**
 * Record presence in a page header (`@App(presence = true)`): "Ana is editing this record" on a
 * warning tone when someone else edits the record on screen, "Bob is viewing it" otherwise; hidden
 * when nobody else is there. It watches the record while it is SHOWING (addNotify → removeNotify:
 * a closed tab says `leave` at once). Someone STARTING to edit is announced once, politely.
 */
internal class PresenceLabel(private val ctx: AppContext) : JBLabel() {

    private var watch: PresenceHub.Holder? = null
    private var previous: List<Presence.Entry>? = null

    init {
        isVisible = false
        isOpaque = true
        border = JBUI.Borders.empty(2, 8)
    }

    override fun addNotify() {
        super.addNotify()
        if (watch != null) return
        val hub = ctx.session.presence
        val route = Presence.routeOf(ctx.currentRoute, ctx.session.appRootRoute)
        watch = hub.watch(route, ctx.currentServerSideType, ctx.trackDirty, { ctx.dirty }) { entries ->
            SwingUtilities.invokeLater { show(entries) }
        }
    }

    override fun removeNotify() {
        watch?.stop()
        watch = null
        super.removeNotify()
    }

    private fun show(entries: List<Presence.Entry>) {
        val before = previous
        previous = entries
        if (before != null) {
            for (name in Presence.newEditors(before, entries)) announce(this, "$name started editing this record", assertive = false)
        }
        val summary = Presence.summary(entries)
        isVisible = summary != null
        if (summary == null) return
        val tone = if (summary.warning) ToneColors.Tone.WARNING else ToneColors.Tone.NEUTRAL
        text = summary.text
        background = ToneColors.background(tone)
        foreground = if (summary.warning) ToneColors.foreground() else ToneColors.secondaryText()
        border = BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(ToneColors.border(tone)), JBUI.Borders.empty(2, 8),
        )
        getAccessibleContext().accessibleName = "Also on this record: ${summary.text}"
        revalidate()
        repaint()
    }
}
