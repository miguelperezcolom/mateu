package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.chat.ChatEvents
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import javax.swing.JComponent
import javax.swing.SwingUtilities

/**
 * Applies a UI event an AGENT sent — the ONE function behind both the chat's mid-stream events
 * (`ChatPanel`) and the live UI push channel (`AgentChannelStream`, phase C), so a pushed message
 * does exactly what the same event in the chat does: `navigation-requested` opens the menu entry
 * with the whole detail (as a menu click), `close-requested` closes ([onClose]), `render-screen`
 * goes to a subscriber first, else the shell renders it through `__preview__` (target content → the
 * transient Preview tab, drawer → a side window, dialog → a modal), and any other event goes to the
 * session's event bus. EDT.
 *
 * @param host the view the event concerns (an inline Chat component's view); null → the view the
 *   user last navigated in ([AppSession.activeView]).
 * @param owner a component of the window the preview windows belong to; null → the active window.
 * @param onError how a failed preview is reported (the chat writes it in the conversation; the push
 *   channel raises an IDE notification).
 */
internal object AgentEvents {

    fun apply(
        session: AppSession,
        event: String,
        detail: JsonNode,
        host: AppContext? = null,
        owner: JComponent? = null,
        onClose: () -> Unit = {},
        onError: (String) -> Unit = { notifyError(session, it) },
    ) {
        when (val effect = ChatEvents.decide(event, detail, session::hasSubscriber, session.appMenu)) {
            is ChatEvents.Effect.Navigate -> session.openMenuEntry(effect.entry)
            ChatEvents.Effect.Close -> onClose()
            is ChatEvents.Effect.RenderScreen -> renderScreen(session, effect, host, owner, onError)
            is ChatEvents.Effect.Bus -> session.dispatchEvent(effect.event, effect.detail)
            ChatEvents.Effect.Ignore -> Unit
        }
    }

    /** The shell renders the screen itself: the reserved `__preview__` sync action, then its fragments. */
    private fun renderScreen(
        session: AppSession,
        effect: ChatEvents.Effect.RenderScreen,
        host: AppContext?,
        owner: JComponent?,
        onError: (String) -> Unit,
    ) {
        val view = host ?: session.activeView
        val route = view?.currentRoute?.ifBlank { null } ?: session.homeRoute ?: session.appRootRoute
        val consumed = view?.currentConsumedRoute ?: ""
        session.executor.submit {
            val increment = runCatching {
                session.apiClient.runAction(
                    route, consumed, ChatEvents.PREVIEW_ACTION, null, "chat",
                    emptyMap(), HashMap(session.appState), ChatEvents.previewParameters(effect.yaml),
                )
            }.getOrElse { e ->
                SwingUtilities.invokeLater { onError(e.message ?: "preview failed") }
                return@submit
            }
            SwingUtilities.invokeLater { presentPreview(session, effect, route, consumed, increment, owner) }
        }
    }

    private fun presentPreview(
        session: AppSession,
        effect: ChatEvents.Effect.RenderScreen,
        route: String,
        consumed: String,
        increment: JsonNode,
        owner: JComponent?,
    ) {
        val ctx = AppContext(session)
        ctx.titleConsumer = {}
        val panel = ctx.newSlot()
        ctx.contentPane = panel
        ctx.currentRoute = route
        ctx.currentConsumedRoute = consumed
        ctx.applyIncrement(increment)
        val title = effect.title ?: ctx.lastWindowTitle ?: "Preview"
        if (effect.target == "content") {
            session.contentPreviewHandler?.let { it(title, panel, ctx); return }
        }
        if (java.awt.GraphicsEnvironment.isHeadless()) return
        val window = owner?.let { SwingUtilities.getWindowAncestor(it) }
            ?: java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().activeWindow
            ?: session.frame
        val modality = if (effect.target == "dialog") java.awt.Dialog.ModalityType.DOCUMENT_MODAL else java.awt.Dialog.ModalityType.MODELESS
        val dialog = javax.swing.JDialog(window, title, modality)
        dialog.contentPane.add(JBScrollPane(panel).apply { border = null })
        val ideFrame = window?.owner ?: window
        if (effect.target == "drawer" && ideFrame != null) {
            // a side panel over the content, anchored to the right edge of the IDE window
            val width = JBUI.scale(520)
            dialog.setSize(width, (ideFrame.height - 80).coerceAtLeast(300))
            dialog.setLocation(ideFrame.x + ideFrame.width - width - 10, ideFrame.y + 60)
        } else {
            dialog.setSize(JBUI.scale(720), JBUI.scale(560))
            dialog.setLocationRelativeTo(ideFrame)
        }
        dialog.addWindowListener(object : java.awt.event.WindowAdapter() {
            override fun windowClosed(e: java.awt.event.WindowEvent) = ctx.dispose()
        })
        dialog.rootPane.registerKeyboardAction({ dialog.dispose() }, javax.swing.KeyStroke.getKeyStroke("ESCAPE"), JComponent.WHEN_IN_FOCUSED_WINDOW)
        dialog.isVisible = true
    }

    private fun notifyError(session: AppSession, message: String) {
        val host = session.notifier
        if (host != null) host("Mateu", message, "error", null) else System.err.println("[Mateu] agent push: $message")
    }
}
