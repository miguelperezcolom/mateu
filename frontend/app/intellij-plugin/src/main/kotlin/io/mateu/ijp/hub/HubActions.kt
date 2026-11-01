package io.mateu.ijp.hub

import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.DumbAwareAction
import io.mateu.ijp.plugin.MateuProjectService
import io.mateu.ijp.plugin.loadMateuConfig

/** The hub's actions only exist in the hub build, and only while a UI is open (the list has its own buttons). */
private fun AnActionEvent.openHubEntry(): HubEntry? {
    val project = project ?: return null
    if (!loadMateuConfig(project).hub) return null
    val id = project.getService(MateuProjectService::class.java).hubEntryId ?: return null
    return HubStore.getInstance().list.get(id)
}

/** ⇄ My UIs: back to the list (the open UI closes; its sign-in stays). */
class HubSwitchAction : DumbAwareAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.openHubEntry() != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        e.project?.getService(MateuProjectService::class.java)?.showHub()
    }
}

/** Share this UI: its QR code, to open it on a phone (the add link — an address, never a sign-in). */
class HubShareAction : DumbAwareAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.openHubEntry() != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val entry = e.openHubEntry() ?: return
        ShareDialog(project, "Share ${entry.name}", HubLinks.addLink(entry.baseUrl), "Scan it with a phone: it opens ${HubLinks.domainOf(entry.baseUrl)} in the Mateu app.").show()
    }
}

/** Add a UI… from anywhere (Search Everywhere, the menu) while a UI is open. */
class HubAddAction : DumbAwareAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project?.let { loadMateuConfig(it).hub } == true
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val service = project.getService(MateuProjectService::class.java)
        val dialog = AddUiDialog(project)
        if (dialog.showAndGet()) HubAdd.run(project, dialog.text(), HubStore.getInstance(), service::openHubEntry)
    }
}
