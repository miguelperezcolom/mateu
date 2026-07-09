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
            },
        )
        stripVcsFromMainToolbar()
    }

    private fun hideForeignToolWindows(twm: ToolWindowManager) {
        for (id in twm.toolWindowIds) {
            if (id in KEEP) continue
            val tw = twm.getToolWindow(id) ?: continue
            if (tw.isAvailable) tw.setAvailable(false)
        }
    }

    private fun stripVcsFromMainToolbar() {
        runCatching {
            val am = ActionManager.getInstance()
            val group = am.getAction("MainToolbarLeft") as? DefaultActionGroup ?: return
            for (child in group.getChildActionsOrStubs()) {
                val id = am.getId(child) ?: continue
                if (id.contains("vcs", ignoreCase = true)) group.remove(child)
            }
        }
    }

    companion object {
        private val KEEP = setOf("Mateu", "MateuResults")
    }
}
