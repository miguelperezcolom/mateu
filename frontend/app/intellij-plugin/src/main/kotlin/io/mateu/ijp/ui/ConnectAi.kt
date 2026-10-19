package io.mateu.ijp.ui

import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.state.AgentPairingState
import io.mateu.ijp.state.AgentPairingState.CodeView
import io.mateu.ijp.state.AgentPush
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingUtilities

/**
 * "Connect AI" (live UI push, phase C): pairs THIS app window with an agent. Asking for a code runs
 * `_agent-pair`; the dialog shows the one-time code (copyable), its countdown and what to tell the
 * agent ([AgentPush.INSTRUCTION]); once the channel's status says an agent paired it switches to the
 * connected state — who is connected + Disconnect (`_agent-unpair`). Everything it shows comes from
 * [AppSession.agentPairing], so the dialog, the navigator link and the tool-window title action agree.
 *
 * Accessibility: every control is named, the code is a read-only text field (focusable, selectable,
 * spelled out in its description), and a new code, an expired one, a connection and a disconnection
 * are announced.
 */
internal class ConnectAiPanel(
    private val session: AppSession,
    private val copy: (String) -> Unit = ::copyToClipboard,
    private val now: () -> Long = System::currentTimeMillis,
) {
    private val state: AgentPairingState get() = session.agentPairing

    private val connectedLabel = JBLabel()
    private val disconnect = JButton("Disconnect")
    private val heading = JBLabel("Pair an AI agent with this window")
    private val codeField = JBTextField()
    private val copyButton = JButton("Copy")
    private val countdownLabel = JBLabel()
    private val instructionLabel = JBLabel(plain(AgentPush.INSTRUCTION))
    private val messageLabel = JBLabel()
    private val newCode = JButton("New code")
    private val problemLabel = JBLabel()
    private val codeRow = JPanel(BorderLayout(JBUI.scale(6), 0))

    private val timer = javax.swing.Timer(1000) { refresh() }
    private val unsubscribe: () -> Unit
    /** What was last announced, so a re-render announces only a CHANGE. */
    private var announced: String? = null

    val component: JComponent = build()

    init {
        unsubscribe = state.onChange { refresh() }
        // Opening the dialog unpaired asks for a code at once — unless a valid one is still showing.
        val view = state.codeView(now())
        if (!state.paired && (view is CodeView.None || view is CodeView.Expired || view is CodeView.Failed)) {
            session.requestAgentPairing(now)
        }
        refresh()
    }

    private fun build(): JComponent {
        heading.font = heading.font.deriveFont(Font.BOLD)
        connectedLabel.accessibleName("Connected agents")
        disconnect.accessibleName("Disconnect AI agents").accessibleDescription("Removes every pairing of this window")
        disconnect.addActionListener { onDisconnect() }

        codeField.isEditable = false
        codeField.columns = 12
        codeField.font = Font(Font.MONOSPACED, Font.BOLD, (UIUtil.getLabelFont().size * 1.6f).toInt())
        codeField.horizontalAlignment = javax.swing.JTextField.CENTER
        JBLabel("Pairing code").labelling(codeField)
        copyButton.accessibleName("Copy pairing code")
        copyButton.addActionListener { onCopy() }
        countdownLabel.accessibleName("Code expiry")
        instructionLabel.foreground = UIUtil.getContextHelpForeground()
        messageLabel.accessibleName("Pairing status")
        problemLabel.foreground = ToneColors.secondaryText()
        problemLabel.accessibleName("Channel problem")
        newCode.accessibleName("Request a new pairing code")
        newCode.addActionListener { session.requestAgentPairing(now) }

        codeRow.isOpaque = false
        codeRow.add(codeField, BorderLayout.CENTER)
        codeRow.add(copyButton, BorderLayout.EAST)

        val connectedRow = JPanel(BorderLayout(JBUI.scale(8), 0))
        connectedRow.isOpaque = false
        connectedRow.add(connectedLabel, BorderLayout.CENTER)
        connectedRow.add(disconnect, BorderLayout.EAST)

        val buttons = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(4), 0))
        buttons.isOpaque = false
        buttons.add(newCode)

        val body = verticalPanel(6)
        body.border = JBUI.Borders.empty(12)
        body.addStacked(connectedRow, 6)
        body.addStacked(heading, 4)
        body.addStacked(codeRow, 4)
        body.addStacked(countdownLabel, 2)
        body.addStacked(instructionLabel, 4)
        body.addStacked(messageLabel, 4)
        body.addStacked(problemLabel, 4)
        body.addStacked(buttons, 0)
        body.accessibleName("Connect AI")
        return body
    }

    /** Re-renders from [AppSession.agentPairing] (and the clock, for the countdown). EDT. */
    fun refresh() {
        val paired = state.paired
        connectedLabel.isVisible = paired
        disconnect.isVisible = paired
        if (paired) connectedLabel.text = plain("Connected: " + AgentPush.agentsText(state.agents))
        heading.text = if (paired) "Pair another agent" else "Pair an AI agent with this window"

        val view = state.codeView(now())
        val showing = view as? CodeView.Showing
        codeRow.isVisible = showing != null
        countdownLabel.isVisible = showing != null
        instructionLabel.isVisible = showing != null
        if (showing != null) {
            if (codeField.text != showing.code) codeField.text = showing.code
            codeField.accessibleDescription("Spelled: " + AgentPush.spokenCode(showing.code))
            countdownLabel.text = "Expires in " + AgentPush.countdown(showing.secondsLeft)
            countdownLabel.accessibleDescription("Expires in " + AgentPush.spokenDuration(showing.secondsLeft))
            if (!timer.isRunning) timer.start()
        } else {
            codeField.text = ""
            timer.stop()
        }
        val message = when (view) {
            CodeView.Requesting -> "Requesting a pairing code…"
            CodeView.Expired -> "The code expired. Request a new one to pair an agent."
            is CodeView.Failed -> "Could not get a pairing code: " + view.message
            else -> null
        }
        messageLabel.isVisible = message != null
        messageLabel.text = plain(message ?: "")
        val problem = state.channelProblem
        problemLabel.isVisible = problem != null && !paired
        problemLabel.text = plain(problem?.let { "The live channel is not open: $it" } ?: "")
        newCode.isVisible = view !is CodeView.Requesting && view !is CodeView.Showing
        newCode.text = if (paired) "Pair another agent" else if (view is CodeView.Failed) "Try again" else "New code"

        announceChange(paired, view)
        component.revalidate()
        component.repaint()
    }

    private fun announceChange(paired: Boolean, view: CodeView) {
        val text = when {
            view is CodeView.Showing -> "Pairing code ${AgentPush.spokenCode(view.code)}. Expires in ${AgentPush.spokenDuration(view.secondsLeft)}. ${AgentPush.INSTRUCTION}."
            view is CodeView.Expired -> "The pairing code expired."
            view is CodeView.Failed -> "Could not get a pairing code: ${view.message}"
            paired -> "Connected to ${AgentPush.agentsText(state.agents)}."
            else -> null
        } ?: return
        // the countdown changes every second: announce a code once, not once per tick
        val key = if (view is CodeView.Showing) "code:" + view.code else text
        if (key == announced) return
        announced = key
        announce(component, text, assertive = view is CodeView.Failed)
    }

    private fun onCopy() {
        val code = (state.codeView(now()) as? CodeView.Showing)?.code ?: return
        runCatching { copy(code) }
            .onSuccess { announce(component, "Pairing code copied", assertive = false) }
            .onFailure { announce(component, "Could not copy the code", assertive = true) }
    }

    private fun onDisconnect() {
        disconnect.isEnabled = false
        session.disconnectAgents { error ->
            disconnect.isEnabled = true
            if (error == null) {
                announced = null
                announce(component, "AI agents disconnected.", assertive = false)
            } else {
                messageLabel.isVisible = true
                messageLabel.text = plain("Could not disconnect: $error")
                announce(component, "Could not disconnect: $error", assertive = true)
            }
        }
    }

    /** The dialog closed: stop the clock and the subscription. */
    fun dispose() {
        timer.stop()
        unsubscribe()
    }

    // for the tests
    internal val codeText: String get() = codeField.text
    internal val countdownText: String get() = countdownLabel.text
    internal val messageText: String? get() = messageLabel.text.takeIf { messageLabel.isVisible }
    internal val connectedText: String? get() = connectedLabel.text.takeIf { connectedLabel.isVisible }
    internal fun clickCopy() = copyButton.doClick()
    internal fun clickDisconnect() = disconnect.doClick()
    internal fun clickNewCode() = newCode.doClick()
    internal val newCodeVisible: Boolean get() = newCode.isVisible
}

private fun copyToClipboard(text: String) {
    val selection = java.awt.datatransfer.StringSelection(text)
    val viaIde = runCatching {
        com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(selection)
    }.isSuccess
    if (!viaIde) java.awt.Toolkit.getDefaultToolkit().systemClipboard.setContents(selection, null)
}

/** One "Connect AI" dialog per app session (opening it again brings it to the front). */
private val openDialogs = java.util.WeakHashMap<AppSession, javax.swing.JDialog>()

/** Opens the "Connect AI" dialog of [session], modeless, over [owner]'s window. */
internal fun openConnectAiDialog(session: AppSession, owner: java.awt.Component? = null) {
    if (java.awt.GraphicsEnvironment.isHeadless()) return
    openDialogs[session]?.takeIf { it.isDisplayable }?.let { it.toFront(); it.requestFocus(); return }
    val window = owner?.let { SwingUtilities.getWindowAncestor(it) }
        ?: java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().activeWindow
    val dialog = javax.swing.JDialog(window, "Connect AI", java.awt.Dialog.ModalityType.MODELESS)
    val panel = ConnectAiPanel(session)
    dialog.contentPane = panel.component
    dialog.pack()
    dialog.setSize(maxOf(dialog.width, JBUI.scale(420)), dialog.height + JBUI.scale(40))
    dialog.setLocationRelativeTo(window)
    dialog.defaultCloseOperation = javax.swing.WindowConstants.DISPOSE_ON_CLOSE
    dialog.addWindowListener(object : java.awt.event.WindowAdapter() {
        override fun windowClosed(e: java.awt.event.WindowEvent) {
            panel.dispose()
            openDialogs.remove(session)
        }
    })
    dialog.rootPane.registerKeyboardAction({ dialog.dispose() }, javax.swing.KeyStroke.getKeyStroke("ESCAPE"), JComponent.WHEN_IN_FOCUSED_WINDOW)
    openDialogs[session] = dialog
    dialog.isVisible = true
}

/**
 * The navigator's "Connect AI" link (shown only while the app has push on): its text says who is
 * connected, kept current while it is on screen.
 */
internal fun connectAiLink(session: AppSession): JComponent {
    val link = object : ActionLink(plain("🔌 " + session.agentPairing.controlLabel()), { e: java.awt.event.ActionEvent ->
        openConnectAiDialog(session, e.source as? java.awt.Component)
    }) {
        private var unsubscribe: (() -> Unit)? = null
        fun sync() {
            val label = session.agentPairing.controlLabel()
            text = plain("🔌 $label")
            accessibleName(label).accessibleDescription("Pair this window with an AI agent, so it can show screens here")
        }
        override fun addNotify() {
            super.addNotify()
            unsubscribe?.invoke()
            unsubscribe = session.agentPairing.onChange { sync() }
            sync()
        }
        override fun removeNotify() {
            unsubscribe?.invoke()
            unsubscribe = null
            super.removeNotify()
        }
    }
    link.accessibleName(session.agentPairing.controlLabel())
        .accessibleDescription("Pair this window with an AI agent, so it can show screens here")
    link.border = JBUI.Borders.empty(8)
    return link
}
