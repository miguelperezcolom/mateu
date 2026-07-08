package io.mateu.ijp.plugin

import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import javax.swing.SwingUtilities

/**
 * The main **"Mateu" tool window** — a navigator hosting the app shell's menu. Each menu entry opens
 * its view in its own dockable tool window ([MateuViewManager]), so views can be docked/floated/split
 * independently. The whole platform is available (native date pickers, popups, menus, …), and the
 * same framework-agnostic renderers do the drawing.
 */
class MateuToolWindowFactory : ToolWindowFactory, DumbAware {

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val cfg = loadMateuConfig()
        val session = AppSession(cfg.baseUrl, cfg.config)
        val viewManager = MateuViewManager(project, session)
        session.openViewHandler = viewManager::openView
        session.openDetailHandler = viewManager::openDetail

        val ctx = AppContext(session)
        val root = ctx.newSlot()
        ctx.contentPane = root
        // The APP's SetWindowTitle → the tool window's title suffix (there is no JFrame here).
        // Views/mediators route their titles to their own tab via AppContext.titleConsumer.
        session.titleConsumer = { title -> SwingUtilities.invokeLater { toolWindow.title = title } }

        val content = ContentFactory.getInstance().createContent(root, "Menu", false)
        content.isCloseable = false
        toolWindow.contentManager.addContent(content)

        // Loads the App fragment → renderApp draws the menu navigator into this tool window.
        ctx.initialLoad(cfg.route)
    }
}
