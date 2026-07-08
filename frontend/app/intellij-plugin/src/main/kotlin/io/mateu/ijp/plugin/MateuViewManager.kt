package io.mateu.ijp.plugin

import com.intellij.ide.ActivityTracker
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.FileEditorManagerListener
import com.intellij.openapi.fileEditor.ex.FileEditorManagerEx
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.VirtualFile
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

    init {
        // Dirty guard on tab close (@ConfirmOnNavigationIfDirty): there is no veto API for editor
        // tabs, so when a dirty Mateu tab is closed we ask — "Keep Editing" reopens the SAME file,
        // whose panel and state travel on the MateuVirtualFile, restoring everything intact.
        project.messageBus.connect().subscribe(
            FileEditorManagerListener.FILE_EDITOR_MANAGER,
            object : FileEditorManagerListener {
                override fun fileClosed(source: FileEditorManager, file: VirtualFile) {
                    if (file !is MateuVirtualFile) return
                    val ctx = file.ctx ?: return
                    println("[Mateu] fileClosed '${file.presentableTitle}' trackDirty=${ctx.trackDirty} dirty=${ctx.dirty}")
                    if (!ctx.dirty) return
                    ApplicationManager.getApplication().invokeLater {
                        // Veto semantics (the platform has no real veto for editor tabs): restore
                        // the tab FIRST, ask, and only close it again if the user discards.
                        source.openFile(file, true)
                        val choice = Messages.showYesNoDialog(
                            project,
                            "\"${file.presentableTitle}\" has unsaved changes. Discard them?",
                            "Unsaved Changes",
                            "Discard",
                            "Keep Editing",
                            Messages.getWarningIcon(),
                        )
                        if (choice == Messages.YES) {
                            ctx.setDirtyState(false)
                            source.closeFile(file)
                        }
                    }
                }
            },
        )
    }

    /** Menu entry → view (Crud listing to the bottom tool window, everything else to an editor tab). */
    fun openView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = false)

    /** Row detail → always a central editor tab (even if the form embeds grids). */
    fun openDetail(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = true)

    private fun open(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?, preferEditor: Boolean) {
        // "New" views are never cached/re-focused: every New opens a FRESH editor tab, so several
        // drafts can be edited side by side (each with its own context and state).
        val cacheable = !route.orEmpty().trimEnd('/').endsWith("/new")
        val key = "${serverSideType.orEmpty()}::${route.orEmpty()}"
        if (cacheable) focusByKey[key]?.let { it(); return }

        val title = label.ifBlank { route ?: "View" }
        val ctx = AppContext(session)
        val panel = ctx.newSlot()
        ctx.contentPane = panel
        // Both hosts (editor header / tool window title) show the view's toolbar natively.
        ctx.nativeToolbarHost = true
        ctx.onViewActionsChanged = { ActivityTracker.getInstance().inc() }
        // Swallow SetWindowTitle until a host mounts (else it would clobber the navigator's tool
        // window title); the host reads ctx.lastWindowTitle on attach and takes over.
        ctx.titleConsumer = {}
        ctx.onFirstContent = { isCrud ->
            val focus = if (isCrud && !preferEditor) {
                // Row detail / New / Edit navigations from this listing open in a central editor tab.
                ctx.detailOpener = { dLabel, dRoute, dConsumed, dSst -> openDetail(dLabel, dRoute, dConsumed, dSst, null) }
                placeCrudList(ctx, panel, title)
            } else {
                placeEditor(ctx, panel, title)
            }
            if (cacheable) focusByKey[key] = focus
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
            icon = IconLoader.getIcon("/icons/mateu.svg", MateuViewManager::class.java)
        }.also {
            // One delegating group for the whole tool window: it surfaces the SELECTED tab's actions
            // (plain tool windows don't render per-Content action groups).
            it.setTitleActions(listOf(toolWindowTitleGroup(it)))
        }
        val content = ContentFactory.getInstance().createContent(panel, title, false)
        content.putUserData(MATEU_VIEW_CTX, ctx)
        // This view's SetWindowTitle names its own tab (e.g. "All products").
        ctx.titleConsumer = { t -> content.displayName = t }
        ctx.lastWindowTitle?.let { content.displayName = it }
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
        // Refresh the strip the moment the view republishes its buttons (e.g. view → edit) —
        // ActivityTracker alone leaves the toolbar waiting for the IDE's lazy update tick.
        ctx.onViewActionsChanged = {
            ActivityTracker.getInstance().inc()
            toolbar.updateActionsAsync()
        }
        val wrapper = JPanel(BorderLayout())
        wrapper.add(toolbar.component, BorderLayout.NORTH)
        wrapper.add(panel, BorderLayout.CENTER)

        val file = MateuVirtualFile(title, wrapper, ctx)
        val fem = FileEditorManager.getInstance(project)
        // This view's SetWindowTitle names its editor tab (e.g. "Product Producto 1").
        ctx.titleConsumer = { t ->
            file.presentableTitle = t
            FileEditorManagerEx.getInstanceEx(project).updateFilePresentation(file)
        }
        ctx.lastWindowTitle?.let { file.presentableTitle = it }
        fem.openFile(file, true)
        return { fem.openFile(file, true) }
    }

    companion object {
        private const val RESULTS_ID = "MateuResults"
    }
}
