package io.mateu.ijp.plugin

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.content.ContentFactory
import io.mateu.ijp.state.AppSession

/**
 * The desktop app's AI chat (App.sseUrl) as a tool window on the RIGHT — where IntelliJ puts its own
 * assistant —, beside the screens rather than as a floating dialog opened from the menu panel.
 * Declared in plugin.xml (never registered at runtime: that API is override-only) and unavailable
 * until a UI with a chat opens; switching UI takes it away again.
 */
object MateuAssistantToolWindow {

    /** Must match the <toolWindow id="…"> in plugin.xml. */
    const val ID = "Mateu Assistant"

    /** Shows [assistant] (for [session]'s UI) in the panel, or takes the panel away when null. */
    fun show(project: Project, session: AppSession?, assistant: AppSession.Assistant?) {
        val app = ApplicationManager.getApplication()
        val apply = Runnable {
            if (project.isDisposed) return@Runnable
            // on 2025.2 a tool-window change before the frame's pane exists throws (CLAUDE.md note)
            runCatching {
                val tw = ToolWindowManager.getInstance(project).getToolWindow(ID) ?: return@Runnable
                val current = tw.component.getClientProperty(SHOWN) as? AppSession.Assistant
                if (assistant == null || session == null) {
                    tw.contentManager.removeAllContents(true)
                    tw.component.putClientProperty(SHOWN, null)
                    tw.setAvailable(false)
                    return@Runnable
                }
                // the app shell re-renders (context change, menu refresh): keep the conversation
                if (current == assistant && tw.contentManager.contentCount > 0) return@Runnable
                tw.contentManager.removeAllContents(true)
                val panel = io.mateu.ijp.ui.buildChatPanel(session, assistant.sseUrl, assistant.uploadUrl, host = null) { tw.hide() }
                tw.contentManager.addContent(ContentFactory.getInstance().createContent(panel, "", false))
                tw.component.putClientProperty(SHOWN, assistant)
                tw.stripeTitle = assistant.label
                tw.setAvailable(true)
            }
        }
        if (app.isDispatchThread) apply.run() else app.invokeLater(apply)
    }

    private const val SHOWN = "io.mateu.assistant.shown"
}

/** The declaration behind [MateuAssistantToolWindow]: no content until a UI with a chat opens. */
class MateuAssistantToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun shouldBeAvailable(project: Project): Boolean = false
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        // filled by MateuAssistantToolWindow.show when the open UI publishes its chat
    }
}
