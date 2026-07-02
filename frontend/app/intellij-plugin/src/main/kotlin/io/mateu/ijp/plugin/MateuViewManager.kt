package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindowAnchor
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.content.ContentFactory
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.util.function.Supplier
import javax.swing.JComponent

/**
 * Places Mateu views the IntelliJ-native way: a **Crud listing goes to the bottom "Mateu" tool
 * window** (like search/find results), while everything else — non-Crud pages and the **detail**
 * opened from a row — goes to a **central editor tab**. The view's type is detected on first content
 * ([AppContext.onFirstContent]), so we load once and then route it to the right host.
 */
class MateuViewManager(private val project: Project, private val session: AppSession) {

    // key ("sst::route") → a function that re-focuses the already-open view.
    private val focusByKey = HashMap<String, () -> Unit>()

    fun openView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) {
        val key = "${serverSideType.orEmpty()}::${route.orEmpty()}"
        focusByKey[key]?.let { it(); return }

        val title = label.ifBlank { route ?: "View" }
        val ctx = AppContext(session)
        val panel = ctx.newSlot()
        ctx.contentPane = panel
        ctx.onFirstContent = { isCrud ->
            focusByKey[key] = if (isCrud) placeCrudList(panel, title) else placeEditor(panel, title)
        }
        ctx.navigate(route, consumedRoute, serverSideType, actionId)
    }

    /** Crud listing → a tab in the bottom "Mateu" results tool window. */
    private fun placeCrudList(panel: JComponent, title: String): () -> Unit {
        val twm = ToolWindowManager.getInstance(project)
        val tw = twm.getToolWindow(RESULTS_ID) ?: twm.registerToolWindow(RESULTS_ID) {
            anchor = ToolWindowAnchor.BOTTOM
            canCloseContent = true
            stripeTitle = Supplier { "Mateu" }
        }
        val content = ContentFactory.getInstance().createContent(panel, title, false)
        tw.contentManager.addContent(content)
        tw.contentManager.setSelectedContent(content)
        tw.activate(null)
        return {
            tw.activate(null)
            tw.contentManager.setSelectedContent(content)
        }
    }

    /** Non-Crud view / row detail → a tab in the central editor area. */
    private fun placeEditor(panel: JComponent, title: String): () -> Unit {
        val file = MateuVirtualFile(title, panel)
        val fem = FileEditorManager.getInstance(project)
        fem.openFile(file, true)
        return { fem.openFile(file, true) }
    }

    companion object {
        private const val RESULTS_ID = "MateuResults"
    }
}
