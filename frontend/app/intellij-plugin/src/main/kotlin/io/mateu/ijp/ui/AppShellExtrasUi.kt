package io.mateu.ijp.ui

import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.AppShortcuts
import io.mateu.ijp.state.HeaderValues
import io.mateu.ijp.state.IdleClock
import java.awt.AWTEvent
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Toolkit
import java.awt.event.AWTEventListener
import java.awt.event.KeyEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JDialog
import javax.swing.JPanel
import javax.swing.KeyStroke
import javax.swing.SwingUtilities
import javax.swing.Timer

// ── app shortcuts + quick launch ─────────────────────────────────────────────────────────────

/** Runs an app shortcut: a route opens through the host's navigation, an action runs on the app. */
fun runAppShortcut(session: AppSession, shortcut: AppShortcuts.Shortcut) {
    when {
        shortcut.route != null -> session.openAppRoute(shortcut.label, shortcut.route)
        shortcut.actionId != null -> session.runAppAction(shortcut.actionId)
    }
}

/**
 * QUICK LAUNCH: a field at the top of the navigator — type a code ("MRG") and press Enter to go
 * where the app shortcut with that code goes. An unknown code says so under the field.
 */
fun quickLaunchField(session: AppSession): JComponent {
    val field = JBTextField()
    field.emptyText.text = "Go to code…"
    field.accessibleName("Quick launch: type a code and press Enter")
    val status = JBLabel(" ")
    status.font = JBUI.Fonts.smallFont()
    status.foreground = com.intellij.util.ui.UIUtil.getContextHelpForeground()
    field.addActionListener {
        val hit = AppShortcuts.quickLaunch(session.appShortcuts, field.text)
        if (hit == null) {
            status.text = if (field.text.isBlank()) " " else "No shortcut has the code \"${field.text.trim()}\""
            announce(field, status.text, assertive = false)
        } else {
            status.text = " "
            field.text = ""
            runAppShortcut(session, hit)
        }
    }
    val box = JPanel(BorderLayout())
    box.isOpaque = false
    box.border = JBUI.Borders.empty(4, 8)
    box.add(field, BorderLayout.CENTER)
    box.add(status, BorderLayout.SOUTH)
    return box
}

/**
 * The "Keyboard shortcuts" dialog (the "?" key, or the navigator link): the app-wide shortcuts with
 * their codes — each a button that runs it. Escape closes it.
 */
fun showShortcutsDialog(session: AppSession, anchor: JComponent?) {
    val owner = anchor?.let { SwingUtilities.getWindowAncestor(it) }
    val dialog = JDialog(owner, "Keyboard shortcuts", java.awt.Dialog.ModalityType.APPLICATION_MODAL)
    dialog.accessibleContext.accessibleName = "Keyboard shortcuts"
    dialog.defaultCloseOperation = JDialog.DISPOSE_ON_CLOSE
    val list = verticalPanel(2)
    list.border = JBUI.Borders.empty(12)
    val title = JBLabel("Everywhere in the app")
    title.font = title.font.deriveFont(Font.BOLD)
    list.addStacked(title, 6)
    var first: JComponent? = null
    for (s in session.appShortcuts) {
        val row = JPanel(BorderLayout(JBUI.scale(12), 0))
        row.isOpaque = false
        val run = ActionLink(s.label) { dialog.dispose(); runAppShortcut(session, s) }
        val keys = listOfNotNull(s.code, s.key?.let { AppShortcuts.keyLabel(it) }).joinToString("  ·  ")
        run.accessibleName(if (keys.isBlank()) s.label else "${s.label}, $keys")
        row.add(run, BorderLayout.WEST)
        row.add(JBLabel(keys), BorderLayout.EAST)
        list.addStacked(row, 2)
        if (first == null) first = run
    }
    list.addStacked(javax.swing.JSeparator(), 6)
    list.addStacked(JBLabel("?  —  Show this list (outside a text field)"), 2)
    list.addStacked(JBLabel("A screen's own shortcut wins over an app shortcut on the same key."), 2)
    dialog.contentPane = list
    dialog.rootPane.registerKeyboardAction({ dialog.dispose() }, KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0), JComponent.WHEN_IN_FOCUSED_WINDOW)
    dialog.pack()
    dialog.setLocationRelativeTo(owner)
    first?.let { f -> SwingUtilities.invokeLater { f.requestFocusInWindow() } }
    dialog.isVisible = true
}

// ── live header values ───────────────────────────────────────────────────────────────────────

/**
 * The live header values ("Business date: 12 Oct") at the top of the navigator, repainted when a
 * value changes (an action's UpdateHeaderValue, the live stream) — and the change announced.
 *
 * It listens only while it is in a window (addNotify → removeNotify): a navigator that is re-rendered
 * drops its old panel, and a hidden tool window takes it out of the hierarchy without disposing it —
 * on coming back it repaints the values that changed meanwhile instead of showing stale ones.
 */
fun headerValuesPanel(session: AppSession): JComponent {
    val panel = HeaderValuesPanel(session)
    panel.paintValues()
    return panel
}

private class HeaderValuesPanel(private val session: AppSession) : JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(12), 0)) {
    private var unsubscribe: (() -> Unit)? = null

    init {
        isOpaque = false
        border = JBUI.Borders.empty(4, 8)
    }

    fun paintValues() {
        removeAll()
        for (v in session.headerValues.values) {
            val label = JBLabel(HeaderValues.display(v))
            label.font = label.font.deriveFont(Font.BOLD)
            label.accessibleName(HeaderValues.display(v))
            add(label)
        }
        revalidate()
        repaint()
    }

    override fun addNotify() {
        super.addNotify()
        paintValues()
        unsubscribe?.invoke()
        unsubscribe = session.onHeaderValuesChanged { id ->
            paintValues()
            id?.let { session.headerValues[it] }?.let { v ->
                announce(this, "${v.label ?: v.id} changed to ${v.value}", assertive = false)
            }
        }
    }

    override fun removeNotify() {
        unsubscribe?.invoke()
        unsubscribe = null
        super.removeNotify()
    }
}

// ── idle-session warning ─────────────────────────────────────────────────────────────────────

/**
 * The IDLE-SESSION WARNING on the desktop (`@App(idleTimeoutMinutes)`): any keyboard or mouse
 * activity in the IDE window counts; after the configured idleness a modal dialog counts down —
 * "Stay signed in" (default button, focused; Escape too) runs the app's keep-alive action, "Sign out"
 * or the countdown reaching zero signs out: the app is reset to its root ([AppSession.onSignedOut])
 * and an absolute sign-out url is opened in the browser (Mateu does no authentication).
 */
class IdleWatcher(private val session: AppSession, private var config: IdleClock.Config) : AutoCloseable {

    @Volatile private var lastActivity = System.currentTimeMillis()
    private var dialog: JDialog? = null

    private val listener = AWTEventListener { if (dialog == null) lastActivity = System.currentTimeMillis() }
    private val timer = Timer(1000) { check() }

    init {
        runCatching {
            Toolkit.getDefaultToolkit().addAWTEventListener(
                listener, AWTEvent.KEY_EVENT_MASK or AWTEvent.MOUSE_EVENT_MASK or AWTEvent.MOUSE_WHEEL_EVENT_MASK,
            )
        }
        timer.start()
    }

    fun update(next: IdleClock.Config) { config = next }

    private fun check() {
        if (dialog != null) return
        val (phase, left) = IdleClock.phase(System.currentTimeMillis(), lastActivity, config)
        when (phase) {
            IdleClock.Phase.EXPIRED -> signOut()
            IdleClock.Phase.WARNING -> warn(left)
            IdleClock.Phase.ACTIVE -> Unit
        }
    }

    private fun warn(secondsLeft: Int) {
        if (java.awt.GraphicsEnvironment.isHeadless()) return
        val d = JDialog(null as java.awt.Frame?, "Are you still there?", java.awt.Dialog.ModalityType.APPLICATION_MODAL)
        dialog = d
        d.defaultCloseOperation = JDialog.DO_NOTHING_ON_CLOSE
        val message = JBLabel()
        fun text(left: Int) = "For your security you will be signed out in $left seconds."
        message.text = text(secondsLeft)
        val stay = JButton("Stay signed in")
        val out = JButton("Sign out")
        val countdown = Timer(1000, null)
        fun close() { countdown.stop(); d.dispose(); dialog = null }
        stay.addActionListener {
            close()
            lastActivity = System.currentTimeMillis()
            config.keepAliveActionId?.let { session.runAppAction(it, "idle-warning", quiet = true) }
        }
        out.addActionListener { close(); signOut() }
        countdown.addActionListener {
            val (phase, left) = IdleClock.phase(System.currentTimeMillis(), lastActivity, config)
            if (phase == IdleClock.Phase.EXPIRED) { close(); signOut(); return@addActionListener }
            message.text = text(left)
            if (left == 10) announce(message, text(left))
        }
        val body = JPanel(BorderLayout(0, JBUI.scale(12)))
        body.border = JBUI.Borders.empty(16)
        body.add(JBLabel("Are you still there?").apply { font = font.deriveFont(Font.BOLD, font.size2D * 1.2f) }, BorderLayout.NORTH)
        body.add(message, BorderLayout.CENTER)
        val buttons = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(8), 0))
        buttons.add(out)
        buttons.add(stay)
        body.add(buttons, BorderLayout.SOUTH)
        d.contentPane = body
        d.rootPane.defaultButton = stay
        d.rootPane.registerKeyboardAction({ stay.doClick() }, KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0), JComponent.WHEN_IN_FOCUSED_WINDOW)
        d.accessibleContext.accessibleName = "Are you still there?"
        d.accessibleContext.accessibleDescription = message.text
        d.pack()
        d.setLocationRelativeTo(null)
        countdown.start()
        SwingUtilities.invokeLater { stay.requestFocusInWindow(); announce(stay, message.text) }
        d.isVisible = true
    }

    private fun signOut() {
        lastActivity = System.currentTimeMillis()
        val url = config.signOutUrl
        if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
            runCatching { com.intellij.ide.BrowserUtil.browse(url) }
        }
        session.notifier?.invoke("Signed out", "You were signed out after a period of inactivity.", "warning", null)
        session.onSignedOut?.invoke()
    }

    override fun close() {
        timer.stop()
        runCatching { Toolkit.getDefaultToolkit().removeAWTEventListener(listener) }
        dialog?.dispose()
        dialog = null
    }
}
