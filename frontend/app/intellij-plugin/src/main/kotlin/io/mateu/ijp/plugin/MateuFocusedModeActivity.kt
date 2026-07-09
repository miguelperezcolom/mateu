package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.application.EDT
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity
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
        val focused = loadMateuConfig().focused
        withContext(Dispatchers.EDT) {
            // Boot the Mateu app right away: the app-menu toolbar widget and the Search
            // Everywhere actions must exist without opening the navigator panel first.
            project.service<MateuProjectService>().ensureBooted()
            if (focused) applyFocusedMode(project)
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
                    }
                }
            }, delaySeconds, java.util.concurrent.TimeUnit.SECONDS)
        }
        // 'More tool windows' lists the DECLARED extensions, registered lazily — setAvailable can't
        // touch what doesn't exist yet. Unregister the foreign declarations outright.
        unregisterForeignToolWindowEps()
        stripVcsFromMainToolbar()
        // The run/debug widget on the window header (new-UI main toolbar, right side).
        stripFromMainToolbar("MainToolbarRight") {
            it.contains("run", ignoreCase = true) ||
                it.contains("debug", ignoreCase = true) ||
                it.contains("profil", ignoreCase = true) ||
                it.contains("coverage", ignoreCase = true)
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

    private fun hideForeignToolWindows(twm: ToolWindowManager) {
        for (id in twm.toolWindowIds) {
            if (id in KEEP) continue
            val tw = twm.getToolWindow(id) ?: continue
            if (tw.isAvailable) tw.setAvailable(false)
            // Stubborn ones (Commit/Run/Debug/Hierarchy) can flip availability back on their own
            // triggers even without a visible state change — force them off unconditionally.
            if (id in STUBBORN) tw.setAvailable(false)
        }
    }

    private fun stripVcsFromMainToolbar() {
        stripFromMainToolbar("MainToolbarLeft") { it.contains("vcs", ignoreCase = true) }
    }

    /** Remove children of a main-toolbar group whose action id matches [matches]. */
    private fun stripFromMainToolbar(groupId: String, matches: (String) -> Boolean) {
        runCatching {
            val am = ActionManager.getInstance()
            val group = am.getAction(groupId) as? DefaultActionGroup ?: return
            for (child in group.getChildActionsOrStubs()) {
                val id = am.getId(child) ?: continue
                if (matches(id)) group.remove(child)
            }
        }
    }

    companion object {
        private val KEEP = setOf("Mateu", "MateuResults")
        private val STUBBORN = setOf("Commit", "Run", "Debug", "Hierarchy", "Services", "Problems View")
    }
}
