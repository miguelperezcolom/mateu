package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.chat.ChatAttachment
import io.mateu.ijp.chat.ChatEvents
import io.mateu.ijp.chat.ChatMarkdown
import io.mateu.ijp.chat.ChatRequests
import io.mateu.ijp.chat.ChatScreenContext
import io.mateu.ijp.chat.ChatTransport
import io.mateu.ijp.chat.ChatTurn
import io.mateu.ijp.chat.TokenUsage
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.awt.FlowLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JPanel
import javax.swing.SwingUtilities
import javax.swing.event.HyperlinkEvent

/**
 * The assistant, speaking the mateu-chat contract (see `io.mateu.ijp.chat`): the SSE answer is read
 * by event AS IT ARRIVES — the answer grows in place (markdown kept), a progress line says what the
 * agent is doing, the token usage shows under it, and the UI events the agent sends (navigate, close,
 * render a screen, anything a component subscribes to) apply mid-stream.
 *
 * Shared by the app's assistant window ([host] null: the screen it talks about is the view the user
 * last navigated in) and an inline `Chat` component ([host] = the view that holds it).
 */
internal class ChatPanel(
    private val session: AppSession,
    sseUrl: String,
    uploadUrl: String?,
    private val host: AppContext?,
    private val onClose: () -> Unit,
) {
    private val sseUrl = ChatRequests.resolve(sseUrl, session.baseUrl) ?: sseUrl
    private val uploadUrl = ChatRequests.resolve(uploadUrl, session.baseUrl)
    private val mcpUrl = ChatRequests.resolve(session.appMcpUrl, session.baseUrl)
    /** The UI session id — the app session's (its `X-Session-Id`), so the chat and the live UI push
     *  channel name the same session, as on the web. */
    private val sessionId = session.sessionId
    private val transport = ChatTransport(session.apiClient)

    private data class Entry(val user: Boolean, var text: String)
    private val entries = ArrayList<Entry>()
    private var menuContextSent = false
    private var attachments: List<ChatAttachment> = emptyList()
    private var loading = false

    private val conversation = JEditorPane("text/html", "")
    private val input = JBTextField()
    private val send = JButton("Send")
    private val attach = JButton("Attach…")
    private val attachmentsLabel = JBLabel()
    private val progressLabel = JBLabel()
    private val usageLabel = JBLabel()

    val component: JComponent = build()

    private fun build(): JComponent {
        conversation.isEditable = false
        conversation.putClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES, true)
        conversation.font = UIUtil.getLabelFont()
        conversation.accessibleName("Conversation")
        conversation.addHyperlinkListener { e -> if (e.eventType == HyperlinkEvent.EventType.ACTIVATED) openLink(e.description ?: "") }
        input.accessibleName("Message to the assistant")
        send.accessibleName("Send message")
        attach.accessibleName("Attach files").accessibleDescription("Upload files to send with the next message")
        progressLabel.accessibleName("Assistant progress")
        usageLabel.accessibleName("Token usage")
        for (l in listOf(progressLabel, usageLabel, attachmentsLabel)) {
            l.foreground = UIUtil.getContextHelpForeground()
            l.font = JBUI.Fonts.smallFont()
            l.isVisible = false
        }
        input.addActionListener { submit() }
        send.addActionListener { submit() }
        attach.addActionListener { pickFiles() }
        attach.isVisible = uploadUrl != null

        val status = verticalPanel(2)
        status.addStacked(progressLabel, 0)
        status.addStacked(usageLabel, 0)
        status.addStacked(attachmentsLabel, 0)
        val inputRow = JPanel(BorderLayout(JBUI.scale(6), 0))
        inputRow.isOpaque = false
        inputRow.add(input, BorderLayout.CENTER)
        val buttons = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(4), 0))
        buttons.isOpaque = false
        buttons.add(attach)
        buttons.add(send)
        inputRow.add(buttons, BorderLayout.EAST)
        val south = JPanel(BorderLayout(0, JBUI.scale(4)))
        south.isOpaque = false
        south.add(status, BorderLayout.NORTH)
        south.add(inputRow, BorderLayout.SOUTH)

        val root = JPanel(BorderLayout(0, JBUI.scale(6)))
        root.border = JBUI.Borders.empty(10)
        root.add(JBScrollPane(conversation), BorderLayout.CENTER)
        root.add(south, BorderLayout.SOUTH)
        return root
    }

    // ── a turn ──────────────────────────────────────────────────────────────────────────────

    private fun submit() {
        val text = input.text.trim()
        val files = attachments
        if (loading || (text.isEmpty() && files.isEmpty())) return
        input.text = ""
        attachments = emptyList()
        refreshAttachments()
        val shown = if (files.isEmpty()) text else (text + (if (text.isEmpty()) "" else "\n\n") + "📎 " + files.joinToString(", ") { it.name })
        entries.add(Entry(user = true, text = shown))
        val agent = Entry(user = false, text = "")
        entries.add(agent)
        repaintConversation()

        // what the user is LOOKING AT rides with every message, captured on the EDT
        val body = ChatRequests.json(
            ChatRequests.body(text, sessionId, screenContext(), mcpUrl, session.appMenu, !menuContextSent, files),
        )
        menuContextSent = true
        setLoading(true)
        val startedAt = System.currentTimeMillis()
        lateinit var turn: ChatTurn
        val ticker = javax.swing.Timer(1000) { progressLabel.text = plain(turn.progressLine(startedAt)) }
        turn = ChatTurn(object : ChatTurn.Listener {
            override fun answer(text: String) = onEdt { agent.text = text; repaintConversation() }
            override fun progress() = onEdt { progressLabel.text = plain(turn.progressLine(startedAt)) }
            override fun usage(usage: TokenUsage) = onEdt { usageLabel.text = plain(usage.line()); usageLabel.isVisible = true }
            override fun event(event: String, detail: JsonNode) = onEdt { applyEvent(event, detail) }
        })
        progressLabel.text = plain(turn.progressLine(startedAt))
        ticker.start()
        session.executor.submit {
            val failure = runCatching { transport.stream(sseUrl, body) { turn.accept(it) } }.exceptionOrNull()
            onEdt {
                ticker.stop()
                agent.text = when {
                    failure != null -> {
                        val t = ChatTurn.failureText(failure, turn.answered)
                        if (turn.answered) agent.text + "\n\n" + t else t
                    }
                    !turn.answered -> ChatTurn.NO_ANSWER
                    else -> agent.text
                }
                repaintConversation()
                setLoading(false)
                announce(conversation, agent.text.take(300), assertive = false)
                input.requestFocusInWindow()
            }
        }
    }

    private fun setLoading(on: Boolean) {
        loading = on
        send.isEnabled = !on
        progressLabel.isVisible = on
    }

    /** The screen the assistant is told about: the hosting view, else the one last navigated in. */
    private fun screenContext(): ChatScreenContext {
        val view = host ?: session.activeView
        return ChatScreenContext(
            route = view?.currentRoute?.ifBlank { null } ?: session.homeRoute,
            screenTitle = view?.lastWindowTitle,
            appState = HashMap(session.appState),
            componentState = view?.currentComponentState?.let { HashMap(it) } ?: emptyMap(),
            tree = view?.lastContent,
        )
    }

    // ── events ──────────────────────────────────────────────────────────────────────────────

    /** The SAME applier the live UI push channel uses (see [AgentEvents]): one behaviour for both. */
    private fun applyEvent(event: String, detail: JsonNode) {
        AgentEvents.apply(session, event, detail, host, component, onClose) { message ->
            entries.add(Entry(false, ChatTurn.ERROR_PREFIX + message))
            repaintConversation()
        }
    }

    /** A link in an answer: an app route opens through the menu entry serving it, a url in the browser. */
    private fun openLink(href: String) {
        if (ChatMarkdown.isAppRoute(href)) {
            val effect = ChatEvents.navigation(session.mapper.createObjectNode().put("route", href), session.appMenu)
            if (effect is ChatEvents.Effect.Navigate) session.openMenuEntry(effect.entry)
        } else {
            SafeHtml.browse(href)
        }
    }

    // ── attachments ─────────────────────────────────────────────────────────────────────────

    private fun pickFiles() {
        val url = uploadUrl ?: return
        val chooser = javax.swing.JFileChooser()
        chooser.isMultiSelectionEnabled = true
        if (chooser.showOpenDialog(component) != javax.swing.JFileChooser.APPROVE_OPTION) return
        val picked = chooser.selectedFiles.toList()
        if (picked.isEmpty()) return
        attach.isEnabled = false
        session.executor.submit {
            val result = runCatching { transport.upload(url, sessionId, picked.map { it.name to it.readBytes() }) }
            onEdt {
                attach.isEnabled = true
                result.onSuccess { attachments = attachments + it; refreshAttachments() }
                    .onFailure { entries.add(Entry(false, "⚠️ The files could not be uploaded: ${it.message}")); repaintConversation() }
            }
        }
    }

    private fun refreshAttachments() {
        attachmentsLabel.isVisible = attachments.isNotEmpty()
        attachmentsLabel.text = plain("📎 " + attachments.joinToString(", ") { it.name })
        attachmentsLabel.accessibleName("Attachments: " + attachments.joinToString(", ") { it.name })
    }

    // ── rendering ───────────────────────────────────────────────────────────────────────────

    private fun repaintConversation() {
        val html = StringBuilder("<html><body>")
        for (e in entries) {
            if (e.user) {
                html.append("<p><b>You:</b><br>").append(SafeHtml.escape(e.text).replace("\n", "<br>")).append("</p>")
            } else {
                html.append("<div><b>Agent:</b><br>").append(ChatMarkdown.toHtml(e.text.ifEmpty { "…" })).append("</div><br>")
            }
        }
        conversation.text = html.append("</body></html>").toString()
        conversation.caretPosition = conversation.document.length
    }

    private fun onEdt(block: () -> Unit) {
        if (SwingUtilities.isEventDispatchThread()) block() else SwingUtilities.invokeLater(block)
    }
}

/** The assistant panel (see [ChatPanel]); [onClose] runs on the agent's close-requested. */
internal fun buildChatPanel(
    session: AppSession,
    sseUrl: String,
    uploadUrl: String? = null,
    host: AppContext? = null,
    onClose: () -> Unit = {},
): JComponent = ChatPanel(session, sseUrl, uploadUrl, host, onClose).component
