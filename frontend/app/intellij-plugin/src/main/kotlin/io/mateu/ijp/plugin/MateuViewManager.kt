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
import com.intellij.openapi.vfs.VirtualFile
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Places Mateu views the IntelliJ-native way. Every screen a menu entry opens — a listing included —
 * is a **central editor tab**: a listing is an app's main screen, not a transient result, and the
 * bottom panel (IntelliJ's place for Find / Run / Problems) showed it as a short strip of three rows
 * while the centre stayed unchanged. The record a listing row opens goes to the **preview tab**: one
 * tab reused row after row (IntelliJ's own single-click preview), kept for good once it holds work —
 * unsaved changes, an edit / new form — or the user pins it. Browse the listing beside the record
 * with the editor's Split Right; the record's previous / next buttons walk the list too.
 *
 * Each tab renders the view's toolbar natively (see [viewActionGroup]): an ActionToolbar strip on top.
 */
class MateuViewManager(private val project: Project, private val session: AppSession) {
    private companion object {
        val LOG = com.intellij.openapi.diagnostic.Logger.getInstance(MateuViewManager::class.java)
    }


    // key ("sst::route") → the tab showing that view, re-focused by the next click on its menu entry.
    // Only while the tab is OPEN: closing it disposes the view, and refocusing that dead view made the
    // entry do nothing at all on every later click (Visits, Loans… once their tab had been closed).
    private val focusByKey = HashMap<String, MateuVirtualFile>()

    private fun openTabFor(key: String): MateuVirtualFile? {
        val file = focusByKey[key] ?: return null
        if (FileEditorManager.getInstance(project).isFileOpen(file) && file.ctx?.isDisposed != true) return file
        focusByKey.remove(key)
        return null
    }

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
                    if (!ctx.dirty) return
                    // Veto semantics (the platform has no real veto for editor tabs): restore the
                    // tab SYNCHRONOUSLY — same EDT event, so the gap never paints — then ask, and
                    // close again only if the user discards.
                    source.openFile(file, true)
                    ApplicationManager.getApplication().invokeLater {
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

    /** Menu entry → view, in an editor tab of its own. */
    fun openView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = false)

    /** A menu entry / home of ANOTHER backend → a view whose context runs against that backend. */
    fun openRemoteView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?, baseUrl: String) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = false, baseUrl = baseUrl)

    /** Row detail → the preview tab (see the class comment); a New form → a fresh tab of its own. */
    fun openDetail(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) =
        open(label, route, consumedRoute, serverSideType, actionId, preferEditor = true)

    /** The record a listing row opened last, while it is still a preview (replaced by the next row). */
    private var detailPreview: MateuVirtualFile? = null
    private var detailPreviewKey: String? = null

    /** A preview the user started working in, or pinned, keeps its tab: the next row opens another. */
    private fun keepsItsTab(file: MateuVirtualFile): Boolean {
        val ctx = file.ctx ?: return true
        if (ctx.dirty) return true
        val route = ctx.currentRoute.orEmpty().trimEnd('/')
        if (route.endsWith("/edit") || route.endsWith("/new")) return true
        return FileEditorManagerEx.getInstanceEx(project).windows.any { it.isFilePinned(file) }
    }

    /** Brings an open view's tab to the front: its editor window first (a split, another window),
     *  then the tab — a bare openFile on an open file sometimes left the current tab showing. */
    private fun showTab(file: MateuVirtualFile) {
        val fem = FileEditorManagerEx.getInstanceEx(project)
        fem.windows.firstOrNull { it.isFileOpen(file) }?.setAsCurrentWindow(true)
        fem.openFile(file, true, true)
        if (file !in fem.selectedFiles) {
            LOG.warn("tab '${file.presentableTitle}' was not selected after openFile: selecting its editor")
            fem.windows.firstOrNull { it.isFileOpen(file) }?.let { w -> w.setAsCurrentWindow(true); fem.openFile(file, true, true) }
        }
    }

    /** Closes the current preview tab unless it holds work; the next record takes its place. */
    private fun releasePreview() {
        val old = detailPreview ?: return
        detailPreview = null
        val oldKey = detailPreviewKey
        detailPreviewKey = null
        val fem = FileEditorManager.getInstance(project)
        if (!fem.isFileOpen(old) || keepsItsTab(old)) return
        oldKey?.let(focusByKey::remove)
        fem.closeFile(old)
    }

    /** The transient preview tab an assistant-rendered screen lives in (one at a time). */
    private var previewFile: MateuVirtualFile? = null

    /**
     * An assistant-rendered screen (render-screen, target content): shown in ONE preview editor tab,
     * replacing the previous preview — transient: the next navigation closes it, so the real screen
     * is what shows again.
     */
    fun showPreview(title: String, panel: JComponent, ctx: AppContext) {
        closePreview()
        val scroll = com.intellij.ui.components.JBScrollPane(FillOrScrollPanel(panel))
        scroll.border = null
        val file = MateuVirtualFile(title, io.mateu.ijp.ui.blockable(ctx, scroll), ctx)
        previewFile = file
        FileEditorManager.getInstance(project).openFile(file, true)
    }

    private fun closePreview() {
        val file = previewFile ?: return
        previewFile = null
        file.ctx?.dispose()
        FileEditorManager.getInstance(project).closeFile(file)
    }

    private fun open(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?, preferEditor: Boolean, baseUrl: String? = null) {
        // navigating anywhere (even back to the same entry) shows the real screen again
        closePreview()
        // "New" views are never cached/re-focused: every New opens a FRESH editor tab, so several
        // drafts can be edited side by side (each with its own context and state).
        val cacheable = !route.orEmpty().trimEnd('/').endsWith("/new")
        val key = "${baseUrl.orEmpty()}::${serverSideType.orEmpty()}::${route.orEmpty()}"
        val reused = if (cacheable) openTabFor(key) else null
        if (reused != null) { showTab(reused); return }

        val title = label.ifBlank { route ?: "View" }
        val ctx = AppContext(io.mateu.ijp.ui.remoteSession(session, baseUrl))
        ctx.ownsSession = ctx.session !== session
        val panel = ctx.newSlot()
        ctx.contentPane = panel
        // Both hosts (editor header / tool window title) show the view's toolbar natively.
        ctx.nativeToolbarHost = true
        ctx.onViewActionsChanged = { ActivityTracker.getInstance().inc() }
        // Swallow SetWindowTitle until a host mounts (else it would clobber the navigator's tool
        // window title); the host reads ctx.lastWindowTitle on attach and takes over.
        ctx.titleConsumer = {}
        // A menu entry's tab appears AT ONCE, showing "Loading…" until the server answers: placed on
        // the first content, a slow or failed answer left the click looking ignored. (A row's record
        // still waits for its content: it may replace the current preview tab.)
        val placedNow = if (!preferEditor) placeEditor(ctx, panel, title).also { if (cacheable) focusByKey[key] = it } else null
        ctx.onFirstContent = { isCrud ->
            // Row detail / New / Edit navigations from a listing open in a central editor tab — wire
            // this for EVERY crud, so a listing hosted in the editor (e.g. the home screen) drills
            // down just like one in the bottom tool window.
            if (isCrud) {
                ctx.detailOpener = { dLabel, dRoute, dConsumed, dSst -> openDetail(dLabel, dRoute, dConsumed, dSst, null) }
            }
            // a record opened from a row is a preview; a New form is work from the start
            val preview = preferEditor && cacheable
            if (preview) releasePreview()
            val file = placedNow ?: placeEditor(ctx, panel, title)
            if (preview) {
                detailPreview = file
                detailPreviewKey = key
            }
            if (cacheable) focusByKey[key] = file
        }
        ctx.navigate(route, consumedRoute, serverSideType, actionId)
    }

    /**
     * Reloads every open Mateu view from scratch (the Reload of the version-skew notices): each
     * editor tab and results tab re-runs its load against its own route — a redeployed backend
     * answers with the new screen. The transient preview tab is closed instead.
     */
    fun reloadAll() {
        closePreview()
        val contexts = LinkedHashSet<AppContext>()
        FileEditorManager.getInstance(project).openFiles.filterIsInstance<MateuVirtualFile>().mapNotNullTo(contexts) { it.ctx }
        for (ctx in contexts) {
            ctx.setDirtyState(false)
            ctx.navigate(ctx.currentRoute, ctx.currentConsumedRoute, ctx.currentServerSideType, null)
        }
        // the tasks of this IDE session no stream follows any more are picked up again
        session.reattachTasks()
    }

    /** A view → an editor tab with a native ActionToolbar strip on top: the tab's file + how to refocus it. */
    private fun placeEditor(ctx: AppContext, panel: JComponent, title: String): MateuVirtualFile {
        val toolbar = ActionManager.getInstance().createActionToolbar(ActionPlaces.EDITOR_TOOLBAR, viewActionGroup(ctx), true)
        toolbar.targetComponent = panel
        // Refresh the strip the moment the view republishes its buttons (e.g. view → edit) —
        // ActivityTracker alone leaves the toolbar waiting for the IDE's lazy update tick.
        ctx.onViewActionsChanged = {
            ActivityTracker.getInstance().inc()
            toolbar.updateActionsAsync()
        }
        // Scrollable wrapper: the view fills the tab while it fits and scrolls vertically when it
        // outgrows it (tracksViewportHeight flips on fit, avoiding the collapsed-content trap).
        val scroll = com.intellij.ui.components.JBScrollPane(FillOrScrollPanel(panel))
        scroll.border = null
        scroll.horizontalScrollBarPolicy = javax.swing.ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED
        val wrapper = JPanel(BorderLayout())
        wrapper.add(toolbar.component, BorderLayout.NORTH)
        wrapper.add(scroll, BorderLayout.CENTER)

        val file = MateuVirtualFile(title, io.mateu.ijp.ui.blockable(ctx, wrapper), ctx)
        val fem = FileEditorManager.getInstance(project)
        // This view's SetWindowTitle names its editor tab (e.g. "Product Producto 1").
        ctx.titleConsumer = { t ->
            file.presentableTitle = t
            FileEditorManagerEx.getInstanceEx(project).updateFilePresentation(file)
        }
        ctx.lastWindowTitle?.let { file.presentableTitle = it }
        fem.openFile(file, true)
        return file
    }

}

/**
 * Scroll-pane view that FILLS the viewport while the content fits and scrolls (vertically) once the
 * content's preferred height exceeds it — so filling layouts (tables) keep working and long forms
 * become scrollable instead of being squashed.
 */
class FillOrScrollPanel(content: JComponent) : JPanel(BorderLayout()), javax.swing.Scrollable {
    init {
        add(content, BorderLayout.CENTER)
    }

    override fun getPreferredScrollableViewportSize(): java.awt.Dimension = preferredSize
    override fun getScrollableUnitIncrement(visibleRect: java.awt.Rectangle, orientation: Int, direction: Int): Int =
        com.intellij.util.ui.JBUI.scale(16)
    override fun getScrollableBlockIncrement(visibleRect: java.awt.Rectangle, orientation: Int, direction: Int): Int =
        visibleRect.height
    override fun getScrollableTracksViewportWidth(): Boolean = true
    override fun getScrollableTracksViewportHeight(): Boolean {
        val viewport = parent as? javax.swing.JViewport ?: return true
        return viewport.height >= preferredSize.height
    }
}
