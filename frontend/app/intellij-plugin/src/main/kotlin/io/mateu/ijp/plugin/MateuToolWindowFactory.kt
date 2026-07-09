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

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val svc = project.service<MateuProjectService>()
        svc.ensureBooted()
        svc.session?.let { session ->
            // The APP's SetWindowTitle → the tool window's title suffix (views/mediators route
            // their titles to their own tab via AppContext.titleConsumer).
            session.titleConsumer = { title -> SwingUtilities.invokeLater { toolWindow.title = title } }
            session.appTitle?.takeIf { it.isNotBlank() }?.let { toolWindow.title = it }
        }

        val content = ContentFactory.getInstance().createContent(svc.navigatorRoot, "Menu", false)
        content.isCloseable = false
        toolWindow.contentManager.addContent(content)
    }
}
