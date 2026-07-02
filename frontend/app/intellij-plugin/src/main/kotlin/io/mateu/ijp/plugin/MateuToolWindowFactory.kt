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
 * Hosts the Mateu renderer inside a **dockable IntelliJ ToolWindow** (the plugin form): the tool
 * window can be docked/moved/floated like any IDE panel, and the whole platform is available (native
 * date pickers, popups, menus, …). The Mateu UI itself — app shell + tabbed workspace — is rendered
 * into the tool window's content by the same framework-agnostic renderers as before.
 */
class MateuToolWindowFactory : ToolWindowFactory, DumbAware {

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val cfg = loadMateuConfig()
        val session = AppSession(cfg.baseUrl, cfg.config)
        val ctx = AppContext(session)

        val root = ctx.newSlot()
        ctx.contentPane = root
        // SetWindowTitle → the tool window's title suffix (there is no JFrame here).
        session.titleConsumer = { title -> SwingUtilities.invokeLater { toolWindow.title = title } }

        val content = ContentFactory.getInstance().createContent(root, "", false)
        content.isCloseable = false
        toolWindow.contentManager.addContent(content)

        ctx.initialLoad(cfg.route)
    }
}
