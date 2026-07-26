package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.application.EDT
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.openapi.wm.WindowManager
import com.intellij.openapi.wm.ex.ToolWindowManagerEx
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
        val focused = loadMateuConfig().focused
        withContext(Dispatchers.EDT) {
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
            @Suppress("DEPRECATION")
            point.unregisterExtension(com.intellij.ide.scopeView.ScopeViewPane::class.java)
        }
    }

    private fun applyFocusedMode(project: Project) {
        val twm = ToolWindowManager.getInstance(project)
        hideForeignToolWindows(twm)
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
                    if (toolWindow.id !in KEEP) toolWindow.setAvailable(false)
                }
            },
        )
        // Late registrants (Commit on VCS detection, Run/Debug on first execution, Hierarchy…)
        // slip between events on some startups: sweep again a few times after opening.
        for (delaySeconds in longArrayOf(2, 5, 15)) {
            com.intellij.util.concurrency.AppExecutorUtil.getAppScheduledExecutorService().schedule({
                com.intellij.openapi.application.ApplicationManager.getApplication().invokeLater {
                    if (!project.isDisposed) {
                        hideForeignToolWindows(ToolWindowManager.getInstance(project))
                        unregisterForeignToolWindowEps()
                        unregisterForeignActivateActions()
                        // The header toolbar is often built AFTER our first pass — hide it on each sweep.
                        hideMainToolbar(project)
                    }
                }
            }, delaySeconds, java.util.concurrent.TimeUnit.SECONDS)
        }
        // 'More tool windows' lists the DECLARED extensions, registered lazily — setAvailable can't
        // touch what doesn't exist yet. Unregister the foreign declarations outright.
        unregisterForeignToolWindowEps()
        unregisterForeignActivateActions()
        hideMainToolbar(project)
        hideNavigationChrome()
        stripMainMenu()
    }

    /** Hide the whole new-UI header toolbar (project "workspace" popup, Version control, run
     *  targets, AI, search…) — individual widgets can't be removed via action groups in the New UI,
     *  so we hide the MainToolbar Swing component itself, leaving the window controls + title. */
    private fun hideMainToolbar(project: Project) {
        runCatching {
            val root = WindowManager.getInstance().getFrame(project)?.rootPane ?: return
            hideComponentsByClass(root, "headertoolbar.MainToolbar")
        }
    }

    /** Depth-first: set every component whose class name contains [needle] invisible. */
    private fun hideComponentsByClass(c: java.awt.Component, needle: String) {
        if (c.javaClass.name.contains(needle)) {
            c.isVisible = false
            return
        }
        if (c is java.awt.Container) for (child in c.components) hideComponentsByClass(child, needle)
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
            for (ext in epName.extensionList.toList()) {
                if (ext.id in KEEP) continue
                @Suppress("DEPRECATION")
                runCatching { epName.point.unregisterExtension(ext) }
            }
        }
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
            val ex = twm as? ToolWindowManagerEx
            for (id in twm.toolWindowIds.toList()) {
                if (id in KEEP) continue
                // Fully REMOVE foreign windows (Run/Debug/Hierarchy/Commit…) so they vanish from
                // 'More tool windows' too — setAvailable(false) only drops the stripe button.
                if (ex != null && runCatching { ex.unregisterToolWindow(id) }.isSuccess) continue
                twm.getToolWindow(id)?.setAvailable(false)
            }
        } finally {
            sweeping = false
        }
    }

    companion object {
        private val KEEP = setOf("Mateu", "MateuResults")

        @Volatile
        private var quitHooked = false
    }
}
