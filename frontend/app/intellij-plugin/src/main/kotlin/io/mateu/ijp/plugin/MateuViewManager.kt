package io.mateu.ijp.plugin

import com.intellij.ide.ActivityTracker
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindowAnchor
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.content.ContentFactory
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.util.function.Supplier
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Places Mateu views the IntelliJ-native way: a **Crud listing goes to the bottom "Mateu" tool
 * window** (like search/find results), while everything else — non-Crud pages and the **detail**
 * opened from a row — goes to a **central editor tab**. The view's type is detected on first content
 * ([AppContext.onFirstContent]), so we load once and then route it to the right host.
 *
 * Both hosts render the view's toolbar actions natively (see [viewActionGroup]): an ActionToolbar
 * strip on top of the editor tab, the title-bar actions on the bottom tool window.
 */
class MateuViewManager(private val project: Project, private val session: AppSession) {

    // key ("sst::route") → a function that re-focuses the already-open view.
    private val focusByKey = HashMap<String, () -> Unit>()

    /** Menu entry → view (Crud listing to the bottom tool window, everything else to an editor tab). */
    fun openView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = false)

    /** Row detail → always a central editor tab (even if the form embeds grids). */
    fun openDetail(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = true)

    private fun open(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?, preferEditor: Boolean) {
        val key = "${serverSideType.orEmpty()}::${route.orEmpty()}"
        focusByKey[key]?.let { it(); return }

        val title = label.ifBlank { route ?: "View" }
        val ctx = AppContext(session)
        val panel = ctx.newSlot()
        ctx.contentPane = panel
        // Both hosts (editor header / tool window title) show the view's toolbar natively.
        ctx.nativeToolbarHost = true
        ctx.onViewActionsChanged = { ActivityTracker.getInstance().inc() }
        ctx.onFirstContent = { isCrud ->
            focusByKey[key] = if (isCrud && !preferEditor) {
                // Row detail / New / Edit navigations from this listing open in a central editor tab.
                ctx.detailOpener = { dLabel, dRoute, dConsumed, dSst -> openDetail(dLabel, dRoute, dConsumed, dSst, null) }
                placeCrudList(ctx, panel, title)
            } else {
                placeEditor(ctx, panel, title)
            }
        }
        ctx.navigate(route, consumedRoute, serverSideType, actionId)
    }

    /** Crud listing → a tab in the bottom "Mateu" results tool window; actions on the title bar. */
    private fun placeCrudList(ctx: AppContext, panel: JComponent, title: String): () -> Unit {
        val twm = ToolWindowManager.getInstance(project)
        val tw = twm.getToolWindow(RESULTS_ID) ?: twm.registerToolWindow(RESULTS_ID) {
            anchor = ToolWindowAnchor.BOTTOM
            canCloseContent = true
            stripeTitle = Supplier { "Mateu" }
        }
        val content = ContentFactory.getInstance().createContent(panel, title, false)
        content.setActions(viewActionGroup(ctx), ActionPlaces.TOOLWINDOW_TITLE, panel)
        tw.contentManager.addContent(content)
        tw.contentManager.setSelectedContent(content)
        tw.activate(null)
        return {
            tw.activate(null)
            tw.contentManager.setSelectedContent(content)
        }
    }

    /** Non-Crud view / row detail → an editor tab with a native ActionToolbar strip on top. */
    private fun placeEditor(ctx: AppContext, panel: JComponent, title: String): () -> Unit {
        val toolbar = ActionManager.getInstance().createActionToolbar(ActionPlaces.EDITOR_TOOLBAR, viewActionGroup(ctx), true)
        toolbar.targetComponent = panel
        val wrapper = JPanel(BorderLayout())
        wrapper.add(toolbar.component, BorderLayout.NORTH)
        wrapper.add(panel, BorderLayout.CENTER)

        val file = MateuVirtualFile(title, wrapper)
        val fem = FileEditorManager.getInstance(project)
        fem.openFile(file, true)
        return { fem.openFile(file, true) }
    }

    companion object {
        private const val RESULTS_ID = "MateuResults"
    }
}
