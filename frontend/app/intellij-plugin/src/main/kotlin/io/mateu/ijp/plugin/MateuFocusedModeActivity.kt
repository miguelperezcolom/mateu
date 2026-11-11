package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.application.EDT
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity
import com.intellij.openapi.wm.ToolWindowId
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.openapi.wm.ex.ToolWindowManagerListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * **Focused mode** (`mateu.focused=true`, the default): the IDE becomes a clean shell for the Mateu
 * app — every tool window except Mateu's (Project, Structure, Services, Version Control, Terminal…)
 * is made unavailable (stripe buttons gone), and the VCS widget is stripped from the new-UI main
 * toolbar. Tool windows registered lazily later are hidden as they appear, and windows that
 * re-enable themselves (e.g. VCS on repo detection) are re-hidden on state changes.
 * Set `mateu.focused=false` in application.properties to keep the full IDE.
 */
class MateuFocusedModeActivity : ProjectActivity {

    override suspend fun execute(project: Project) {
        val cfg = loadMateuConfig(project)
        val focused = cfg.focused
        // Not a Mateu project (no backend configured, not the standalone distribution): stay out of
        // the way — no boot, no HTTP, no tool window popping open.
        if (!cfg.configured) return
        // The desktop app keeps itself up to date (a no-op anywhere else; see io.mateu.ijp.update).
        if (cfg.standalone) io.mateu.ijp.update.MateuUpdater.startBackgroundChecks()
        withContext(Dispatchers.EDT) {
            if (focused) {
                // Explicit-save UX (app-shell only): Mateu authors edit and save WHEN THEY DECIDE
                // (Ctrl+S), the IDE's own save. So turn OFF IntelliJ's automatic saving (which
                // otherwise writes on frame deactivation / idle and makes edits look auto-saved —
                // worsened by the visual editor's JCEF window, whose focus grabs read as the IDE frame
                // deactivating), and make the unsaved state VISIBLE by marking modified tabs with an
                // asterisk. Gated: a normal Marketplace install must not silently change a developer's
                // global auto-save setting.
                com.intellij.ide.GeneralSettings.getInstance().apply {
                    isSaveOnFrameDeactivation = false
                    isAutoSaveIfInactive = false
                }
                com.intellij.ide.ui.UISettings.getInstance().apply {
                    markModifiedTabsWithAsterisk = true
                    fireUISettingsChanged()
                }
            }
            // Earliest: stop the Project view's ScopeViewPane from being built — its constructor
            // registers a scopes listener that later NPEs (ContentUI null) because we never show the
            // Project view, surfacing the "IDE error occurred" balloon.
            if (focused) disableScopeViewPane(project)
            // Boot the Mateu app right away: the app-menu toolbar widget and the Search
            // Everywhere actions must exist without opening the navigator panel first.
            project.service<MateuProjectService>().ensureBooted()
            if (focused) {
                applyFocusedMode(project)
                installQuitOnClose()
            }
            // Open the Mateu navigator (menu) so the app is visible on launch, not just a stripe button.
            ToolWindowManager.getInstance(project).getToolWindow("Mateu")?.activate(null)
        }
    }

    /** Standalone-app behaviour: closing the (only) window quits the app instead of dropping to the
     *  IDE Welcome / "open project" screen. Hooked once for the whole application. */
    private fun installQuitOnClose() {
        if (quitHooked) return
        quitHooked = true
        val app = com.intellij.openapi.application.ApplicationManager.getApplication()
        val onClosed = {
            val open = com.intellij.openapi.project.ProjectManager.getInstance().openProjects.size
            if (open == 0) {
                // force=true: on macOS a non-forced exit just shows the Welcome frame and stays alive.
                // invokeLater: don't call exit from inside the close callback.
                app.invokeLater { app.exit(true, true, false) }
            }
        }
        val conn = app.messageBus.connect()
        // 2025.x: ProjectManagerListener.projectClosed is no longer delivered — ProjectCloseListener is.
        conn.subscribe(
            com.intellij.openapi.project.ProjectCloseListener.TOPIC,
            object : com.intellij.openapi.project.ProjectCloseListener {
                override fun projectClosed(project: Project) = onClosed()
            },
        )
    }

    /** Unregister the ScopeViewPane project-view pane so it is never constructed (its constructor
     *  registers a NamedScopesHolder listener that NPEs when we don't show the Project view). By
     *  class, so we don't instantiate the panes just to find it. */
    private fun disableScopeViewPane(project: Project) {
        runCatching {
            val point = com.intellij.ide.projectView.impl.AbstractProjectViewPane.EP.getPoint(project)
            point.unregisterExtension(com.intellij.ide.scopeView.ScopeViewPane::class.java)
        }
    }

    /**
     * The UI's menu is NAVIGATION, and navigation sits on the left — IntelliJ's own Project view,
     * every desktop app, Mateu's web shells. plugin.xml anchors it on the right because in a
     * developer's IDE the left belongs to Project; the desktop app has no Project view.
     *
     * Applied on EVERY start (each delayed sweep, since the platform restores the saved layout after
     * the first pass). A one-shot app-wide flag did not hold: the window layout is saved PER PROJECT
     * and the hub opens a project per UI, so the next one came back with plugin.xml's right anchor
     * while the flag said "done". The desktop app's layout is fixed, like its toolbar.
     */
    private fun menuToTheLeft(twm: ToolWindowManager) {
        // on 2025.2 a tool-window change before the frame's pane exists throws (see the CLAUDE.md
        // note) — the next sweep tries again
        runCatching {
            val tw = twm.getToolWindow("Mateu") ?: return
            val left = com.intellij.openapi.wm.ToolWindowAnchor.LEFT
            if (tw.anchor != left) tw.setAnchor(left, null)
        }
    }

    private fun applyFocusedMode(project: Project) {
        val twm = ToolWindowManager.getInstance(project)
        // The first pass waits for the tool-window pane (see hideForeignToolWindows).
        twm.invokeLater {
            if (!project.isDisposed) {
                hideForeignToolWindows(twm)
                menuToTheLeft(twm)
            }
        }
        project.messageBus.connect().subscribe(
            ToolWindowManagerListener.TOPIC,
            object : ToolWindowManagerListener {
                override fun toolWindowsRegistered(ids: MutableList<String>, toolWindowManager: ToolWindowManager) {
                    hideForeignToolWindows(toolWindowManager)
                }

                override fun stateChanged(toolWindowManager: ToolWindowManager) {
                    // Some windows re-enable themselves (VCS on repo detection, Services…): re-hide.
                    hideForeignToolWindows(toolWindowManager)
                }

                override fun toolWindowShown(toolWindow: com.intellij.openapi.wm.ToolWindow) {
                    if (toolWindow.id !in KEEP) runCatching {
                        toolWindow.setAvailable(false)
                        // stateChanged alone does not hide a window that is already OPEN
                        if (toolWindow.id in HIDE_ONLY) toolWindow.hide()
                    }
                }
            },
        )
        // Late registrants (Commit on VCS detection, Run/Debug on first execution, Hierarchy…)
        // slip between events on some startups: sweep again a few times after opening.
        for (delaySeconds in longArrayOf(1, 2, 5, 15)) {
            com.intellij.util.concurrency.AppExecutorUtil.getAppScheduledExecutorService().schedule({
                com.intellij.openapi.application.ApplicationManager.getApplication().invokeLater {
                    if (!project.isDisposed) {
                        hideForeignToolWindows(ToolWindowManager.getInstance(project))
                        menuToTheLeft(ToolWindowManager.getInstance(project))
                        unregisterForeignToolWindowEps()
                        unregisterForeignActivateActions()
                        // Plugins that load late add their widgets to the header toolbar — prune it on each sweep.
                        pruneMainToolbar()
                    }
                }
            }, delaySeconds, java.util.concurrent.TimeUnit.SECONDS)
        }
        // 'More tool windows' lists the DECLARED extensions, registered lazily — setAvailable can't
        // touch what doesn't exist yet. Unregister the foreign declarations outright.
        unregisterForeignToolWindowEps()
        unregisterForeignActivateActions()
        disableBuildActions()
        pruneMainToolbar()
        hideNavigationChrome()
        stripMainMenu()
    }

    /**
     * Strip the new-UI header toolbar down to Mateu's own widgets (the app menu, the hub's «My UIs»)
     * plus Search and Settings. It used to hide the whole `MainToolbar` component, which never took
     * on 2025.2 (the project widget and «Version control» stayed) and, had it worked, would have
     * hidden the hub switch too — so prune the GROUPS instead: the project widget, the VCS widget,
     * the file name, the run/debug widget, Code With Me… everything a desktop app user has no use for.
     */
    private fun pruneMainToolbar() {
        runCatching {
            val am = ActionManager.getInstance()
            var changed = false
            for (groupId in MAIN_TOOLBAR_GROUPS) {
                val group = am.getAction(groupId) as? DefaultActionGroup ?: continue
                for (child in group.getChildActionsOrStubs()) {
                    val id = am.getId(child)
                    if (id != null && (id.startsWith("io.mateu.") || id in MAIN_TOOLBAR_KEEP)) continue
                    // An unnamed child is a separator or an anonymous group: drop it too, or the
                    // pruned bar keeps stray dividers.
                    group.remove(child)
                    changed = true
                }
            }
            if (changed) com.intellij.ide.ActivityTracker.getInstance().inc()
        }
    }

    /** The IDE's build/run actions go away (their shortcuts with them): nothing to compile here. */
    private fun disableBuildActions() {
        runCatching {
            val am = ActionManager.getInstance()
            for (id in BUILD_ACTIONS) if (am.getAction(id) != null) runCatching { am.unregisterAction(id) }
        }
    }

    /** Reduce the native menu bar to the essentials — drop the dev-oriented top menus. */
    private fun stripMainMenu() {
        val remove = { id: String ->
            id in setOf("GoToMenu", "CodeMenu", "RefactoringMenu", "BuildMenu", "RunMenu", "AnalyzeMenu") ||
                id.contains("Vcs", ignoreCase = true)
        }
        runCatching {
            val am = ActionManager.getInstance()
            val menu = am.getAction("MainMenu") as? DefaultActionGroup ?: return
            for (child in menu.getChildActionsOrStubs()) {
                val id = am.getId(child) ?: continue
                if (remove(id)) menu.remove(child)
            }
        }
    }

    /** The navigation bar shows the project path ("workspace › …") — another IDE tell; hide it. */
    private fun hideNavigationChrome() {
        runCatching {
            val ui = com.intellij.ide.ui.UISettings.getInstance()
            ui.showNavigationBar = false
            ui.fireUISettingsChanged()
        }
    }

    /** Drop the tool-window EXTENSION declarations that aren't ours: they vanish from every
     *  list (including More tool windows) and can no longer lazily register. */
    private fun unregisterForeignToolWindowEps() {
        runCatching {
            val epName = com.intellij.openapi.wm.ToolWindowEP.EP_NAME
            val point = epName.point
            for (ext in epName.extensionList.toList()) {
                if (ext.id in KEEP || ext.id in HIDE_ONLY) continue
                runCatching { unregisterExtensionInstance(point, ext) }
            }
        }
    }

    /**
     * `ExtensionPoint.unregisterExtension(T)` is deprecated on 252 and 253, and its suggested
     * replacements don't fit a BEAN extension point: `unregisterExtension(Class)` matches by class and
     * every `<toolWindow>` is a `ToolWindowEP` (it would drop ours too), and
     * `unregisterExtensions(BiPredicate, …)` hands out the `@ApiStatus.Internal`
     * `ExtensionComponentAdapter`. So the instance overload is called reflectively, isolated here:
     * if the platform ever removes it the lookup fails inside the caller's `runCatching` and the
     * tool-window sweep ([hideForeignToolWindows]) still hides the window.
     */
    private fun unregisterExtensionInstance(point: com.intellij.openapi.extensions.ExtensionPoint<*>, ext: Any) {
        com.intellij.openapi.extensions.ExtensionPoint::class.java
            .getMethod("unregisterExtension", Any::class.java)
            .invoke(point, ext)
    }

    /** 'More tool windows' is built from the `Activate<Id>ToolWindow` ACTIONS, not the tool-window
     *  manager — so unregistering a foreign window leaves its activate action (and its entry) behind.
     *  Drop every activate-tool-window action that isn't ours. */
    private fun unregisterForeignActivateActions() {
        runCatching {
            val am = ActionManager.getInstance()
            for (id in am.getActionIdList("Activate").toList()) {
                if (!id.endsWith("ToolWindow")) continue
                if (KEEP.any { id.contains(it) }) continue
                runCatching { am.unregisterAction(id) }
            }
        }
    }

    private var sweeping = false

    private fun hideForeignToolWindows(twm: ToolWindowManager) {
        // unregisterToolWindow fires stateChanged → re-enters this method; guard against recursion.
        if (sweeping) return
        sweeping = true
        try {
            for (id in twm.toolWindowIds.toList()) {
                if (id in KEEP) continue
                val window = twm.getToolWindow(id) ?: continue
                // Fully REMOVE foreign windows (Run/Debug/Hierarchy/Commit…) so they vanish from
                // 'More tool windows' too — setAvailable(false) only drops the stripe button.
                // ToolWindow.remove() is the non-deprecated form of unregisterToolWindow(id).
                // Each window on its own: on 2025.2, before the frame's tool-window pane exists, remove()
                // throws ("Can't find service … LocalProjectSession") and setAvailable NPEs. Uncaught,
                // that one window aborted the WHOLE startup activity — no sweep, no later passes, and
                // Services / Version control stayed on the stripe. The later passes retry.
                // The Project view is only HIDDEN: removing it disposes its content manager, and the
                // platform's ScopeViewPane (built before this activity runs) later adds a pane to it on
                // a scopes change → NPE "this.myUI is null" and the IDE-error balloon on every start.
                if (id !in HIDE_ONLY && runCatching { window.remove() }.isSuccess) continue
                runCatching { window.setAvailable(false) }
            }
        } finally {
            sweeping = false
        }
    }

    companion object {
        private val KEEP = setOf("Mateu", MateuAssistantToolWindow.ID) // the ids declared in plugin.xml, spelled exactly

        /** Foreign windows other platform code still talks to: hidden, never removed or unregistered. */
        // Build: a compilation the IDE starts on its own (CompileDirty on a Java project) adds its
        // output to it — removed, that threw "parent Build has already been disposed" on start.
        private val HIDE_ONLY = setOf(
            ToolWindowId.PROJECT_VIEW, "Build", ToolWindowId.RUN, ToolWindowId.DEBUG,
            ToolWindowId.MESSAGES_WINDOW, ToolWindowId.PROBLEMS_VIEW, ToolWindowId.SERVICES,
        )

        /** Build and run actions a desktop app has no use for — a key press must not start a compile. */
        private val BUILD_ACTIONS = listOf("CompileDirty", "CompileProject", "Compile", "MakeModule", "BuildArtifact", "Run", "Debug", "RunClass", "DebugClass")

        /** The new-UI header toolbar's groups ([pruneMainToolbar]). */
        private val MAIN_TOOLBAR_GROUPS = listOf("MainToolbarLeft", "MainToolbarCenter", "MainToolbarRight")

        /** Platform header actions a desktop app keeps: Mateu registers its screens and menu in
         *  Search Everywhere, and Settings is where the theme and the font size live. */
        private val MAIN_TOOLBAR_KEEP = setOf("SearchEverywhere", "SettingsEntryPoint")

        @Volatile
        private var quitHooked = false
    }
}
