package io.mateu.ijp.plugin

import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory
import io.mateu.ijp.state.AppSession
import javax.swing.SwingUtilities

/** The project's Mateu [AppSession] (set when the project service boots the app). */
val MATEU_SESSION: com.intellij.openapi.util.Key<AppSession> =
    com.intellij.openapi.util.Key.create("mateu.session")

/**
 * The main **"Mateu" tool window** — a navigator hosting the app shell's menu. The app itself
 * boots at project startup (MateuProjectService), so the menu-bar widget and IDE actions exist
 * before this panel is ever opened; the tool window just adopts the already-rendered navigator.
 */
class MateuToolWindowFactory : ToolWindowFactory, DumbAware {
    /** Only projects pointed at a Mateu backend (or the standalone distribution) get the stripe
     *  button; Settings | Tools | Mateu flips it on when a backend is configured. */
    override fun shouldBeAvailable(project: Project): Boolean = loadMateuConfig(project).configured


    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val svc = project.service<MateuProjectService>()
        svc.ensureBooted()
        svc.session?.let { session ->
            // The APP's SetWindowTitle → the tool window's title suffix (views/mediators route
            // their titles to their own tab via AppContext.titleConsumer).
            session.titleConsumer = { title -> SwingUtilities.invokeLater { toolWindow.title = title } }
            session.appTitle?.takeIf { it.isNotBlank() }?.let { toolWindow.title = it }
            // "Connect AI" on the title bar — visible only while the app has live UI push on.
            toolWindow.setTitleActions(listOf(ConnectAiAction(session)))
            session.onAgentPushChanged = { com.intellij.ide.ActivityTracker.getInstance().inc() }
            session.agentPairing.onChange { com.intellij.ide.ActivityTracker.getInstance().inc() }
        }

        val content = ContentFactory.getInstance().createContent(svc.navigatorRoot, "Menu", false)
        content.isCloseable = false
        toolWindow.contentManager.addContent(content)
    }
}

/**
 * The tool window's "Connect AI" title action (live UI push): opens the pairing dialog; its text says
 * who is connected. Hidden unless the app has `agentPush`.
 */
internal class ConnectAiAction(private val session: AppSession) :
    com.intellij.openapi.actionSystem.AnAction("Connect AI", "Pair this window with an AI agent, so it can show screens here", null),
    DumbAware {
    init {
        templatePresentation.putClientProperty(com.intellij.openapi.actionSystem.ex.ActionUtil.SHOW_TEXT_IN_TOOLBAR, true)
    }

    override fun getActionUpdateThread() = com.intellij.openapi.actionSystem.ActionUpdateThread.EDT

    override fun update(e: com.intellij.openapi.actionSystem.AnActionEvent) {
        e.presentation.isEnabledAndVisible = session.agentPush
        e.presentation.text = session.agentPairing.controlLabel()
    }

    override fun actionPerformed(e: com.intellij.openapi.actionSystem.AnActionEvent) {
        io.mateu.ijp.ui.openConnectAiDialog(session, e.getData(com.intellij.openapi.actionSystem.PlatformDataKeys.CONTEXT_COMPONENT))
    }
}
